import { createAdminClient } from "@/lib/supabase/admin";
import { sendShopSms } from "@/lib/sms/allowance";
import { deriveClients, type ClientAppointment, type DerivedClient } from "@/lib/dashboard/clients";
import { computeAccessStatus } from "@/lib/dashboard/accessStatus";
import { shopHasFeature } from "@/lib/dashboard/plan";
import { twilioConfigured } from "@/lib/twilio";
import { toE164 } from "@/lib/phone";
import { sendAutopilotEmail } from "@/lib/resend";
import { SITE_URL } from "@/lib/seo/facts";
import { createOffer } from "@/lib/autopilot/offers";

// AutoPilot: the five outbound flows (AI Front Desk is event-driven, see
// lib/dashboard/frontdesk.ts). Runs on a schedule. Every send is claimed in
// autopilot_events with a dedupe_key first, so reruns never double-message.

type FlowKey = "noshow" | "filler" | "winback" | "reminders" | "birthday";

const TZ = "America/Edmonton";
const HOUR = 3_600_000;
const DAY = 24 * HOUR;
const QUIET_START = 8;   // no messages before 8am shop time
const QUIET_END = 21;    // or from 9pm (spec: quiet 9pm-8am)
const CLIENT_COOLDOWN_DAYS = 7; // win-back / rebook / birthday: one nudge a week at most
// FL-007: commercial messages per client across all flows.
const CAP_PER_DAY = 1;
const CAP_PER_WEEK = 2;
// CASL: no-show follow-ups relate to a booking the client made; the rest are commercial.
const COMMERCIAL = new Set<FlowKey>(["filler", "reminders", "winback", "birthday"]);
const IMPLIED_CONSENT_DAYS = 730;
const MAX_SENDS_PER_SHOP = 40;
const FILLER_OFFERS_PER_SLOT = 3;  // per run (runs every 15 min)
const FILLER_MAX_PER_SLOT = 10;    // per opening, in total

type Appt = ClientAppointment & {
  id: string; service_name: string; staff_id: string | null; updated_at: string | null;
};

type Shop = {
  id: string; name: string; handle: string | null;
  trial_started_at: string; subscription_status: string | null; trial_override: boolean; trial_paused_at: string | null;
  noshow_recovery_enabled: boolean; filler_enabled: boolean; winback_enabled: boolean;
  reminders_enabled: boolean; birthday_enabled: boolean;
  created_at: string; autopilot_approval_until: string | null; paused_until: string | null;
  winback_offer_pct: number | string; birthday_offer_pct: number | string;
};

export type AutopilotRunResult = { shops: number; sent: number; failed: number; skipped: string[] };

const ACTIVE = new Set(["confirmed", "pending", "deposit"]);
const keyOf = (email: string | null, phone: string | null, name: string) =>
  (email?.trim().toLowerCase()) || (phone?.replace(/\D/g, "")) || name.trim().toLowerCase();
const firstName = (name: string) => name.trim().split(/\s+/)[0] || "there";

/** CASL: commercial texts carry the business name and a working opt-out. */
export function smsText(shopName: string, text: string, bookingUrl: string, commercial: boolean) {
  return commercial ? `${text} ${bookingUrl}\n${shopName} via Flow. Reply STOP to opt out.` : `${text} ${bookingUrl}`;
}

function localHour(now: Date) {
  return Number(new Intl.DateTimeFormat("en-US", { timeZone: TZ, hour: "numeric", hour12: false }).format(now)) % 24;
}
function localMonthDay(d: Date) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TZ, month: "2-digit", day: "2-digit" }).format(d);
}
function fmtWhen(iso: string) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TZ, weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).format(new Date(iso));
}

export async function runAutopilot(now = new Date(), opts: { ignoreQuietHours?: boolean } = {}): Promise<AutopilotRunResult> {
  const result: AutopilotRunResult = { shops: 0, sent: 0, failed: 0, skipped: [] };
  const hour = localHour(now);
  if (!opts.ignoreQuietHours && (hour < QUIET_START || hour >= QUIET_END)) {
    result.skipped.push(`quiet hours (${hour}:00 shop time)`);
    return result;
  }

  const admin = createAdminClient();
  const { data: shops, error } = await admin
    .from("shops")
    .select("id, name, handle, trial_started_at, subscription_status, trial_override, trial_paused_at, noshow_recovery_enabled, filler_enabled, winback_enabled, reminders_enabled, birthday_enabled, created_at, autopilot_approval_until, paused_until, winback_offer_pct, birthday_offer_pct");
  if (error) throw new Error(error.message);

  for (const shop of (shops ?? []) as Shop[]) {
    const anyOn = shop.noshow_recovery_enabled || shop.filler_enabled || shop.winback_enabled || shop.reminders_enabled || shop.birthday_enabled;
    if (!anyOn) continue;
    const { status } = computeAccessStatus(shop);
    if (status !== "active" && status !== "trialing") continue;
    if (!(await shopHasFeature(shop.id, "autopilot"))) continue;
    result.shops += 1;
    try {
      const r = await runShop(admin, shop, now);
      result.sent += r.sent;
      result.failed += r.failed;
    } catch (err) {
      result.skipped.push(`${shop.id}: ${err instanceof Error ? err.message : "error"}`);
    }
  }
  return result;
}

async function runShop(admin: ReturnType<typeof createAdminClient>, shop: Shop, now: Date) {
  const counts = { sent: 0, failed: 0 };
  const bookingUrl = shop.handle ? `${SITE_URL}/book/${shop.handle}` : null;
  if (!bookingUrl) return counts; // nothing to send people to
  if (shop.paused_until && new Date(shop.paused_until).getTime() > now.getTime()) return counts; // owner paused the plan

  const since = new Date(now.getTime() - 400 * DAY).toISOString();
  const { data: rows } = await admin
    .from("appointments")
    .select("id, client_name, client_phone, client_email, customer_id, starts_at, price, status, service_name, staff_id, updated_at")
    .eq("shop_id", shop.id)
    .gte("starts_at", since)
    .order("starts_at", { ascending: true })
    .limit(10000);
  const appts = (rows ?? []) as Appt[];

  const { data: recent } = await admin
    .from("autopilot_events")
    .select("flow_key, client_email, client_phone, client_name, created_at, outcome")
    .eq("shop_id", shop.id)
    .neq("flow_key", "frontdesk")
    .gte("created_at", new Date(now.getTime() - CLIENT_COOLDOWN_DAYS * DAY).toISOString());
  const weekCount = new Map<string, number>();
  const dayCount = new Map<string, number>();
  for (const e of recent ?? []) {
    if (!COMMERCIAL.has(e.flow_key as FlowKey) || e.outcome === "skipped" || e.outcome === "failed") continue;
    const k = keyOf(e.client_email as string | null, e.client_phone as string | null, (e.client_name as string) ?? "");
    weekCount.set(k, (weekCount.get(k) ?? 0) + 1);
    if (now.getTime() - new Date(e.created_at as string).getTime() < DAY) dayCount.set(k, (dayCount.get(k) ?? 0) + 1);
  }

  // Consent + exclusions (FL-006/029/061).
  const { data: clientRows } = await admin
    .from("clients").select("id, full_name, email, phone, date_of_birth, marketing_consent, do_not_automate")
    .eq("shop_id", shop.id).limit(10000);
  const excluded = new Set<string>();
  const express = new Set<string>();
  for (const c of clientRows ?? []) {
    const k = keyOf((c.email as string | null) ?? null, (c.phone as string | null) ?? null, (c.full_name as string) ?? "");
    if (c.do_not_automate) excluded.add(k);
    if (c.marketing_consent === "express") express.add(k);
  }
  const phones = [...new Set(appts.map(a => toE164(a.client_phone)).concat((clientRows ?? []).map(c => toE164(c.phone as string | null))).filter((p): p is string => Boolean(p)))];
  const optedOut = new Set<string>();
  for (let i = 0; i < phones.length; i += 500) {
    const { data } = await admin.from("sms_opt_outs").select("phone").in("phone", phones.slice(i, i + 500));
    for (const r of data ?? []) optedOut.add(r.phone as string);
  }
  const approvalUntil = shop.autopilot_approval_until ?? new Date(new Date(shop.created_at).getTime() + 14 * DAY).toISOString();
  const askFirst = now.getTime() < new Date(approvalUntil).getTime();

  const cooled = new Set((recent ?? [])
    .filter(e => e.flow_key === "winback" || e.flow_key === "reminders" || e.flow_key === "birthday")
    .map(e => keyOf(e.client_email as string | null, e.client_phone as string | null, (e.client_name as string) ?? "")));

  const nowMs = now.getTime();
  const upcoming = new Set(appts.filter(a => ACTIVE.has(a.status) && new Date(a.starts_at).getTime() > nowMs)
    .map(a => keyOf(a.client_email, a.client_phone, a.client_name)));
  const past = appts.filter(a => a.status !== "cancelled" && a.status !== "no_show" && new Date(a.starts_at).getTime() <= nowMs);
  const clients = deriveClients(past, now);
  const touched = new Set<string>(); // one message per client per run

  const send = async (flow: FlowKey, dedupeKey: string, to: { name: string; email: string | null; phone: string | null },
    msg: { subject: string; text: string; cta: string; offer?: { flow: "winback" | "birthday"; pct: number } }, appointmentId: string | null = null) => {
    if (counts.sent + counts.failed >= MAX_SENDS_PER_SHOP) return false;
    const k = keyOf(to.email, to.phone, to.name);
    if (excluded.has(k)) return false;
    const commercial = COMMERCIAL.has(flow);
    if (commercial) {
      if ((dayCount.get(k) ?? 0) >= CAP_PER_DAY || (weekCount.get(k) ?? 0) >= CAP_PER_WEEK) return false;
      // Implied consent: a completed Flow visit in the last 2 years; otherwise express opt-in.
      const visited = clients.some(c => c.key === k && c.daysSinceLastVisit != null && c.daysSinceLastVisit <= IMPLIED_CONSENT_DAYS);
      if (!visited && !express.has(k)) return false;
    }
    const phone = toE164(to.phone);
    const canSms = Boolean(phone) && twilioConfigured() && !optedOut.has(phone!);
    if (!canSms && !to.email) return false;

    // Claim first: the unique index rejects a second claim for the same key.
    const { data: claim, error } = await admin.from("autopilot_events").insert({
      shop_id: shop.id, flow_key: flow, dedupe_key: dedupeKey, appointment_id: appointmentId,
      client_name: to.name, client_email: to.email, client_phone: phone,
      channel: canSms ? "sms" : "email", message_body: msg.text, outcome: askFirst ? "pending" : "sent",
      event_text: `${msg.subject} (${to.name})`,
    }).select("id").maybeSingle();
    if (error || !claim) return false;
    touched.add(k);
    if (commercial) {
      weekCount.set(k, (weekCount.get(k) ?? 0) + 1);
      dayCount.set(k, (dayCount.get(k) ?? 0) + 1);
    }
    // Personal link carrying the auto-applied offer (FL-052/054).
    let link = bookingUrl;
    if (msg.offer && msg.offer.pct > 0) {
      const token = await createOffer(admin, { shopId: shop.id, flow: msg.offer.flow, percentOff: msg.offer.pct, email: to.email, phone });
      link = `${bookingUrl}?offer=${token}`;
      await admin.from("autopilot_events").update({ link }).eq("id", claim.id);
    }
    // "Ask me first": the owner approves it from the AutoPilot page (FL-049).
    if (askFirst) { counts.sent += 1; return true; }

    let ok = false;
    if (canSms) ok = !(await sendShopSms(shop.id, phone!, smsText(shop.name, msg.text, link, commercial), { marketing: commercial })).error;
    if (to.email) {
      const r = await sendAutopilotEmail(to.email, { shopName: shop.name, subject: msg.subject, text: msg.text, ctaLabel: msg.cta, ctaUrl: link });
      ok = ok || !r.error;
    }
    if (!ok) await admin.from("autopilot_events").update({ outcome: "failed" }).eq("id", claim.id);
    if (ok) counts.sent += 1; else counts.failed += 1;
    return ok;
  };
  const who = (a: { client_name: string; client_email: string | null; client_phone: string | null }) =>
    ({ name: a.client_name, email: a.client_email, phone: a.client_phone });

  // 1. No-Show Recovery: an hour after a booking is marked no-show (within 2 days).
  if (shop.noshow_recovery_enabled) {
    for (const a of appts) {
      if (a.status !== "no_show" || !a.updated_at) continue;
      const markedAgo = nowMs - new Date(a.updated_at).getTime();
      if (markedAgo < HOUR || markedAgo > 3 * DAY) continue;
      const k = keyOf(a.client_email, a.client_phone, a.client_name);
      if (upcoming.has(k) || touched.has(k)) continue; // already rebooked / messaged this run
      if (markedAgo < DAY) {
        await send("noshow", `appt:${a.id}`, who(a), {
          subject: `We missed you at ${shop.name}`,
          text: `Hi ${firstName(a.client_name)}, we missed you at ${shop.name} today. Want to pick another time for your ${a.service_name}? Book here:`,
          cta: "Rebook now",
        }, a.id);
      } else {
        // One follow-up a day later, only if the first message went out.
        const { count } = await admin.from("autopilot_events").select("id", { count: "exact", head: true })
          .eq("shop_id", shop.id).eq("dedupe_key", `appt:${a.id}`).eq("outcome", "sent");
        if (!count) continue;
        await send("noshow", `appt:${a.id}:2`, who(a), {
          subject: `Still want to rebook at ${shop.name}?`,
          text: `Hi ${firstName(a.client_name)}, just checking in. ${shop.name} still has times open for your ${a.service_name}:`,
          cta: "Pick a time",
        }, a.id);
      }
    }
  }

  // 2. Last-Minute Slot Filler: a booking in the next 48h was cancelled in the last day.
  if (shop.filler_enabled) {
    for (const a of appts) {
      if (a.status !== "cancelled" || !a.updated_at) continue;
      const startsIn = new Date(a.starts_at).getTime() - nowMs;
      if (startsIn < HOUR || startsIn > 2 * DAY || nowMs - new Date(a.updated_at).getTime() > DAY) continue;
      const retaken = appts.some(b => b.id !== a.id && ACTIVE.has(b.status) && b.starts_at === a.starts_at && b.staff_id === a.staff_id);
      if (retaken) continue;
      const cancelledBy = keyOf(a.client_email, a.client_phone, a.client_name);
      const { count: alreadyOffered } = await admin.from("autopilot_events").select("id", { count: "exact", head: true })
        .eq("shop_id", shop.id).eq("flow_key", "filler").eq("appointment_id", a.id);
      const room = Math.min(FILLER_OFFERS_PER_SLOT, FILLER_MAX_PER_SLOT - (alreadyOffered ?? 0));
      if (room <= 0) continue;
      // Clients who've had this service (or this staff member) before go first, then most overdue.
      const affinity = (k: string) => past.some(p => keyOf(p.client_email, p.client_phone, p.client_name) === k
        && (p.service_name === a.service_name || (a.staff_id && p.staff_id === a.staff_id))) ? 1 : 0;
      const candidates = clients
        .filter(c => c.key !== cancelledBy && !upcoming.has(c.key) && !touched.has(c.key) && (c.email || c.phone))
        .sort((x, y) => affinity(y.key) - affinity(x.key) || overdueScore(y) - overdueScore(x))
        .slice(0, room);
      for (const c of candidates) {
        await send("filler", `slot:${a.id}:${c.key}`, c, {
          subject: `A spot just opened at ${shop.name}`,
          text: `Hi ${firstName(c.name)}, a ${a.service_name} spot just opened at ${shop.name} for ${fmtWhen(a.starts_at)}. First to book gets it:`,
          cta: "Grab this spot",
        }, a.id);
      }
    }
  }

  // 3. Rebooking Reminders: a regular is due, based on their usual gap between visits.
  if (shop.reminders_enabled) {
    for (const c of clients) {
      if (!c.avgIntervalDays || c.visits < 2 || c.daysSinceLastVisit == null || !c.lastVisitAt) continue;
      const due = Math.round(c.avgIntervalDays);
      if (c.daysSinceLastVisit < due || c.daysSinceLastVisit > due + 14) continue;
      if (upcoming.has(c.key) || touched.has(c.key) || cooled.has(c.key)) continue;
      await send("reminders", `rebook:${c.key}:${c.lastVisitAt.slice(0, 10)}`, c, {
        subject: `Time for your next visit at ${shop.name}?`,
        text: `Hi ${firstName(c.name)}, it's been about ${c.daysSinceLastVisit} days since your last visit to ${shop.name}. Ready to book your next one?`,
        cta: "Book my next visit",
      });
    }
  }

  // 4. 30-Day Win-Back: no visit in 30 to 120 days and nothing booked.
  const winbackPct = Number(shop.winback_offer_pct) || 0;
  if (shop.winback_enabled) {
    for (const c of clients) {
      if (c.daysSinceLastVisit == null || c.daysSinceLastVisit < 30 || c.daysSinceLastVisit > 120 || !c.lastVisitAt) continue;
      if (upcoming.has(c.key) || touched.has(c.key) || cooled.has(c.key)) continue;
      await send("winback", `winback:${c.key}:${c.lastVisitAt.slice(0, 10)}`, c, {
        subject: `We miss you at ${shop.name}`,
        text: winbackPct > 0
          ? `Hi ${firstName(c.name)}, it's been a while since we saw you at ${shop.name}. Come back in the next 14 days and get ${winbackPct}% off your visit, applied automatically:`
          : `Hi ${firstName(c.name)}, it's been a while since we saw you at ${shop.name}. We'd love to have you back. Book a time that works for you:`,
        cta: "Book a visit",
        offer: { flow: "winback", pct: winbackPct },
      });
    }
  }

  // 5. Birthday: on the client's birthday (from the client list, e.g. imported).
  if (shop.birthday_enabled) {
    const bdays = (clientRows ?? []).filter(c => c.date_of_birth);
    const today = localMonthDay(new Date(now.getTime() + 7 * DAY)); // spec: 7 days before
    const bdayPct = Number(shop.birthday_offer_pct) || 0;
    const year = now.getUTCFullYear();
    for (const b of bdays ?? []) {
      const dob = String(b.date_of_birth); // YYYY-MM-DD
      if (`${dob.slice(5, 7)}-${dob.slice(8, 10)}` !== today) continue;
      const to = { name: b.full_name as string, email: (b.email as string | null) ?? null, phone: (b.phone as string | null) ?? null };
      const k = keyOf(to.email, to.phone, to.name);
      if (touched.has(k)) continue;
      await send("birthday", `bday:${b.id}:${year}`, to, {
        subject: `Happy early birthday from ${shop.name}`,
        text: bdayPct > 0
          ? `Happy early birthday, ${firstName(to.name)}! Enjoy ${bdayPct}% off at ${shop.name} this month, applied automatically when you book:`
          : `Happy early birthday, ${firstName(to.name)}! Everyone at ${shop.name} hopes it's a great one. Treat yourself to a visit:`,
        cta: "Book a treat",
        offer: { flow: "birthday", pct: bdayPct },
      });
    }
  }

  return counts;
}

function overdueScore(c: DerivedClient) {
  if (c.daysSinceLastVisit == null) return 0;
  return c.avgIntervalDays ? c.daysSinceLastVisit / c.avgIntervalDays : c.daysSinceLastVisit / 45;
}
