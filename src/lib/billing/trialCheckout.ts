import type { SupabaseClient } from "@supabase/supabase-js";
import { stripe } from "@/lib/stripe";
import { priceIdFor, type BillablePlanKey, type BillingInterval } from "@/lib/plans";
import { foundersEligible } from "@/lib/founders";
import { TRIAL_DAYS } from "@/lib/dashboard/accessStatus";
import { inComebackWindow } from "@/lib/billing/lifecycle";

const DAY_MS = 24 * 60 * 60 * 1000;

/** Founders prices apply to all three plans (Nov 21 decision, supersedes D3). */
export const FOUNDERS_PLANS: BillablePlanKey[] = ["starter", "pro", "pro_plus"];

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
    .select("stripe_customer_id, name, phone, founder_discount_claimed_at, is_founder, founder_status, trial_started_at, subscription_status, plan_ended_at")
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

    // Founders keep Founders prices on any plan or interval change. The spot
    // itself is claimed on the first paid invoice (webhook), not here.
    const applyFounders = FOUNDERS_PLANS.includes(planKey) &&
      (Boolean(shop.is_founder || shop.founder_status) || (opts.claimFounders && await foundersEligible(admin, shop)));

    // A shop that already paid once (or is mid-subscription) gets no new trial.
    const everSubscribed = Boolean(shop.subscription_status);
    // One free trial per phone number (FL-023). Card is checked in the webhook.
    let phoneUsed = false;
    if (shop.phone) {
      const { count } = await admin.from("shops").select("id", { count: "exact", head: true })
        .eq("phone", shop.phone).neq("id", shopId).not("subscription_status", "is", null);
      phoneUsed = (count ?? 0) > 0;
    }
    const trialDays = everSubscribed || phoneUsed ? 0 : remainingTrialDays(shop.trial_started_at as string | null);

    // C6/C7 comeback offer: 50% off the first 2 months back (never stacks with Founders).
    const comeback = !applyFounders && inComebackWindow(shop.plan_ended_at as string | null);
    if (comeback) {
      try { await stripe().coupons.retrieve("flow-save-50-2m"); }
      catch { await stripe().coupons.create({ id: "flow-save-50-2m", percent_off: 50, duration: "repeating", duration_in_months: 2, name: "50% off 2 months" }); }
    }

    const session = await stripe().checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      line_items: [{ price: priceIdFor(planKey, interval, applyFounders), quantity: 1 }],
      payment_method_collection: "always",
      ...(trialDays > 0
        ? { subscription_data: { trial_period_days: trialDays, metadata: { shop_id: shopId } } }
        : {}),
      // Stripe rejects the request if both are present.
      ...(applyFounders ? {}
        : comeback ? { discounts: [{ coupon: "flow-save-50-2m" }] } : { allow_promotion_codes: true }),
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
