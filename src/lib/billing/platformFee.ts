import { createAdminClient } from "@/lib/supabase/admin";

/**
 * FL-034: FlatPurse's per-payment transaction fee, collected as a Connect
 * application fee. Off until PLATFORM_FEE_ENABLED=true, because current pricing
 * copy says shops pay Stripe's standard rates directly. Enterprise is negotiated
 * (PLATFORM_FEE_ENTERPRISE="bps,cents", e.g. "240,10").
 */
const RATES: Record<string, { bps: number; cents: number }> = {
  starter: { bps: 270, cents: 20 },
  pro: { bps: 260, cents: 10 },
  pro_plus: { bps: 260, cents: 10 },
};

export function feeForPlan(plan: string, amountCents: number): number | undefined {
  if (process.env.PLATFORM_FEE_ENABLED !== "true" || amountCents <= 0) return undefined;
  let rate = RATES[plan];
  if (plan === "enterprise") {
    const [bps, cents] = (process.env.PLATFORM_FEE_ENTERPRISE ?? "").split(",").map(Number);
    rate = Number.isFinite(bps) && Number.isFinite(cents) ? { bps, cents } : RATES.pro;
  }
  if (!rate) rate = RATES.starter;
  return Math.min(amountCents - 1, Math.round(amountCents * rate.bps / 10000) + rate.cents);
}

/** Spread into paymentIntents.create / paymentLinks.create params. */
export async function applicationFeeParam(shopId: string, amountCents: number): Promise<{ application_fee_amount?: number }> {
  if (process.env.PLATFORM_FEE_ENABLED !== "true") return {};
  const { data } = await createAdminClient().from("shops").select("plan").eq("id", shopId).maybeSingle();
  const fee = feeForPlan((data?.plan as string) ?? "starter", amountCents);
  return fee ? { application_fee_amount: fee } : {};
}
