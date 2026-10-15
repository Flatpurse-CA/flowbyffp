import { createAdminClient } from "@/lib/supabase/admin";
import { effectivePlan, planAllows, SHOP_PLAN_COLUMNS, type PlanFeature } from "@/lib/planAccess";
import type { PlanKey } from "@/lib/plans";

/** Plan a shop gets features from right now (trial = Pro+), read server-side. */
export async function getEffectivePlan(shopId: string): Promise<PlanKey> {
  const admin = createAdminClient();
  const { data } = await admin.from("shops").select(SHOP_PLAN_COLUMNS).eq("id", shopId).maybeSingle();
  if (!data) return "starter";
  return effectivePlan(data as unknown as Parameters<typeof effectivePlan>[0]);
}

export async function shopHasFeature(shopId: string, feature: PlanFeature): Promise<boolean> {
  return planAllows(await getEffectivePlan(shopId), feature);
}
