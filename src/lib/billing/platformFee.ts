import { createAdminClient } from "@/lib/supabase/admin";

/**
 * FL-034: Flow's card rates (Nov 19 pricing spec). The shop pays Stripe's own
 * processing fee on its direct charges, so the Connect application fee is the
 * gap between Flow's rate and Stripe's cost. Off until PLATFORM_FEE_ENABLED=true
 * (turn on only after real $45 test charges show a positive application fee).
 * Enterprise is negotiated: PLATFORM_FEE_ENTERPRISE_IN_PERSON / _ONLINE as
 * "bps,cents", never below the Pro rates.
 */
export type Channel = "in_person" | "online";
type Rate = { bps: number; cents: number };

const FLOW: Record<Channel, Record<string, Rate>> = {
  in_person: { starter: { bps: 340, cents: 25 }, pro: { bps: 320, cents: 25 }, pro_plus: { bps: 320, cents: 25 } },
  online: { starter: { bps: 350, cents: 30 }, pro: { bps: 340, cents: 30 }, pro_plus: { bps: 340, cents: 30 } },
};
const INTL_FLOW_BPS = 100;

const parse = (v: string | undefined, fallback: Rate): Rate => {
  const [bps, cents] = (v ?? "").split(",").map(Number);
  return v && Number.isFinite(bps) && Number.isFinite(cents) ? { bps, cents } : fallback;
};

/** Stripe's own cost to the shop. Override if Stripe's Canadian pricing changes. */
const stripeCost = (channel: Channel): Rate => channel === "in_person"
  ? parse(process.env.STRIPE_COST_IN_PERSON, { bps: 270, cents: 20 })
  : parse(process.env.STRIPE_COST_ONLINE, { bps: 290, cents: 30 });
const stripeIntlBps = () => Number(process.env.STRIPE_COST_INTL_BPS ?? 80);

/** What the shop pays in total for a card payment, in cents (before tax). */
export function flowRateCents(plan: string, amountCents: number, channel: Channel, international = false): number {
  let rate = FLOW[channel][plan] ?? FLOW[channel].starter;
  if (plan === "enterprise") {
    const pro = FLOW[channel].pro;
    const e = parse(process.env[`PLATFORM_FEE_ENTERPRISE_${channel === "in_person" ? "IN_PERSON" : "ONLINE"}`], pro);
    rate = e.bps < pro.bps || e.cents < pro.cents ? pro : e;
  }
  return Math.round(amountCents * (rate.bps + (international ? INTL_FLOW_BPS : 0)) / 10000) + rate.cents;
}

/** Application fee Flow keeps, in cents. Undefined when off or not positive. */
export function feeForPlan(plan: string, amountCents: number, channel: Channel = "online", international = false): number | undefined {
  if (process.env.PLATFORM_FEE_ENABLED !== "true" || amountCents <= 0) return undefined;
  const s = stripeCost(channel);
  const stripe = Math.round(amountCents * (s.bps + (international ? stripeIntlBps() : 0)) / 10000) + s.cents;
  const fee = Math.min(amountCents - 1, flowRateCents(plan, amountCents, channel, international) - stripe);
  return fee > 0 ? fee : undefined;
}

/** Spread into paymentIntents.create / paymentLinks.create params. */
export async function applicationFeeParam(shopId: string, amountCents: number, channel: Channel = "online"): Promise<{ application_fee_amount?: number }> {
  if (process.env.PLATFORM_FEE_ENABLED !== "true") return {};
  const { data } = await createAdminClient().from("shops").select("plan").eq("id", shopId).maybeSingle();
  const fee = feeForPlan((data?.plan as string) ?? "starter", amountCents, channel);
  return fee ? { application_fee_amount: fee } : {};
}
