import type { SupabaseClient } from "@supabase/supabase-js";
import { toE164 } from "@/lib/phone";
import { pgrstQuote } from "@/lib/postgrest";

const LOOKBACK_MS = 21 * 24 * 60 * 60 * 1000;

// Closes the loop between an AutoPilot outreach email and the booking it may have
// caused: if this client has an unconverted event (amount still null) from the
// last 21 days, backfill it with this booking's price. Called after any new
// appointment is created (owner-side createAppointment, public createPublicBooking)
// so "recovered revenue" on Home/AutoPilot reflects real conversions, not just sends.
export async function attributeAutopilotRevenue(
  supabase: SupabaseClient,
  input: { shopId: string; clientEmail: string | null | undefined; clientPhone?: string | null; price: number; appointmentId?: string | null },
): Promise<void> {
  const phone = toE164(input.clientPhone ?? null);
  if (!input.clientEmail && !phone) return;

  const lookback = new Date(Date.now() - LOOKBACK_MS).toISOString();

  const { data: existing } = await supabase
    .from("autopilot_events")
    .select("id")
    .eq("shop_id", input.shopId)
    .or([input.clientEmail ? `client_email.eq.${pgrstQuote(input.clientEmail)}` : null, phone ? `client_phone.eq.${pgrstQuote(phone)}` : null].filter(Boolean).join(","))
    .is("amount", null)
    .not("outcome", "in", "(pending,skipped,failed,booked,disabled)")
    .gte("created_at", lookback)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!existing) return;

  await supabase.from("autopilot_events")
    .update({ amount: input.price, outcome: "booked", appointment_id: input.appointmentId ?? null }).eq("id", existing.id);
}

/** A recovered booking was cancelled: it no longer counts as revenue recovered. */
export async function unattributeAutopilotRevenue(supabase: SupabaseClient, appointmentId: string): Promise<void> {
  await supabase.from("autopilot_events").update({ amount: null, outcome: "sent", appointment_id: null }).eq("appointment_id", appointmentId);
}
