/**
 * Shops created on or after this date must add a card before using the
 * dashboard (CTO spec: 14-day trial, card up front, first charge on Day 14).
 * Shops from before keep their existing card-free trial and meet the
 * trial-end paywall instead.
 */
export const CARD_REQUIRED_SINCE = "2026-11-19T00:00:00Z";

export function needsCard(shop: {
  created_at: string | null;
  subscription_status: string | null;
  trial_override: boolean | null;
  plan: string | null;
}): boolean {
  if (shop.trial_override) return false;
  if (shop.plan === "enterprise") return false; // sales-led, invoiced separately
  if (shop.subscription_status) return false; // trialing, active, past_due, canceled: Stripe already has a card
  if (!shop.created_at) return false;
  return new Date(shop.created_at).getTime() >= new Date(CARD_REQUIRED_SINCE).getTime();
}
