import { createAdminClient } from "@/lib/supabase/admin";
import { sendDigestEmail } from "@/lib/resend";
import { ownerContact } from "@/lib/billing/notices";
import { DEFAULT_TZ, enqueueJob, localParts, nextWeekdayAt, zonedTime } from "@/lib/scheduler";

/**
 * Owner digests on the local-time scheduler (Spec 4 A4 + Part 2 item 8, George Nov 21):
 * Daily Brief at the owner's hour (default 7am local, Pro and up), weekly recap
 * Monday 7am local, Monthly Revenue Wrapped on the 1st at 7am local.
 * Every number comes from the database; no AI-written figures.
 */
type Admin = ReturnType<typeof createAdminClient>;
type Shop = {
  id: string; name: string; owner_id: string; plan: string | null; subscription_status: string | null; trial_override: boolean | null;
  timezone: string | null; daily_brief_hour: number | null; daily_brief_email_enabled: boolean | null; notification_prefs: Record<string, boolean> | null; handle: string | null;
};
const SHOP_COLS = "id, name, owner_id, plan, subscription_status, trial_override, timezone, daily_brief_hour, daily_brief_email_enabled, notification_prefs, handle";
const site = () => (process.env.NEXT_PUBLIC_SITE_URL || "https://flow.flatpurse.com").replace(/\/$/, "");
const money = (n: number) => `C$${n.toFixed(2)}`;
const live = (s: Shop) => Boolean(s.trial_override) || ["active", "trialing", "past_due"].includes(s.subscription_status ?? "");
const briefPlan = (s: Shop) => s.subscription_status === "trialing" || ["pro", "pro_plus", "enterprise"].includes(s.plan ?? "");
const ymd = (tz: string, d: Date) => { const p = localParts(d, tz); return `${p.y}-${String(p.m).padStart(2, "0")}-${String(p.d).padStart(2, "0")}`; };
/** Local midnight `offset` days from the local day containing `at`. */
const dayStart = (tz: string, at: Date, offset = 0) => { const p = localParts(at, tz); return zonedTime(tz, p.y, p.m, p.d + offset, 0); };

/** Makes sure each live shop has its next brief and recaps queued. Idempotent (dedupe keys). */
export async function seedDigestJobs(now = new Date()) {
  const admin = createAdminClient();
  const { data } = await admin.from("shops").select(SHOP_COLS).limit(5000);
  let queued = 0;
  for (const s of (data ?? []) as Shop[]) {
    if (!live(s)) continue;
    const tz = s.timezone ?? DEFAULT_TZ;
    const p = localParts(now, tz);
    const hour = s.daily_brief_hour ?? 7;
    let brief = zonedTime(tz, p.y, p.m, p.d, hour);
    if (brief <= now) brief = zonedTime(tz, p.y, p.m, p.d + 1, hour);
    const monday = nextWeekdayAt(tz, 1, 7, now);
    let first = zonedTime(tz, p.y, p.m, 1, 7);
    if (first <= now) first = zonedTime(tz, p.y, p.m + 1, 1, 7);
    const jobs: [string, Date][] = [["brief.daily", brief], ["recap.weekly", monday], ["recap.monthly", first]];
    for (const [kind, at] of jobs) {
      const { error } = await enqueueJob(kind, at, { shopId: s.id }, { shopId: s.id, dedupeKey: `${kind}:${s.id}:${ymd(tz, at)}` });
      if (!error) queued++;
    }
  }
  return { queued };
}

async function loadShop(admin: Admin, shopId: string) {
  const { data } = await admin.from("shops").select(SHOP_COLS).eq("id", shopId).maybeSingle();
  return (data as Shop | null) ?? null;
}

type Appt = { status: string; price: number | null; paid_amount: number | null; tip_amount: number | null; starts_at: string; service_name: string; created_at: string };
const net = (a: Appt) => Math.max(0, Number(a.paid_amount ?? a.price ?? 0) - Number(a.tip_amount ?? 0));

async function window(admin: Admin, shopId: string, from: Date, to: Date) {
  const [{ data: appts }, { count: newClients }, { data: wins }] = await Promise.all([
    admin.from("appointments").select("status, price, paid_amount, tip_amount, starts_at, service_name, created_at")
      .eq("shop_id", shopId).gte("starts_at", from.toISOString()).lt("starts_at", to.toISOString()).limit(20000),
    admin.from("clients").select("id", { count: "exact", head: true }).eq("shop_id", shopId).gte("created_at", from.toISOString()).lt("created_at", to.toISOString()),
    admin.from("attributions").select("value_cents").eq("shop_id", shopId).eq("status", "completed").gte("completed_at", from.toISOString()).lt("completed_at", to.toISOString()),
  ]);
  const list = (appts ?? []) as Appt[];
  const done = list.filter((a) => a.status === "completed");
  return {
    list, done,
    revenue: done.reduce((t, a) => t + net(a), 0),
    noShows: list.filter((a) => a.status === "no_show").length,
    newClients: newClients ?? 0,
    recovered: (wins ?? []).reduce((t, w) => t + Number(w.value_cents ?? 0) / 100, 0),
  };
}

const TIPS = [
  "Owners who reply to every review within a day get more repeat visits. Check Reviews for anything new.",
  "Put your booking link in your Instagram bio and Google profile so clients can book while you work.",
  "Clients who rebook before they leave come back sooner. Offer the next visit at checkout.",
  "Turn on Win-Back in AutoPilot to bring quiet clients back automatically.",
  "Gaps today? Send Times lets you text open slots to clients who are due.",
];

async function sendBrief(admin: Admin, s: Shop) {
  if (!briefPlan(s) || s.daily_brief_email_enabled === false || s.notification_prefs?.daily_brief === false) return "skipped";
  const { count: ever } = await admin.from("appointments").select("id", { count: "exact", head: true }).eq("shop_id", s.id);
  if (!ever) return "skipped"; // the first booking switches the Daily Brief on
  const tz = s.timezone ?? DEFAULT_TZ;
  const now = new Date();
  const [today, yesterday] = await Promise.all([
    window(admin, s.id, dayStart(tz, now), dayStart(tz, now, 1)),
    window(admin, s.id, dayStart(tz, now, -1), dayStart(tz, now)),
  ]);
  const { data: ap } = await admin.from("autopilot_events").select("outcome").eq("shop_id", s.id).gte("created_at", new Date(now.getTime() - 86_400_000).toISOString());
  const upcoming = today.list.filter((a) => !["cancelled", "no_show"].includes(a.status));
  const pending = today.list.filter((a) => a.status === "pending").length;
  const approvals = (ap ?? []).filter((e) => e.outcome === "pending").length;
  const sent = (ap ?? []).filter((e) => ["sent", "booked"].includes(e.outcome as string)).length;
  const booked = (ap ?? []).filter((e) => e.outcome === "booked").length;

  const sections = [
    { title: "Today", lines: upcoming.length ? [`${upcoming.length} booking${upcoming.length === 1 ? "" : "s"}, ${money(upcoming.reduce((t, a) => t + Number(a.price ?? 0), 0))} expected.`] : [] },
    { title: "Yesterday", lines: [
      yesterday.revenue > 0 ? `Revenue: ${money(yesterday.revenue)} (excluding tips).` : "",
      yesterday.noShows ? `No-shows: ${yesterday.noShows}.` : "",
      yesterday.newClients ? `New clients: ${yesterday.newClients}.` : "",
    ].filter(Boolean) },
    { title: "AutoPilot", lines: [
      sent ? `${sent} message${sent === 1 ? "" : "s"} sent in the last 24 hours.` : "",
      booked ? `${booked} client${booked === 1 ? "" : "s"} booked from them.` : "",
      yesterday.recovered > 0 ? `${money(yesterday.recovered)} recovered yesterday.` : "",
    ].filter(Boolean) },
    { title: "Needs you", lines: [
      pending ? `${pending} booking${pending === 1 ? "" : "s"} today still waiting for you to confirm.` : "",
      approvals ? `${approvals} AutoPilot message${approvals === 1 ? "" : "s"} waiting for your approval.` : "",
    ].filter(Boolean) },
    { title: "Tip", lines: [TIPS[localParts(now, tz).d % TIPS.length]] },
  ];
  const owner = await ownerContact(admin, s.owner_id);
  if (!owner.email) return "skipped";
  const r = await sendDigestEmail(owner.email, {
    shopId: s.id, kind: "daily_brief", subject: `${s.name}: your Daily Brief`, heading: `Good morning${owner.firstName && owner.firstName !== "there" ? `, ${owner.firstName}` : ""}`,
    sections, ctaLabel: "Open today's schedule", ctaUrl: `${site()}/dashboard`,
  });
  if (r.error) throw new Error(r.error.message);
  return "sent";
}

const pct = (a: number, b: number) => (b > 0 ? `${a >= b ? "up" : "down"} ${Math.abs(Math.round(((a - b) / b) * 100))}%` : "");

async function sendRecap(admin: Admin, s: Shop, kind: "weekly" | "monthly") {
  if (!live(s) || s.notification_prefs?.weekly_revenue_recap === false) return "skipped";
  const tz = s.timezone ?? DEFAULT_TZ;
  const now = new Date();
  const p = localParts(now, tz);
  const [curFrom, curTo, prevFrom] = kind === "weekly"
    ? [dayStart(tz, now, -7), dayStart(tz, now), dayStart(tz, now, -14)]
    : [zonedTime(tz, p.y, p.m - 1, 1, 0), zonedTime(tz, p.y, p.m, 1, 0), zonedTime(tz, p.y, p.m - 2, 1, 0)];
  const [cur, prev] = await Promise.all([window(admin, s.id, curFrom, curTo), window(admin, s.id, prevFrom, curFrom)]);
  const vs = (a: number, b: number) => { const t = pct(a, b); return t ? ` (${t} on the ${kind === "weekly" ? "week" : "month"} before)` : ""; };
  const lines = [
    `Revenue: ${money(cur.revenue)}${vs(cur.revenue, prev.revenue)}, excluding tips.`,
    `Completed appointments: ${cur.done.length}${vs(cur.done.length, prev.done.length)}.`,
    `New clients: ${cur.newClients}.`,
    cur.noShows ? `No-shows: ${cur.noShows}.` : "",
    `Recovered by AutoPilot: ${money(cur.recovered)}.`,
  ].filter(Boolean);
  const extra: string[] = [];
  if (kind === "monthly" && cur.done.length) {
    const byDay = new Map<string, number>(); const bySvc = new Map<string, number>();
    for (const a of cur.done) {
      const d = ymd(tz, new Date(a.starts_at)); byDay.set(d, (byDay.get(d) ?? 0) + net(a));
      bySvc.set(a.service_name, (bySvc.get(a.service_name) ?? 0) + 1);
    }
    const [bestDay, bestRev] = [...byDay.entries()].sort((a, b) => b[1] - a[1])[0];
    const [topSvc, topCount] = [...bySvc.entries()].sort((a, b) => b[1] - a[1])[0];
    extra.push(`Best day: ${new Date(`${bestDay}T12:00:00Z`).toLocaleDateString("en-CA", { weekday: "long", month: "long", day: "numeric" })}, ${money(bestRev)}.`);
    extra.push(`Top service: ${topSvc} (${topCount} booked).`);
  }
  const owner = await ownerContact(admin, s.owner_id);
  if (!owner.email) return "skipped";
  const r = await sendDigestEmail(owner.email, {
    shopId: s.id, kind: `recap_${kind}`,
    subject: kind === "weekly" ? `${s.name}: your week in Flow` : `${s.name}: your Revenue Wrapped`,
    heading: kind === "weekly" ? "Your week in Flow" : "Your month in Flow",
    sections: [{ title: kind === "weekly" ? "Last 7 days" : "Last month", lines }, { title: "Highlights", lines: extra }],
    ctaLabel: "Open your dashboard", ctaUrl: `${site()}/dashboard`,
  });
  if (r.error) throw new Error(r.error.message);
  return "sent";
}

export async function runDigestJob(kind: "brief.daily" | "recap.weekly" | "recap.monthly", shopId: string) {
  const admin = createAdminClient();
  const s = await loadShop(admin, shopId);
  if (!s) return "skipped";
  return kind === "brief.daily" ? sendBrief(admin, s) : sendRecap(admin, s, kind === "recap.weekly" ? "weekly" : "monthly");
}
