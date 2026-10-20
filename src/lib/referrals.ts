import type Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { planPrice } from "@/lib/plans";
import type { createAdminClient } from "@/lib/supabase/admin";

type Admin = ReturnType<typeof createAdminClient>;

/** Cookie set by /r/<code> and read when the referred shop is created. */
export const REFERRAL_COOKIE = "flow_ref";

/** One month of the shop's plan, in cents. Enterprise (no list price) falls back to Starter. */
function monthCreditCents(planKey: string | null): number {
  return Math.round((planPrice(planKey ?? "starter") || planPrice("starter")) * 100);
}

async function credit(customerId: string, cents: number, description: string, idempotencyKey: string) {
  await stripe().customers.createBalanceTransaction(
    customerId,
    { amount: -cents, currency: "cad", description },
    { idempotencyKey },
  );
}

/** Links a newly created shop to the shop whose referral code brought it in. */
export async function recordReferral(admin: Admin, newShopId: string, code: string | undefined) {
  if (!code) return;
  const { data: referrer } = await admin.from("shops").select("id").eq("referral_code", code.toUpperCase()).maybeSingle();
  if (!referrer || referrer.id === newShopId) return;
  // Only the first referral sticks; re-running signup can't reassign it.
  const { data: updated } = await admin
    .from("shops")
    .update({ referred_by_shop_id: referrer.id })
    .eq("id", newShopId)
    .is("referred_by_shop_id", null)
    .select("id");
  if (updated?.length) {
    await admin.from("referrals").upsert({ referrer_shop_id: referrer.id, referred_shop_id: newShopId }, { onConflict: "referred_shop_id", ignoreDuplicates: true });
  }
}

/**
 * Called after a shop's paid platform checkout. Rewards the referral that
 * brought this shop in (both sides get a month), and pays out any credit this
 * shop was owed from its own referrals made before it had a Stripe customer.
 */
export async function settleReferralRewards(admin: Admin, shopId: string, session: Stripe.Checkout.Session) {
  if (!session.customer || (session.amount_total ?? 0) <= 0) return;
  const customerId = typeof session.customer === "string" ? session.customer : session.customer.id;

  const { data: shop } = await admin.from("shops").select("id, name, plan").eq("id", shopId).maybeSingle();
  if (!shop) return;

  // 1. This shop was referred: claim the row first so webhook retries can't double-credit.
  const { data: claimed } = await admin
    .from("referrals")
    .update({ status: "rewarded", rewarded_at: new Date().toISOString() })
    .eq("referred_shop_id", shopId)
    .eq("status", "signed_up")
    .select("id, referrer_shop_id");
  const ref = claimed?.[0];
  if (ref) {
    try {
      // Idempotency keys make a retried credit a no-op at Stripe.
      await credit(customerId, monthCreditCents(shop.plan), "Referral reward: one free month", `ref-referred-${ref.id}`);

      const { data: referrer } = await admin.from("shops").select("stripe_customer_id, plan").eq("id", ref.referrer_shop_id).maybeSingle();
      const cents = monthCreditCents(referrer?.plan ?? null);
      if (referrer?.stripe_customer_id) {
        await credit(referrer.stripe_customer_id, cents, `Referral reward: ${shop.name} joined Flow`, `ref-referrer-${ref.id}`);
        await admin.from("referrals").update({ referrer_credit: "applied", referrer_credit_cents: cents }).eq("id", ref.id);
      } else {
        await admin.from("referrals").update({ referrer_credit: "owed", referrer_credit_cents: cents }).eq("id", ref.id);
      }
    } catch (e) {
      // Release the claim so the referral shows as pending rather than paid.
      await admin.from("referrals").update({ status: "signed_up", rewarded_at: null }).eq("id", ref.id);
      throw e;
    }
  }

  // 2. Credits this shop earned as a referrer before it had a Stripe customer.
  const { data: owed } = await admin
    .from("referrals")
    .update({ referrer_credit: "applied" })
    .eq("referrer_shop_id", shopId)
    .eq("referrer_credit", "owed")
    .select("id, referrer_credit_cents");
  for (const o of owed ?? []) {
    try {
      await credit(customerId, o.referrer_credit_cents ?? monthCreditCents(shop.plan), "Referral reward: a salon you referred joined Flow", `ref-referrer-${o.id}`);
    } catch (e) {
      await admin.from("referrals").update({ referrer_credit: "owed" }).eq("id", o.id);
      throw e;
    }
  }
}
