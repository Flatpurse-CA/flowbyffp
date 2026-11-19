import type { SupabaseClient } from "@supabase/supabase-js";
import { stripe } from "@/lib/stripe";
import { getStripePriceId, type BillablePlanKey, type BillingInterval } from "@/lib/plans";
import { TRIAL_DAYS } from "@/lib/dashboard/accessStatus";

const DAY_MS = 24 * 60 * 60 * 1000;

/** Founders Beta pricing applies to Pro and Pro+ only (CEO decision D3). */
export const FOUNDERS_PLANS: BillablePlanKey[] = ["pro", "pro_plus"];

/**
 * Whole trial days still left on the shop's 14-day clock. Stripe needs at
 * least 1 day for a trial, so anything under a day is treated as "no trial,
 * charge now".
 */
export function remainingTrialDays(trialStartedAt: string | null, now = Date.now()): number {
  if (!trialStartedAt) return TRIAL_DAYS;
  const ends = new Date(trialStartedAt).getTime() + TRIAL_DAYS * DAY_MS;
  return Math.max(0, Math.floor((ends - now) / DAY_MS));
}

/**
 * Starts Stripe Checkout for a platform subscription with the card collected
 * up front. While the shop still has trial time left, the subscription is
 * created in Stripe's trial state and the first charge lands when the trial
 * ends. The plan only becomes the shop's plan once the webhook confirms the
 * session completed, so a plan can never activate without a card (FL-020).
 */
export async function createPlanCheckout(opts: {
  admin: SupabaseClient;
  shopId: string;
  planKey: BillablePlanKey;
  interval: BillingInterval;
  claimFounders: boolean;
  origin: string;
  successPath: string;
  cancelPath: string;
}): Promise<{ url?: string; error?: string }> {
  const { admin, shopId, planKey, interval, origin } = opts;

  const { data: shop } = await admin
    .from("shops")
    .select("stripe_customer_id, name, founder_discount_claimed_at, trial_started_at, subscription_status")
    .eq("id", shopId)
    .maybeSingle();
  if (!shop) return { error: "Shop not found" };

  try {
    let customerId = shop.stripe_customer_id as string | null;
    if (!customerId) {
      const customer = await stripe().customers.create({ name: shop.name as string, metadata: { shop_id: shopId } });
      customerId = customer.id;
      await admin.from("shops").update({ stripe_customer_id: customerId }).eq("id", shopId);
    }

    const wantsFounders = opts.claimFounders && FOUNDERS_PLANS.includes(planKey) && !shop.founder_discount_claimed_at;
    let applyFounders = false;
    if (wantsFounders) {
      const { data } = await admin.from("founders_program").select("spots_remaining").eq("id", true).maybeSingle();
      applyFounders = (data?.spots_remaining ?? 0) > 0;
    }

    // A shop that already paid once (or is mid-subscription) gets no new trial.
    const everSubscribed = Boolean(shop.subscription_status);
    const trialDays = everSubscribed ? 0 : remainingTrialDays(shop.trial_started_at as string | null);

    const session = await stripe().checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      line_items: [{ price: getStripePriceId(planKey, interval), quantity: 1 }],
      payment_method_collection: "always",
      ...(trialDays > 0
        ? { subscription_data: { trial_period_days: trialDays, metadata: { shop_id: shopId } } }
        : {}),
      // Stripe rejects the request if both are present.
      ...(applyFounders ? { discounts: [{ coupon: "founders-40-off" }] } : { allow_promotion_codes: true }),
      success_url: `${origin}${opts.successPath}`,
      cancel_url: `${origin}${opts.cancelPath}`,
      metadata: {
        context: "platform_subscription",
        shop_id: shopId,
        plan_key: planKey,
        interval,
        founder_claim: applyFounders ? "true" : "false",
      },
    });

    return { url: session.url ?? undefined };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Couldn't start checkout" };
  }
}
