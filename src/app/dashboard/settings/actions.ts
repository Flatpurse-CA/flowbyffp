"use server";

import { revalidatePath } from "next/cache";
import { requireShop, getShopContext } from "@/lib/dashboard/shop";
import { stripe } from "@/lib/stripe";
import { getRequestOrigin } from "@/lib/requestOrigin";
import { getPlan, getStripePriceId, type BillingInterval } from "@/lib/plans";

export type BusinessHourRow = { weekday: number; open: boolean; start: string; end: string };

export async function getStripeStatus(): Promise<{ connected: boolean }> {
  const ctx = await getShopContext();
  if (!ctx) return { connected: false };
  const { supabase, shopId } = await requireShop();
  const { data } = await supabase.from("shops").select("stripe_connected").eq("id", shopId).maybeSingle();
  return { connected: Boolean(data?.stripe_connected) };
}

export async function startStripeOnboarding(): Promise<{ url?: string; error?: string }> {
  const ctx = await getShopContext();
  if (!ctx || ctx.role !== "owner") return { error: "Only the shop owner can connect Stripe" };
  const { supabase, shopId } = await requireShop();

  const { data: shop } = await supabase.from("shops").select("stripe_account_id, name").eq("id", shopId).maybeSingle();
  if (!shop) return { error: "Shop not found" };

  const origin = await getRequestOrigin();
  let accountId = shop.stripe_account_id as string | null;

  try {
    if (!accountId) {
      const account = await stripe().accounts.create({
        type: "express",
        business_profile: { name: shop.name as string },
      });
      accountId = account.id;
      await supabase.from("shops").update({ stripe_account_id: accountId }).eq("id", shopId);
    }

    const accountLink = await stripe().accountLinks.create({
      account: accountId,
      refresh_url: `${origin}/dashboard/settings/stripe-return?refresh=1`,
      return_url: `${origin}/dashboard/settings/stripe-return`,
      type: "account_onboarding",
    });

    return { url: accountLink.url };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Couldn't start Stripe onboarding" };
  }
}

export type BillingStatus = {
  plan: string;
  subscriptionStatus: string | null;
  billingInterval: BillingInterval | null;
  isFounder: boolean;
  foundersEligible: boolean;
  foundersSpotsRemaining: number;
};

export async function getBillingStatus(): Promise<BillingStatus | null> {
  const ctx = await getShopContext();
  if (!ctx) return null;
  const { supabase, shopId } = await requireShop();

  const [{ data: shop }, { data: founders }] = await Promise.all([
    supabase.from("shops").select("plan, subscription_status, billing_interval, is_founder, founder_discount_claimed_at").eq("id", shopId).maybeSingle(),
    supabase.from("founders_program").select("spots_remaining").eq("id", true).maybeSingle(),
  ]);

  const spotsRemaining = founders?.spots_remaining ?? 0;
  return {
    plan: (shop?.plan as string) ?? "starter",
    subscriptionStatus: (shop?.subscription_status as string | null) ?? null,
    billingInterval: (shop?.billing_interval as BillingInterval | null) ?? null,
    isFounder: Boolean(shop?.is_founder),
    foundersEligible: !shop?.founder_discount_claimed_at && spotsRemaining > 0,
    foundersSpotsRemaining: spotsRemaining,
  };
}

/**
 * Starts Stripe Checkout for Pro/Pro+. Starter needs no payment (handled by
 * just writing shops.plan directly); Enterprise is sales-negotiated, not
 * self-serve. `claimFounders` shows the 40%-off coupon on the Checkout page
 * itself so the customer sees the real price they're agreeing to — the spot is
 * only actually decremented once the webhook sees payment succeed.
 */
export async function startCheckout(input: { planKey: "pro" | "pro_plus"; interval: BillingInterval; claimFounders: boolean }): Promise<{ url?: string; error?: string }> {
  const ctx = await getShopContext();
  if (!ctx || ctx.role !== "owner") return { error: "Only the shop owner can manage billing" };
  const { supabase, shopId } = await requireShop();

  const { data: shop } = await supabase
    .from("shops")
    .select("stripe_customer_id, name, founder_discount_claimed_at")
    .eq("id", shopId)
    .maybeSingle();
  if (!shop) return { error: "Shop not found" };

  const plan = getPlan(input.planKey);
  const origin = await getRequestOrigin();

  try {
    let customerId = shop.stripe_customer_id as string | null;
    if (!customerId) {
      const customer = await stripe().customers.create({ name: shop.name as string, metadata: { shop_id: shopId } });
      customerId = customer.id;
      await supabase.from("shops").update({ stripe_customer_id: customerId }).eq("id", shopId);
    }

    const wantsFounders = input.claimFounders && !shop.founder_discount_claimed_at;
    let foundersSpotsLeft = 0;
    if (wantsFounders) {
      const { data } = await supabase.from("founders_program").select("spots_remaining").eq("id", true).maybeSingle();
      foundersSpotsLeft = data?.spots_remaining ?? 0;
    }
    const applyFoundersDiscount = wantsFounders && foundersSpotsLeft > 0;

    const session = await stripe().checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      line_items: [{ price: getStripePriceId(input.planKey, input.interval), quantity: 1 }],
      discounts: applyFoundersDiscount ? [{ coupon: "founders-40-off" }] : undefined,
      allow_promotion_codes: !applyFoundersDiscount,
      success_url: `${origin}/dashboard/settings?tab=Billing&checkout=success`,
      cancel_url: `${origin}/dashboard/settings?tab=Billing&checkout=cancelled`,
      metadata: {
        context: "platform_subscription",
        shop_id: shopId,
        plan_key: plan.key,
        interval: input.interval,
        founder_claim: applyFoundersDiscount ? "true" : "false",
      },
    });

    return { url: session.url ?? undefined };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Couldn't start checkout" };
  }
}

/** Starter has no Stripe subscription — just record the plan directly. Downgrading off a paid plan should go through openBillingPortal (cancel) instead, so subscription_status stays truthful. */
export async function chooseStarterPlan(): Promise<{ error?: string }> {
  const ctx = await getShopContext();
  if (!ctx || ctx.role !== "owner") return { error: "Only the shop owner can change plans" };
  const { supabase, shopId } = await requireShop();

  const { error } = await supabase.from("shops").update({ plan: "starter" }).eq("id", shopId);
  if (error) return { error: error.message };
  revalidatePath("/dashboard/settings");
  return {};
}

export async function openBillingPortal(): Promise<{ url?: string; error?: string }> {
  const ctx = await getShopContext();
  if (!ctx || ctx.role !== "owner") return { error: "Only the shop owner can manage billing" };
  const { supabase, shopId } = await requireShop();

  const { data: shop } = await supabase.from("shops").select("stripe_customer_id").eq("id", shopId).maybeSingle();
  if (!shop?.stripe_customer_id) return { error: "No billing account yet — subscribe to a plan first" };

  const origin = await getRequestOrigin();
  try {
    const session = await stripe().billingPortal.sessions.create({
      customer: shop.stripe_customer_id as string,
      return_url: `${origin}/dashboard/settings?tab=Billing`,
    });
    return { url: session.url };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Couldn't open billing portal" };
  }
}

export async function getBusinessHours(): Promise<BusinessHourRow[]> {
  const ctx = await getShopContext();
  if (!ctx) return [];
  const { supabase, shopId } = await requireShop();

  const { data } = await supabase
    .from("business_hours")
    .select("weekday, open, start_time, end_time")
    .eq("shop_id", shopId)
    .order("weekday", { ascending: true });

  return (data ?? []).map(r => ({
    weekday: r.weekday as number,
    open: Boolean(r.open),
    start: String(r.start_time).slice(0, 5),
    end: String(r.end_time).slice(0, 5),
  }));
}

export async function updateBusinessHours(rows: BusinessHourRow[]) {
  const ctx = await getShopContext();
  if (!ctx || ctx.role !== "owner") throw new Error("Only the shop owner can change business hours");
  const { supabase, shopId } = await requireShop();

  const { error } = await supabase
    .from("business_hours")
    .upsert(
      rows.map(r => ({ shop_id: shopId, weekday: r.weekday, open: r.open, start_time: r.start, end_time: r.end })),
      { onConflict: "shop_id,weekday" },
    );

  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/settings");
}

export async function updateFamilyHours(input: { enabled: boolean; start: string; end: string }) {
  const ctx = await getShopContext();
  if (!ctx || ctx.role !== "owner") throw new Error("Only the shop owner can change Family Hours");
  const { supabase, shopId } = await requireShop();

  const { error } = await supabase
    .from("shops")
    .update({
      family_hours_enabled: input.enabled,
      family_hours_start: input.start,
      family_hours_end: input.end,
    })
    .eq("id", shopId);

  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/settings");
  revalidatePath("/dashboard/daily-brief");
}
