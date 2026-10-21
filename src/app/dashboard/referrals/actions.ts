"use server";

import { revalidatePath } from "next/cache";
import { getShopContext } from "@/lib/dashboard/shop";
import { createClient } from "@/lib/supabase/server";

export async function saveClientReferralSettings(input: { enabled: boolean; reward: number }) {
  const ctx = await getShopContext();
  if (!ctx || ctx.role !== "owner") throw new Error("Only the shop owner can change referral settings");
  const reward = Math.round(Number(input.reward) * 100) / 100;
  if (!isFinite(reward) || reward < 1 || reward > 500) throw new Error("Choose a reward between C$1 and C$500");
  const supabase = await createClient();
  const { error } = await supabase
    .from("shops")
    .update({ client_referrals_enabled: Boolean(input.enabled), client_referral_reward: reward })
    .eq("id", ctx.shopId);
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/referrals");
}
