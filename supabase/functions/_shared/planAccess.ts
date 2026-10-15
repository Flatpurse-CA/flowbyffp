// Deno copy of src/lib/planAccess.ts + src/lib/dashboard/accessStatus.ts for
// the edge functions, which can't import from src. Keep the two in step.

export const TRIAL_DAYS = 14;
const DAY_MS = 24 * 60 * 60 * 1000;

type PlanKey = "starter" | "pro" | "pro_plus" | "enterprise";
export type PlanFeature = "frontdesk" | "daily_brief" | "autopilot" | "flow_coach";

const RANK: Record<PlanKey, number> = { starter: 0, pro: 1, pro_plus: 2, enterprise: 3 };
const MIN_PLAN: Record<PlanFeature, PlanKey> = {
  frontdesk: "pro",
  daily_brief: "pro",
  autopilot: "pro_plus",
  flow_coach: "pro_plus",
};

export const SHOP_PLAN_COLUMNS = "plan, trial_started_at, subscription_status, trial_override, trial_paused_at";

export type ShopPlanFields = {
  plan: string | null;
  trial_started_at: string;
  subscription_status: string | null;
  trial_override: boolean;
  trial_paused_at: string | null;
};

/** Trial (and an admin-paused trial) is full Pro+; comped shops get everything. */
export function shopHasFeature(shop: ShopPlanFields, feature: PlanFeature, now = new Date()): boolean {
  let plan = (shop.plan && shop.plan in RANK ? shop.plan : "starter") as PlanKey;
  if (shop.trial_override) plan = "enterprise";
  else if (shop.subscription_status !== "active") {
    const trialEnds = new Date(shop.trial_started_at).getTime() + TRIAL_DAYS * DAY_MS;
    if (shop.trial_paused_at || now.getTime() < trialEnds) plan = RANK[plan] > RANK.pro_plus ? plan : "pro_plus";
  }
  return RANK[plan] >= RANK[MIN_PLAN[feature]];
}
