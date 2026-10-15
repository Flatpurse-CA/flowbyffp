import { computeAccessStatus } from "@/lib/dashboard/accessStatus";
import type { PlanKey } from "@/lib/plans";

// Which plan unlocks each gated feature. Keep in step with PLANS in
// src/lib/plans.ts and supabase/functions/_shared/planAccess.ts (the edge
// functions can't import from src).
export type PlanFeature = "frontdesk" | "daily_brief" | "autopilot" | "flow_coach";

const MIN_PLAN: Record<PlanFeature, PlanKey> = {
  frontdesk: "pro",
  daily_brief: "pro",
  autopilot: "pro_plus",
  flow_coach: "pro_plus",
};

const RANK: Record<PlanKey, number> = { starter: 0, pro: 1, pro_plus: 2, enterprise: 3 };

export const FEATURE_PLAN_LABEL: Record<PlanFeature, string> = {
  frontdesk: "Pro",
  daily_brief: "Pro",
  autopilot: "Pro+",
  flow_coach: "Pro+",
};

type ShopPlanFields = {
  plan?: string | null;
  trial_started_at: string;
  subscription_status: string | null;
  trial_override: boolean;
  trial_paused_at?: string | null;
};

/** The plan a shop gets features from right now: the free trial is full Pro+, comped shops get everything. */
export function effectivePlan(shop: ShopPlanFields): PlanKey {
  const plan = (shop.plan && shop.plan in RANK ? shop.plan : "starter") as PlanKey;
  if (shop.trial_override) return "enterprise";
  if (shop.subscription_status === "active") return plan;
  const { status } = computeAccessStatus(shop);
  if (status === "trialing" || status === "paused") return RANK[plan] > RANK.pro_plus ? plan : "pro_plus";
  return plan;
}

export function planAllows(plan: string | null | undefined, feature: PlanFeature): boolean {
  const key = (plan && plan in RANK ? plan : "starter") as PlanKey;
  return RANK[key] >= RANK[MIN_PLAN[feature]];
}

export const SHOP_PLAN_COLUMNS = "plan, trial_started_at, subscription_status, trial_override, trial_paused_at";
