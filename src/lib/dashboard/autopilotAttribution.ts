import type { SupabaseClient } from "@supabase/supabase-js";
import { toE164 } from "@/lib/phone";
import { pgrstQuote } from "@/lib/postgrest";
import { createAdminClient } from "@/lib/supabase/admin";

const DAY = 24 * 60 * 60 * 1000;

/** Spec 2 attribution windows: how long after a message a booking still counts for that flow. */
export const ATTRIBUTION_WINDOW_DAYS: Record<string, number> = {
  noshow: 7, filler: 2, winback: 14, reminders: 14, birthday: 30, frontdesk: 7,
};
const MAX_WINDOW = Math.max(...Object.values(ATTRIBUTION_WINDOW_DAYS)) * DAY;

export function insideAttributionWindow(flowKey: string, sentAt: string, now = Date.now()): boolean {
  const days = ATTRIBUTION_WINDOW_DAYS[flowKey] ?? 7;
  return now - new Date(sentAt).getTime() <= days * DAY;
}

/**
 * Attribution ledger: links a new booking to the latest AutoPilot message sent to
 * that client inside its flow's window. The booking is "booked" now; its value
 * counts as revenue recovered only once it is completed (DB trigger, migration 0072).
 */
export async function attributeAutopilotRevenue(
  supabase: SupabaseClient,
  input: { shopId: string; clientEmail: string | null | undefined; clientPhone?: string | null; price: number; appointmentId?: string | null },
): Promise<void> {
  const phone = toE164(input.clientPhone ?? null);
  if (!input.clientEmail && !phone) return;

  const { data: candidates } = await supabase
    .from("autopilot_events")
    .select("id, flow_key, created_at")
    .eq("shop_id", input.shopId)
    .or([input.clientEmail ? `client_email.eq.${pgrstQuote(input.clientEmail)}` : null, phone ? `client_phone.eq.${pgrstQuote(phone)}` : null].filter(Boolean).join(","))
    .is("appointment_id", null)
    .not("outcome", "in", "(pending,skipped,failed,booked,disabled)")
    .gte("created_at", new Date(Date.now() - MAX_WINDOW).toISOString())
    .order("created_at", { ascending: false })
    .limit(10);

  const ev = (candidates ?? []).find(e => insideAttributionWindow(e.flow_key as string, e.created_at as string));
  if (!ev) return;

  await supabase.from("autopilot_events").update({ outcome: "booked", appointment_id: input.appointmentId ?? null }).eq("id", ev.id);
  if (!input.appointmentId) return;

  const { data: appt } = await supabase.from("appointments").select("status, price, paid_amount").eq("id", input.appointmentId).maybeSingle();
  const completed = appt?.status === "completed";
  const value = Number(appt?.paid_amount ?? appt?.price ?? input.price) || 0;
  // Ledger writes use the service role: owners can only read attributions.
  await createAdminClient().from("attributions").upsert({
    shop_id: input.shopId, appointment_id: input.appointmentId, autopilot_event_id: ev.id, flow_key: ev.flow_key,
    value_cents: Math.round(value * 100), status: completed ? "completed" : "booked",
    completed_at: completed ? new Date().toISOString() : null,
  }, { onConflict: "appointment_id", ignoreDuplicates: true });
  // Booked straight in as completed (e.g. a walk-in rung up at once): counts now.
  if (completed) await supabase.from("autopilot_events").update({ amount: value }).eq("id", ev.id);
}

/** A recovered booking was cancelled: it no longer counts as revenue recovered. */
export async function unattributeAutopilotRevenue(supabase: SupabaseClient, appointmentId: string): Promise<void> {
  await createAdminClient().from("attributions").update({ status: "cancelled" }).eq("appointment_id", appointmentId);
  await supabase.from("autopilot_events").update({ amount: null, outcome: "sent", appointment_id: null }).eq("appointment_id", appointmentId);
}
