"use server";

import { revalidatePath } from "next/cache";
import { stripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import { getShopContext } from "@/lib/dashboard/shop";

/** One-time 7-day trial extension for shops that barely used Flow (spec 12, zero-value fallback). */
export async function extendTrial(): Promise<{ error?: string }> {
  const ctx = await getShopContext();
  if (!ctx || ctx.role !== "owner") return { error: "Only the owner can do this" };
  const admin = createAdminClient();
  const { data: shop } = await admin.from("shops").select("subscription_id, subscription_status, billing_notices").eq("id", ctx.shopId).maybeSingle();
  const notices = (shop?.billing_notices ?? {}) as Record<string, string>;
  if (!shop || shop.subscription_status !== "trialing" || notices.trial_extended) return { error: "Your trial can't be extended" };

  try {
    const subId = shop.subscription_id as string;
    // Founders shops run on a subscription schedule; moving its trial phase is a manual job for now.
    if (subId.startsWith("sub_sched_")) return { error: "Reply to George's email and he'll extend it for you" };
    const sub = await stripe().subscriptions.retrieve(subId);
    if (!sub.trial_end) return { error: "Your trial can't be extended" };
    await stripe().subscriptions.update(subId, { trial_end: sub.trial_end + 7 * 24 * 60 * 60, proration_behavior: "none" });
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Couldn't extend your trial" };
  }

  await admin.from("shops").update({ billing_notices: { ...notices, trial_extended: new Date().toISOString() } }).eq("id", ctx.shopId);
  revalidatePath("/dashboard", "layout");
  return {};
}
