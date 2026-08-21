const TRIAL_DAYS = 7;
const GRACE_DAYS = 7;
const DAY_MS = 24 * 60 * 60 * 1000;

export type AccessStatus = "trialing" | "grace" | "inactive" | "active";

export function computeAccessStatus(shop: { created_at: string; subscription_status: string | null }): {
  status: AccessStatus;
  trialEndsAt: Date;
  graceEndsAt: Date;
} {
  const createdAt = new Date(shop.created_at);
  const trialEndsAt = new Date(createdAt.getTime() + TRIAL_DAYS * DAY_MS);
  const graceEndsAt = new Date(trialEndsAt.getTime() + GRACE_DAYS * DAY_MS);

  if (shop.subscription_status === "active") {
    return { status: "active", trialEndsAt, graceEndsAt };
  }

  const now = Date.now();
  if (now < trialEndsAt.getTime()) return { status: "trialing", trialEndsAt, graceEndsAt };
  if (now < graceEndsAt.getTime()) return { status: "grace", trialEndsAt, graceEndsAt };
  return { status: "inactive", trialEndsAt, graceEndsAt };
}
