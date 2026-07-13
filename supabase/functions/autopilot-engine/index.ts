// AutoPilot automation engine — cron-triggered every 15 minutes (see the
// cron.schedule note in the migration/setup notes for this function).
// Deno can't import the Next.js app's lib modules directly, so the grouping
// logic is intentionally re-implemented here in compact form (mirrors
// src/lib/dashboard/clients.ts's deriveClients/keyFor and the booking flow in
// src/app/book/[handle]/actions.ts — keep in sync if either changes).
//
// Runs three flows per shop with stripe_connected = true (matches the
// existing dashboard gate: AutoPilotClient.tsx only shows the feature once
// Stripe is connected):
//   1. no-show recovery — appointment ended 30min-24h ago, still not
//      completed/cancelled.
//   2. 30-day win-back — a client's last completed visit was 30-37 days ago.
//   3. slot filler — a cancellation opened a slot in the next 48h; email the
//      shop's most recently active clients.
// Every flow is idempotent via autopilot_events (appointment_id for
// noshow/filler, client_email + 30-day lookback for winback), so re-running
// this on a schedule never double-sends.

import { createClient } from "jsr:@supabase/supabase-js@2";
import { Resend } from "npm:resend";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

const resend = new Resend(Deno.env.get("RESEND_API_KEY")!);
const FROM = Deno.env.get("RESEND_FROM_EMAIL") ?? "FlatPurse Flow <onboarding@resend.dev>";
// flowbyffp.co has no DNS configured yet (checked directly — it doesn't resolve).
// Falls back to the real working deployment until SITE_URL is set as a function
// secret (`supabase secrets set SITE_URL=https://flowbyffp.co`) once that's fixed.
const SITE_URL = Deno.env.get("SITE_URL") ?? "https://flowbyffp.vercel.app";
const SHOP_TZ = "America/Edmonton";

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const NOSHOW_GRACE_MS = 30 * 60 * 1000;
const NOSHOW_LOOKBACK_MS = 24 * MS_PER_DAY;
const WINBACK_MIN_DAYS = 30;
const WINBACK_MAX_DAYS = 37;
const WINBACK_HISTORY_MS = 400 * MS_PER_DAY;
const FILLER_LOOKAHEAD_MS = 48 * 60 * 60 * 1000;
const FILLER_LOOKBACK_MS = 20 * 60 * 1000; // slightly wider than the 15min cron interval

type Appt = {
  id: string; client_name: string; client_email: string | null;
  service_name: string; starts_at: string; duration_minutes: number; status: string;
};

function fmtTime(iso: string) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: SHOP_TZ, weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit",
  }).format(new Date(iso));
}

function keyFor(a: { client_phone?: string | null; client_email: string | null; client_name: string }) {
  return (a.client_phone || a.client_email || a.client_name).trim().toLowerCase();
}

async function runNoShow(shop: { id: string; name: string; handle: string | null }, now: Date): Promise<number> {
  const cutoffOld = new Date(now.getTime() - NOSHOW_LOOKBACK_MS);
  const cutoffRecent = new Date(now.getTime() - NOSHOW_GRACE_MS);

  const { data: apptsRaw } = await supabase
    .from("appointments")
    .select("id, client_name, client_email, service_name, starts_at, duration_minutes, status")
    .eq("shop_id", shop.id)
    .in("status", ["confirmed", "pending", "deposit"])
    .gte("starts_at", cutoffOld.toISOString())
    .lte("starts_at", cutoffRecent.toISOString());

  let sent = 0;
  for (const a of (apptsRaw ?? []) as Appt[]) {
    const endsAt = new Date(a.starts_at).getTime() + a.duration_minutes * 60000;
    if (endsAt > cutoffRecent.getTime() || !a.client_email) continue;

    const { data: existing } = await supabase
      .from("autopilot_events").select("id").eq("appointment_id", a.id).eq("flow_key", "noshow").maybeSingle();
    if (existing) continue;

    const bookingUrl = shop.handle ? `${SITE_URL}/book/${shop.handle}` : SITE_URL;
    const html = `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h1 style="font-size: 20px;">We missed you at ${shop.name}</h1>
        <p style="color: #444; font-size: 14px; line-height: 1.6;">
          Looks like your ${a.service_name} appointment on ${fmtTime(a.starts_at)} didn't happen. Want to grab a new time?
        </p>
        <p style="margin: 24px 0;">
          <a href="${bookingUrl}" style="background: #6d28d9; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">Rebook now</a>
        </p>
      </div>`;
    const { error: sendError } = await resend.emails.send({ from: FROM, to: a.client_email, subject: `We missed you at ${shop.name}`, html });
    if (sendError) continue;

    await supabase.from("autopilot_events").insert({
      shop_id: shop.id, flow_key: "noshow", appointment_id: a.id,
      client_name: a.client_name, client_email: a.client_email,
      event_text: `Sent no-show recovery to ${a.client_name}`,
    });
    sent++;
  }
  return sent;
}

async function runWinback(shop: { id: string; name: string; handle: string | null }, now: Date): Promise<number> {
  const historyStart = new Date(now.getTime() - WINBACK_HISTORY_MS);
  const { data: apptsRaw } = await supabase
    .from("appointments")
    .select("client_name, client_email, client_phone, starts_at, status")
    .eq("shop_id", shop.id)
    .eq("status", "completed")
    .gte("starts_at", historyStart.toISOString())
    .lte("starts_at", now.toISOString());

  const groups = new Map<string, { client_name: string; client_email: string; starts_at: string }[]>();
  for (const a of apptsRaw ?? []) {
    if (!a.client_email) continue;
    const key = keyFor(a);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push({ client_name: a.client_name, client_email: a.client_email, starts_at: a.starts_at });
  }

  let sent = 0;
  for (const [, list] of groups) {
    list.sort((a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime());
    const last = list[list.length - 1];
    const daysSince = (now.getTime() - new Date(last.starts_at).getTime()) / MS_PER_DAY;
    if (daysSince < WINBACK_MIN_DAYS || daysSince > WINBACK_MAX_DAYS) continue;

    const lookback30 = new Date(now.getTime() - 30 * MS_PER_DAY);
    const { data: existing } = await supabase
      .from("autopilot_events").select("id")
      .eq("shop_id", shop.id).eq("flow_key", "winback").eq("client_email", last.client_email)
      .gte("created_at", lookback30.toISOString()).maybeSingle();
    if (existing) continue;

    const bookingUrl = shop.handle ? `${SITE_URL}/book/${shop.handle}` : SITE_URL;
    const html = `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h1 style="font-size: 20px;">We miss you, ${last.client_name.split(" ")[0]}!</h1>
        <p style="color: #444; font-size: 14px; line-height: 1.6;">
          It's been about a month since your last visit to ${shop.name}. Ready to book your next one?
        </p>
        <p style="margin: 24px 0;">
          <a href="${bookingUrl}" style="background: #6d28d9; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">Book now</a>
        </p>
      </div>`;
    const { error: sendError } = await resend.emails.send({ from: FROM, to: last.client_email, subject: `We miss you at ${shop.name}`, html });
    if (sendError) continue;

    await supabase.from("autopilot_events").insert({
      shop_id: shop.id, flow_key: "winback",
      client_name: last.client_name, client_email: last.client_email,
      event_text: `Sent 30-day win-back to ${last.client_name}`,
    });
    sent++;
  }
  return sent;
}

async function runFiller(shop: { id: string; name: string; handle: string | null }, now: Date): Promise<number> {
  const lookback = new Date(now.getTime() - FILLER_LOOKBACK_MS);
  const lookahead = new Date(now.getTime() + FILLER_LOOKAHEAD_MS);

  const { data: cancelledRaw } = await supabase
    .from("appointments")
    .select("id, service_name, starts_at, updated_at, client_email")
    .eq("shop_id", shop.id)
    .eq("status", "cancelled")
    .gte("updated_at", lookback.toISOString())
    .gte("starts_at", now.toISOString())
    .lte("starts_at", lookahead.toISOString());

  let sent = 0;
  for (const c of cancelledRaw ?? []) {
    const { data: existing } = await supabase
      .from("autopilot_events").select("id").eq("appointment_id", c.id).eq("flow_key", "filler").maybeSingle();
    if (existing) continue;

    const { data: recentAppts } = await supabase
      .from("appointments")
      .select("client_name, client_email, starts_at")
      .eq("shop_id", shop.id)
      .eq("status", "completed")
      .order("starts_at", { ascending: false })
      .limit(60);

    const seen = new Set<string>();
    const recipients: { client_name: string; client_email: string }[] = [];
    for (const r of recentAppts ?? []) {
      if (!r.client_email || r.client_email === c.client_email || seen.has(r.client_email)) continue;
      seen.add(r.client_email);
      recipients.push({ client_name: r.client_name, client_email: r.client_email });
      if (recipients.length >= 10) break;
    }
    if (recipients.length === 0) continue;

    const bookingUrl = shop.handle ? `${SITE_URL}/book/${shop.handle}` : SITE_URL;
    let notified = 0;
    for (const r of recipients) {
      const html = `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
          <h1 style="font-size: 20px;">A slot just opened at ${shop.name}</h1>
          <p style="color: #444; font-size: 14px; line-height: 1.6;">
            ${c.service_name} — ${fmtTime(c.starts_at)}. First come, first served.
          </p>
          <p style="margin: 24px 0;">
            <a href="${bookingUrl}" style="background: #6d28d9; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">Grab this slot</a>
          </p>
        </div>`;
      const { error: sendError } = await resend.emails.send({ from: FROM, to: r.client_email, subject: `A slot just opened at ${shop.name}`, html });
      if (!sendError) notified++;
    }

    if (notified > 0) {
      await supabase.from("autopilot_events").insert({
        shop_id: shop.id, flow_key: "filler", appointment_id: c.id,
        event_text: `Notified ${notified} client${notified === 1 ? "" : "s"} about an open slot (${c.service_name})`,
      });
      sent++;
    }
  }
  return sent;
}

Deno.serve(async () => {
  const now = new Date();

  const { data: shops, error } = await supabase
    .from("shops")
    .select("id, name, handle")
    .eq("stripe_connected", true);

  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 });

  let noshowSent = 0, winbackSent = 0, fillerSent = 0, failed = 0;
  const errors: string[] = [];

  for (const shop of shops ?? []) {
    try {
      noshowSent += await runNoShow(shop, now);
      winbackSent += await runWinback(shop, now);
      fillerSent += await runFiller(shop, now);
    } catch (err) {
      errors.push(`${shop.name}: ${err instanceof Error ? err.message : "Unknown error"}`);
      failed++;
    }
  }

  return new Response(
    JSON.stringify({ shops: (shops ?? []).length, noshowSent, winbackSent, fillerSent, failed, errors }),
    { headers: { "Content-Type": "application/json" } },
  );
});
