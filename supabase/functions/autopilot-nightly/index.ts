// AutoPilot nightly recovery jobs — cron-triggered once a night.
// Same Deno-can't-import-Next.js-lib constraint as autopilot-engine (see that
// function's header comment); this mirrors src/lib/dashboard/clients.ts's
// deriveClients/keyFor grouping logic in compact form — keep in sync if that
// file's tagging/interval logic changes.
//
// Runs three independent checks per stripe_connected shop, after first
// refreshing the persisted `clients` table (the source of truth every check
// below reads from, rather than re-deriving from appointments three times):
//   1. clients refresh — recompute visits/ltv/last visit/avg interval/tag/
//      preferred service+staff for every client, upsert on (shop_id, key).
//      Always a full recompute, never an incremental patch — simpler, and
//      nothing can drift out of sync between runs.
//   2. win-back — personalized per client (daysSinceLastVisit > their own
//      avg_interval_days * 1.5, the same "Overdue" threshold clients.ts
//      already uses), not a fixed 30-37 day window.
//   3. next-visit nudge (flow_key='reminders') — predicted next visit
//      (last_visit_at + avg_interval_days) falls in the next 3 days and they
//      haven't already booked.
//   4. birthday (flow_key='birthday') — date_of_birth's month/day matches
//      today in shop timezone. Real birthdays are only known once a customer
//      account has filled theirs in (src/app/customer/account) — this check
//      is fully built and will correctly process zero clients until that
//      data exists, not faked.
// Every individual client is wrapped in its own try/catch inside each check
// (finer-grained than autopilot-engine's per-shop try/catch) — one bad
// record logs an outcome:'failed' event and the batch continues.

import { createClient } from "jsr:@supabase/supabase-js@2";
import { Resend } from "npm:resend";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

const resend = new Resend(Deno.env.get("RESEND_API_KEY")!);
const FROM = Deno.env.get("RESEND_FROM_EMAIL") ?? "FlatPurse Flow <onboarding@resend.dev>";
const SITE_URL = Deno.env.get("SITE_URL") ?? "https://flowbyffp.vercel.app";
const SHOP_TZ = "America/Edmonton";

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const OVERDUE_MULTIPLIER = 1.5; // matches clients.ts's "Overdue" tag threshold
const WINBACK_COOLDOWN_DAYS = 21;
const REMINDER_LOOKAHEAD_DAYS = 3;
const REMINDER_COOLDOWN_DAYS = 7;
const BIRTHDAY_COOLDOWN_DAYS = 300;
const APPOINTMENT_HISTORY_MS = 730 * MS_PER_DAY; // 2 years, bounds the refresh query

type ApptRow = {
  client_name: string; client_phone: string | null; client_email: string | null;
  service_name: string; staff_id: string | null; starts_at: string; price: number;
  status: string;
};

type ClientGroup = {
  key: string; full_name: string; phone: string | null; email: string | null;
  completed: { starts_at: string; price: number; service_name: string; staff_id: string | null }[];
};

function keyFor(a: { client_phone?: string | null; client_email: string | null; client_name: string }) {
  return (a.client_phone || a.client_email || a.client_name).trim().toLowerCase();
}

function todayInShopTz(now: Date): { month: number; day: number } {
  const parts = new Intl.DateTimeFormat("en-US", { timeZone: SHOP_TZ, month: "numeric", day: "numeric" }).formatToParts(now);
  const month = Number(parts.find(p => p.type === "month")?.value);
  const day = Number(parts.find(p => p.type === "day")?.value);
  return { month, day };
}

function mostFrequent<T>(items: T[]): T | null {
  if (items.length === 0) return null;
  const counts = new Map<T, number>();
  for (const item of items) counts.set(item, (counts.get(item) ?? 0) + 1);
  let best: T | null = null;
  let bestCount = 0;
  for (const [item, count] of counts) {
    if (count > bestCount) { best = item; bestCount = count; }
  }
  return best;
}

async function logEvent(row: {
  shop_id: string; flow_key: string; event_text: string;
  client_name?: string | null; client_email?: string | null; client_id?: string | null;
  amount?: number | null; message_body?: string | null; outcome: "sent" | "failed"; error?: string | null;
}) {
  await supabase.from("autopilot_events").insert(row);
}

// ─── Step 1: refresh the persisted clients table ────────────────────────────

async function refreshClients(shopId: string, now: Date) {
  const historyStart = new Date(now.getTime() - APPOINTMENT_HISTORY_MS);
  const { data: apptsRaw } = await supabase
    .from("appointments")
    .select("client_name, client_phone, client_email, service_name, staff_id, starts_at, price, status")
    .eq("shop_id", shopId)
    .neq("status", "cancelled")
    .gte("starts_at", historyStart.toISOString())
    .lte("starts_at", now.toISOString());

  const groups = new Map<string, ClientGroup>();
  for (const a of (apptsRaw ?? []) as ApptRow[]) {
    const key = keyFor(a);
    if (!groups.has(key)) {
      groups.set(key, { key, full_name: a.client_name, phone: a.client_phone, email: a.client_email, completed: [] });
    }
    const group = groups.get(key)!;
    // Latest appointment (by starts_at) wins for display fields, matching clients.ts.
    if (a.starts_at >= (group.completed[group.completed.length - 1]?.starts_at ?? "")) {
      group.full_name = a.client_name;
      group.phone = a.client_phone;
      group.email = a.client_email;
    }
    if (a.status === "completed") {
      group.completed.push({ starts_at: a.starts_at, price: Number(a.price), service_name: a.service_name, staff_id: a.staff_id });
    }
  }

  // Real birthdays come from the customers table (matched by email), never
  // from appointments — fetch once per shop rather than per client.
  const { data: customersRaw } = await supabase.from("customers").select("email, date_of_birth").not("date_of_birth", "is", null);
  const dobByEmail = new Map((customersRaw ?? []).map(c => [c.email as string, c.date_of_birth as string]));

  const rows = [];
  for (const [key, group] of groups) {
    group.completed.sort((a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime());
    const visits = group.completed.length;
    const lifetimeValue = group.completed.reduce((sum, c) => sum + c.price, 0);
    const lastVisit = group.completed[group.completed.length - 1] ?? null;

    let avgIntervalDays: number | null = null;
    if (visits >= 2) {
      const gaps: number[] = [];
      for (let i = 1; i < group.completed.length; i++) {
        gaps.push((new Date(group.completed[i].starts_at).getTime() - new Date(group.completed[i - 1].starts_at).getTime()) / MS_PER_DAY);
      }
      avgIntervalDays = gaps.reduce((a, b) => a + b, 0) / gaps.length;
    }

    const daysSinceLastVisit = lastVisit ? (now.getTime() - new Date(lastVisit.starts_at).getTime()) / MS_PER_DAY : null;
    let tag: string | null = null;
    if (visits === 0 || visits === 1) tag = "New";
    else if (avgIntervalDays !== null && daysSinceLastVisit !== null && daysSinceLastVisit > avgIntervalDays * 2.5) tag = "Churn risk";
    else if (avgIntervalDays !== null && daysSinceLastVisit !== null && daysSinceLastVisit > avgIntervalDays * OVERDUE_MULTIPLIER) tag = "Overdue";
    else if (visits >= 5 && lifetimeValue >= 500) tag = "VIP";
    else if (visits >= 3) tag = "Loyal";

    const preferredService = mostFrequent(group.completed.map(c => c.service_name));
    const preferredStaff = mostFrequent(group.completed.map(c => c.staff_id).filter((s): s is string => !!s));

    rows.push({
      shop_id: shopId, key, full_name: group.full_name, phone: group.phone, email: group.email,
      date_of_birth: group.email ? dobByEmail.get(group.email) ?? null : null,
      visits_count: visits, lifetime_value: lifetimeValue,
      last_visit_at: lastVisit?.starts_at ?? null, avg_interval_days: avgIntervalDays,
      preferred_service_name: preferredService, preferred_staff_id: preferredStaff,
      tag, updated_at: now.toISOString(),
    });
  }

  if (rows.length > 0) {
    await supabase.from("clients").upsert(rows, { onConflict: "shop_id,key" });
  }
  return rows.length;
}

// ─── Step 2: personalized win-back ──────────────────────────────────────────

async function runWinback(shop: { id: string; name: string; handle: string | null }, now: Date): Promise<number> {
  const { data: clientsRaw } = await supabase
    .from("clients")
    .select("id, full_name, email, last_visit_at, avg_interval_days, preferred_service_name")
    .eq("shop_id", shop.id)
    .not("avg_interval_days", "is", null)
    .not("last_visit_at", "is", null)
    .not("email", "is", null);

  let sent = 0;
  for (const c of clientsRaw ?? []) {
    const daysSince = (now.getTime() - new Date(c.last_visit_at).getTime()) / MS_PER_DAY;
    if (daysSince <= c.avg_interval_days * OVERDUE_MULTIPLIER) continue;

    const cooldownStart = new Date(now.getTime() - WINBACK_COOLDOWN_DAYS * MS_PER_DAY);
    const { data: existing } = await supabase
      .from("autopilot_events").select("id").eq("shop_id", shop.id).eq("flow_key", "winback")
      .eq("client_id", c.id).gte("created_at", cooldownStart.toISOString()).maybeSingle();
    if (existing) continue;

    try {
      const bookingUrl = shop.handle ? `${SITE_URL}/book/${shop.handle}` : SITE_URL;
      const firstName = c.full_name.split(" ")[0];
      const serviceLine = c.preferred_service_name ? ` It's been a while since your last ${c.preferred_service_name}.` : "";
      const html = `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
          <h1 style="font-size: 20px;">We miss you, ${firstName}!</h1>
          <p style="color: #444; font-size: 14px; line-height: 1.6;">
            It's been longer than usual since your last visit to ${shop.name}.${serviceLine} Come back and take 10% off your next visit.
          </p>
          <p style="margin: 24px 0;">
            <a href="${bookingUrl}" style="background: #6d28d9; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">Book now</a>
          </p>
        </div>`;
      const { error: sendError } = await resend.emails.send({ from: FROM, to: c.email, subject: `We miss you at ${shop.name}`, html });
      if (sendError) throw new Error(sendError.message);

      await logEvent({
        shop_id: shop.id, flow_key: "winback", client_id: c.id, client_name: c.full_name, client_email: c.email,
        message_body: html, outcome: "sent",
        event_text: `Sent personalized win-back to ${c.full_name} (${Math.round(daysSince)}d since last visit, usual ~${Math.round(c.avg_interval_days)}d)`,
      });
      sent++;
    } catch (err) {
      await logEvent({
        shop_id: shop.id, flow_key: "winback", client_id: c.id, client_name: c.full_name, client_email: c.email,
        outcome: "failed", error: err instanceof Error ? err.message : String(err),
        event_text: `Failed to send win-back to ${c.full_name}`,
      });
    }
  }
  return sent;
}

// ─── Step 3: next-visit nudge ───────────────────────────────────────────────

async function runReminders(shop: { id: string; name: string; handle: string | null }, now: Date): Promise<number> {
  const { data: clientsRaw } = await supabase
    .from("clients")
    .select("id, full_name, email, last_visit_at, avg_interval_days, preferred_service_name, preferred_staff_id")
    .eq("shop_id", shop.id)
    .not("avg_interval_days", "is", null)
    .not("last_visit_at", "is", null)
    .not("email", "is", null);

  let sent = 0;
  for (const c of clientsRaw ?? []) {
    const predictedNext = new Date(c.last_visit_at).getTime() + c.avg_interval_days * MS_PER_DAY;
    const daysUntil = (predictedNext - now.getTime()) / MS_PER_DAY;
    if (daysUntil < 0 || daysUntil > REMINDER_LOOKAHEAD_DAYS) continue;

    const { data: upcoming } = await supabase
      .from("appointments").select("id").eq("shop_id", shop.id).eq("client_email", c.email)
      .neq("status", "cancelled").gt("starts_at", now.toISOString()).limit(1).maybeSingle();
    if (upcoming) continue;

    const cooldownStart = new Date(now.getTime() - REMINDER_COOLDOWN_DAYS * MS_PER_DAY);
    const { data: existing } = await supabase
      .from("autopilot_events").select("id").eq("shop_id", shop.id).eq("flow_key", "reminders")
      .eq("client_id", c.id).gte("created_at", cooldownStart.toISOString()).maybeSingle();
    if (existing) continue;

    try {
      const params = new URLSearchParams();
      if (c.preferred_service_name) params.set("service", c.preferred_service_name);
      if (c.preferred_staff_id) params.set("staff", c.preferred_staff_id);
      const query = params.toString();
      const bookingUrl = shop.handle ? `${SITE_URL}/book/${shop.handle}${query ? `?${query}` : ""}` : SITE_URL;
      const firstName = c.full_name.split(" ")[0];
      const html = `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
          <h1 style="font-size: 20px;">Time for your next visit, ${firstName}?</h1>
          <p style="color: #444; font-size: 14px; line-height: 1.6;">
            Based on your usual schedule, you're about due for ${c.preferred_service_name ?? "your next appointment"} at ${shop.name}.
          </p>
          <p style="margin: 24px 0;">
            <a href="${bookingUrl}" style="background: #6d28d9; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">Book your usual</a>
          </p>
        </div>`;
      const { error: sendError } = await resend.emails.send({ from: FROM, to: c.email, subject: `Due for your next visit at ${shop.name}?`, html });
      if (sendError) throw new Error(sendError.message);

      await logEvent({
        shop_id: shop.id, flow_key: "reminders", client_id: c.id, client_name: c.full_name, client_email: c.email,
        message_body: html, outcome: "sent",
        event_text: `Sent next-visit nudge to ${c.full_name} (predicted in ${Math.round(daysUntil)}d)`,
      });
      sent++;
    } catch (err) {
      await logEvent({
        shop_id: shop.id, flow_key: "reminders", client_id: c.id, client_name: c.full_name, client_email: c.email,
        outcome: "failed", error: err instanceof Error ? err.message : String(err),
        event_text: `Failed to send next-visit nudge to ${c.full_name}`,
      });
    }
  }
  return sent;
}

// ─── Step 4: birthday offers ─────────────────────────────────────────────────

async function runBirthdays(shop: { id: string; name: string; handle: string | null }, now: Date): Promise<number> {
  const { data: clientsRaw } = await supabase
    .from("clients")
    .select("id, full_name, email, date_of_birth")
    .eq("shop_id", shop.id)
    .not("date_of_birth", "is", null)
    .not("email", "is", null);

  const { month: todayMonth, day: todayDay } = todayInShopTz(now);

  let sent = 0;
  for (const c of clientsRaw ?? []) {
    const dob = new Date(c.date_of_birth + "T00:00:00Z");
    if (dob.getUTCMonth() + 1 !== todayMonth || dob.getUTCDate() !== todayDay) continue;

    const cooldownStart = new Date(now.getTime() - BIRTHDAY_COOLDOWN_DAYS * MS_PER_DAY);
    const { data: existing } = await supabase
      .from("autopilot_events").select("id").eq("shop_id", shop.id).eq("flow_key", "birthday")
      .eq("client_id", c.id).gte("created_at", cooldownStart.toISOString()).maybeSingle();
    if (existing) continue;

    try {
      const bookingUrl = shop.handle ? `${SITE_URL}/book/${shop.handle}` : SITE_URL;
      const firstName = c.full_name.split(" ")[0];
      const html = `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
          <h1 style="font-size: 20px;">Happy birthday, ${firstName}! 🎉</h1>
          <p style="color: #444; font-size: 14px; line-height: 1.6;">
            From everyone at ${shop.name} — enjoy 15% off your next visit this month, on us.
          </p>
          <p style="margin: 24px 0;">
            <a href="${bookingUrl}" style="background: #6d28d9; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">Book your treat</a>
          </p>
        </div>`;
      const { error: sendError } = await resend.emails.send({ from: FROM, to: c.email, subject: `Happy birthday from ${shop.name}!`, html });
      if (sendError) throw new Error(sendError.message);

      await logEvent({
        shop_id: shop.id, flow_key: "birthday", client_id: c.id, client_name: c.full_name, client_email: c.email,
        message_body: html, outcome: "sent",
        event_text: `Sent birthday offer to ${c.full_name}`,
      });
      sent++;
    } catch (err) {
      await logEvent({
        shop_id: shop.id, flow_key: "birthday", client_id: c.id, client_name: c.full_name, client_email: c.email,
        outcome: "failed", error: err instanceof Error ? err.message : String(err),
        event_text: `Failed to send birthday offer to ${c.full_name}`,
      });
    }
  }
  return sent;
}

Deno.serve(async () => {
  const now = new Date();

  const { data: shops, error } = await supabase
    .from("shops")
    .select("id, name, handle, winback_enabled, reminders_enabled, birthday_enabled")
    .eq("stripe_connected", true);

  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 });

  let clientsRefreshed = 0, winbackSent = 0, remindersSent = 0, birthdaySent = 0, failed = 0;
  const errors: string[] = [];

  for (const shop of shops ?? []) {
    try {
      // Client-segmentation refresh is bookkeeping, not customer-facing
      // outreach — it stays unconditional regardless of flow toggles.
      clientsRefreshed += await refreshClients(shop.id, now);
      if (shop.winback_enabled) winbackSent += await runWinback(shop, now);
      if (shop.reminders_enabled) remindersSent += await runReminders(shop, now);
      if (shop.birthday_enabled) birthdaySent += await runBirthdays(shop, now);
    } catch (err) {
      errors.push(`${shop.name}: ${err instanceof Error ? err.message : "Unknown error"}`);
      failed++;
    }
  }

  return new Response(
    JSON.stringify({ shops: (shops ?? []).length, clientsRefreshed, winbackSent, remindersSent, birthdaySent, failed, errors }),
    { headers: { "Content-Type": "application/json" } },
  );
});
