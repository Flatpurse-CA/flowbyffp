// AutoPilot automation engine — cron-triggered every 15 minutes (see the
// cron.schedule note in the migration/setup notes for this function).
// Deno can't import the Next.js app's lib modules directly, so the grouping
// logic is intentionally re-implemented here in compact form (mirrors
// src/lib/dashboard/clients.ts's deriveClients/keyFor and the booking flow in
// src/app/book/[handle]/actions.ts — keep in sync if either changes).
//
// Runs two near-real-time flows per shop with stripe_connected = true
// (matches the existing dashboard gate: AutoPilotClient.tsx only shows the
// feature once Stripe is connected):
//   1. no-show recovery — appointment ended 30min-24h ago, still not
//      completed/cancelled.
//   2. slot filler — a cancellation opened a slot in the next 48h; email the
//      shop's clients who've booked the SAME service recently.
// The 30-day win-back flow moved to supabase/functions/autopilot-nightly
// (personalized per-client interval now, not a fixed 30-37 day window — see
// that function for why).
// Every flow is idempotent via autopilot_events (appointment_id for
// noshow/filler), so re-running this on a schedule never double-sends.
// Every insert into autopilot_events records outcome ('sent'/'failed') and
// error so a failure is logged and processing moves on, never stopping the
// whole run for one bad record.

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
const FILLER_LOOKAHEAD_MS = 48 * 60 * 60 * 1000;
const FILLER_LOOKBACK_MS = 20 * 60 * 1000; // slightly wider than the 15min cron interval

type Appt = {
  id: string; client_name: string; client_email: string | null;
  service_name: string; starts_at: string; duration_minutes: number; status: string;
  deposit_amount: number | null;
};

function fmtTime(iso: string) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: SHOP_TZ, weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit",
  }).format(new Date(iso));
}

function keyFor(a: { client_phone?: string | null; client_email: string | null; client_name: string }) {
  return (a.client_phone || a.client_email || a.client_name).trim().toLowerCase();
}

async function findClientId(shopId: string, email: string | null, name: string): Promise<string | null> {
  if (!email) return null;
  const key = keyFor({ client_email: email, client_name: name });
  const { data } = await supabase.from("clients").select("id").eq("shop_id", shopId).eq("key", key).maybeSingle();
  return (data?.id as string | undefined) ?? null;
}

// ─── AI message generation seam ─────────────────────────────────────────────
// These two functions are where real AI-generated copy plugs in (e.g. a
// Claude API call) once an LLM key exists for this project. Today they return
// warm, template-based copy that already matches the tone the spec asks for
// (acknowledging, not accusatory) — swapping the body out for a real
// generation call later doesn't change any caller.

function generateNoShowMessage(clientFirstName: string, serviceName: string, shopName: string, bookingUrl: string) {
  const subject = `We missed you at ${shopName}`;
  const html = `
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
      <h1 style="font-size: 20px;">We missed you, ${clientFirstName}</h1>
      <p style="color: #444; font-size: 14px; line-height: 1.6;">
        Looks like something came up and your ${serviceName} appointment at ${shopName} didn't happen. No worries —
        life gets busy. Want to grab a new time that works better?
      </p>
      <p style="margin: 24px 0;">
        <a href="${bookingUrl}" style="background: #6d28d9; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">Rebook now</a>
      </p>
    </div>`;
  return { subject, html };
}

function generateSlotFillerMessage(serviceName: string, timeLabel: string, shopName: string, bookingUrl: string) {
  const subject = `A slot just opened at ${shopName}`;
  const html = `
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
      <h1 style="font-size: 20px;">A slot just opened at ${shopName}</h1>
      <p style="color: #444; font-size: 14px; line-height: 1.6;">
        ${serviceName} — ${timeLabel}. First come, first served.
      </p>
      <p style="margin: 24px 0;">
        <a href="${bookingUrl}" style="background: #6d28d9; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">Grab this slot</a>
      </p>
    </div>`;
  return { subject, html };
}

async function logEvent(row: {
  shop_id: string; flow_key: string; event_text: string; appointment_id?: string | null;
  client_name?: string | null; client_email?: string | null; client_id?: string | null;
  amount?: number | null; message_body?: string | null; outcome: "sent" | "failed"; error?: string | null;
}) {
  await supabase.from("autopilot_events").insert(row);
}

async function runNoShow(shop: { id: string; name: string; handle: string | null }, now: Date): Promise<number> {
  const cutoffOld = new Date(now.getTime() - NOSHOW_LOOKBACK_MS);
  const cutoffRecent = new Date(now.getTime() - NOSHOW_GRACE_MS);

  const { data: apptsRaw } = await supabase
    .from("appointments")
    .select("id, client_name, client_email, service_name, starts_at, duration_minutes, status, deposit_amount")
    .eq("shop_id", shop.id)
    .in("status", ["confirmed", "pending", "deposit"])
    .gte("starts_at", cutoffOld.toISOString())
    .lte("starts_at", cutoffRecent.toISOString());

  let sent = 0;
  for (const a of (apptsRaw ?? []) as Appt[]) {
    const endsAt = new Date(a.starts_at).getTime() + a.duration_minutes * 60000;
    if (endsAt > cutoffRecent.getTime()) continue;

    const { data: existing } = await supabase
      .from("autopilot_events").select("id").eq("appointment_id", a.id).eq("flow_key", "noshow").maybeSingle();
    if (existing) continue;

    try {
      // The deposit was already captured as a real Stripe PaymentIntent at
      // booking time — there's nothing new to charge. "Charging" a no-show
      // means recognizing that already-collected deposit as recovered
      // revenue rather than refunding it (no refund is wired anywhere in
      // this codebase, so it stays retained automatically).
      const recoveredAmount = a.deposit_amount ?? 0;

      // Reuses the existing 'cancelled' status rather than introducing a new
      // enum value — getAvailableSlots (src/app/book/[handle]/actions.ts)
      // already excludes 'cancelled' appointments, so this reopens the slot
      // with zero query changes. The no-show fact itself isn't lost — it's
      // recorded distinctly here via flow_key='noshow'.
      const { error: updateError } = await supabase
        .from("appointments").update({ status: "cancelled", updated_at: now.toISOString() }).eq("id", a.id);
      if (updateError) throw new Error(updateError.message);

      const clientId = await findClientId(shop.id, a.client_email, a.client_name);

      if (a.client_email) {
        const bookingUrl = shop.handle ? `${SITE_URL}/book/${shop.handle}` : SITE_URL;
        const { subject, html } = generateNoShowMessage(a.client_name.split(" ")[0], a.service_name, shop.name, bookingUrl);
        const { error: sendError } = await resend.emails.send({ from: FROM, to: a.client_email, subject, html });
        if (sendError) throw new Error(sendError.message);

        await logEvent({
          shop_id: shop.id, flow_key: "noshow", appointment_id: a.id,
          client_name: a.client_name, client_email: a.client_email, client_id: clientId,
          amount: recoveredAmount, message_body: html, outcome: "sent",
          event_text: `Recovered $${recoveredAmount.toFixed(2)} deposit and sent rebook message to ${a.client_name}`,
        });
      } else {
        await logEvent({
          shop_id: shop.id, flow_key: "noshow", appointment_id: a.id,
          client_name: a.client_name, client_email: null, client_id: clientId,
          amount: recoveredAmount, outcome: "sent",
          event_text: `Recovered $${recoveredAmount.toFixed(2)} deposit (no email on file for ${a.client_name})`,
        });
      }
      sent++;
    } catch (err) {
      await logEvent({
        shop_id: shop.id, flow_key: "noshow", appointment_id: a.id,
        client_name: a.client_name, client_email: a.client_email,
        outcome: "failed", error: err instanceof Error ? err.message : String(err),
        event_text: `Failed to process no-show for ${a.client_name}`,
      });
    }
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

    try {
      // Same-service candidates only, ranked by most recent visit first —
      // people who've had this exact service before are the most likely to
      // want the slot, closer to the spec than "any recently active client."
      const { data: recentAppts } = await supabase
        .from("appointments")
        .select("client_name, client_email, starts_at")
        .eq("shop_id", shop.id)
        .eq("status", "completed")
        .eq("service_name", c.service_name)
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

      // Shops running this engine already require stripe_connected = true
      // (the outer loop's filter below), and the public booking page already
      // requires payment through that same flow once Stripe is connected —
      // this booking URL already satisfies "payment-required link."
      const bookingUrl = shop.handle ? `${SITE_URL}/book/${shop.handle}` : SITE_URL;
      const timeLabel = fmtTime(c.starts_at);
      const { subject, html } = generateSlotFillerMessage(c.service_name, timeLabel, shop.name, bookingUrl);

      let notified = 0;
      const failedRecipients: string[] = [];
      for (const r of recipients) {
        const { error: sendError } = await resend.emails.send({ from: FROM, to: r.client_email, subject, html });
        if (sendError) failedRecipients.push(r.client_email);
        else notified++;
      }

      if (notified > 0) {
        await logEvent({
          shop_id: shop.id, flow_key: "filler", appointment_id: c.id,
          message_body: html, outcome: "sent",
          event_text: `Notified ${notified} client${notified === 1 ? "" : "s"} with matching service history about an open slot (${c.service_name})`,
        });
        sent++;
      } else if (failedRecipients.length > 0) {
        await logEvent({
          shop_id: shop.id, flow_key: "filler", appointment_id: c.id,
          outcome: "failed", error: `All ${failedRecipients.length} send attempts failed`,
          event_text: `Failed to notify any client about an open slot (${c.service_name})`,
        });
      }
    } catch (err) {
      await logEvent({
        shop_id: shop.id, flow_key: "filler", appointment_id: c.id,
        outcome: "failed", error: err instanceof Error ? err.message : String(err),
        event_text: `Failed to process slot filler for ${c.service_name}`,
      });
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

  let noshowSent = 0, fillerSent = 0, failed = 0;
  const errors: string[] = [];

  for (const shop of shops ?? []) {
    try {
      noshowSent += await runNoShow(shop, now);
      fillerSent += await runFiller(shop, now);
    } catch (err) {
      errors.push(`${shop.name}: ${err instanceof Error ? err.message : "Unknown error"}`);
      failed++;
    }
  }

  return new Response(
    JSON.stringify({ shops: (shops ?? []).length, noshowSent, fillerSent, failed, errors }),
    { headers: { "Content-Type": "application/json" } },
  );
});
