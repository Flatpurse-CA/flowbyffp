import type { SupabaseClient } from "@supabase/supabase-js";

const LOOKBACK_MS = 21 * 24 * 60 * 60 * 1000;

// Closes the loop between an AutoPilot outreach email and the booking it may have
// caused: if this client has an unconverted event (amount still null) from the
// last 21 days, backfill it with this booking's price. Called after any new
// appointment is created (owner-side createAppointment, public createPublicBooking)
// so "recovered revenue" on Home/AutoPilot reflects real conversions, not just sends.
export async function attributeAutopilotRevenue(
  supabase: SupabaseClient,
  input: { shopId: string; clientEmail: string | null | undefined; price: number },
): Promise<void> {
  if (!input.clientEmail) return;

  const lookback = new Date(Date.now() - LOOKBACK_MS).toISOString();

  const { data: existing } = await supabase
    .from("autopilot_events")
    .select("id")
    .eq("shop_id", input.shopId)
    .eq("client_email", input.clientEmail)
    .is("amount", null)
    .gte("created_at", lookback)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!existing) return;

  await supabase.from("autopilot_events").update({ amount: input.price }).eq("id", existing.id);
}
