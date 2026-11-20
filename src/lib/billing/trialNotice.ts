import type { SupabaseClient } from "@supabase/supabase-js";
import { stripe } from "@/lib/stripe";
import { getPlan } from "@/lib/plans";
import { TRIAL_DAYS } from "@/lib/dashboard/accessStatus";
import { fmtDate, nextChargeAmount, trialStats } from "@/lib/billing/notices";

const DAY_MS = 24 * 60 * 60 * 1000;

export type TrialNotice = {
  day: number;
  chargeDate: string;
  planLabel: string;
  price: string;
  per: "month" | "year";
  recovered: number;
  byFlow: Record<string, number>;
  bookings: number;
  last4: string | null;
  canExtend: boolean;
};

/** Data for the Day 11 trial-end screens and the Day 12-13 banner (FL-070/071). Null outside days 11-13. */
export async function getTrialNotice(admin: SupabaseClient, shopId: string): Promise<TrialNotice | null> {
  const { data: shop } = await admin
    .from("shops")
    .select("plan, billing_interval, is_founder, trial_started_at, subscription_status, subscription_id, stripe_customer_id, billing_notices")
    .eq("id", shopId)
    .maybeSingle();
  if (!shop || shop.subscription_status !== "trialing" || !shop.trial_started_at) return null;

  const started = new Date(shop.trial_started_at).getTime();
  const extended = Boolean((shop.billing_notices as Record<string, string> | null)?.trial_extended);
  const charge = started + (TRIAL_DAYS + (extended ? 7 : 0)) * DAY_MS;
  const daysLeft = Math.ceil((charge - Date.now()) / DAY_MS);
  if (daysLeft > 3 || daysLeft < 1) return null;
  const day = TRIAL_DAYS - daysLeft;

  const stats = await trialStats(admin, shopId, shop.trial_started_at);
  let last4: string | null = null;
  if (day === 11 && shop.stripe_customer_id) {
    try {
      const pms = await stripe().paymentMethods.list({ customer: shop.stripe_customer_id, type: "card", limit: 1 });
      last4 = pms.data[0]?.card?.last4 ?? null;
    } catch {
      last4 = null;
    }
  }

  return {
    day,
    chargeDate: fmtDate(new Date(charge)),
    planLabel: getPlan(shop.plan).label,
    price: `C$${nextChargeAmount(shop).toFixed(2)}`,
    per: shop.billing_interval === "annual" ? "year" : "month",
    recovered: stats.recovered,
    byFlow: stats.byFlow,
    bookings: stats.bookings,
    last4,
    canExtend: !extended && !shop.is_founder && stats.bookings < 3 && stats.recovered === 0,
  };
}
