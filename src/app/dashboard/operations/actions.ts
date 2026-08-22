"use server";

import { requireShop, getCurrentShopId } from "@/lib/dashboard/shop";
import { stripe } from "@/lib/stripe";
import type { AppointmentRow } from "../appointments/actions";
import type { StaffRow } from "../team/actions";

export type NextPayout = { amount: number; arrivalDate: string; currency: string } | null;

export type OperationsData = {
  appointments: AppointmentRow[];
  staff: StaffRow[];
  autopilotRevenueThisMonth: number;
  taxRate: number | null;
  taxInclusive: boolean;
  stripeConnected: boolean;
  nextPayout: NextPayout;
};

export async function getOperationsData(): Promise<OperationsData> {
  const shopId = await getCurrentShopId();
  if (!shopId) {
    return { appointments: [], staff: [], autopilotRevenueThisMonth: 0, taxRate: null, taxInclusive: false, stripeConnected: false, nextPayout: null };
  }

  const { supabase } = await requireShop();

  const now = new Date();
  const rangeStart = new Date(now);
  rangeStart.setDate(rangeStart.getDate() - 90);
  const rangeEnd = new Date(now);
  rangeEnd.setDate(rangeEnd.getDate() + 14);

  const monthStart = new Date(now);
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const [apptsRes, staffRes, eventsRes, shopRes] = await Promise.all([
    supabase
      .from("appointments")
      .select("*")
      .eq("shop_id", shopId)
      .gte("starts_at", rangeStart.toISOString())
      .lte("starts_at", rangeEnd.toISOString())
      .order("starts_at", { ascending: true }),
    supabase
      .from("staff")
      .select("id, full_name, role, color, active")
      .eq("shop_id", shopId)
      .eq("active", true),
    supabase
      .from("autopilot_events")
      .select("amount")
      .eq("shop_id", shopId)
      .gte("created_at", monthStart.toISOString()),
    supabase
      .from("shops")
      .select("tax_rate, tax_inclusive, stripe_connected, stripe_account_id")
      .eq("id", shopId)
      .maybeSingle(),
  ]);

  const autopilotRevenueThisMonth = (eventsRes.data ?? []).reduce((s, e) => s + Number(e.amount ?? 0), 0);

  const stripeAccountId = shopRes.data?.stripe_account_id as string | undefined;
  let nextPayout: NextPayout = null;
  if (stripeAccountId) {
    try {
      const payouts = await stripe().payouts.list({ limit: 1, status: "pending" }, { stripeAccount: stripeAccountId });
      const p = payouts.data[0];
      if (p) nextPayout = { amount: p.amount / 100, arrivalDate: new Date(p.arrival_date * 1000).toISOString(), currency: p.currency };
    } catch {
      // Stripe Connect account may not support payouts.list in its current
      // state (e.g. still onboarding) — leave nextPayout null rather than fail the page.
    }
  }

  return {
    appointments: (apptsRes.data ?? []) as AppointmentRow[],
    staff: (staffRes.data ?? []) as StaffRow[],
    autopilotRevenueThisMonth,
    taxRate: (shopRes.data?.tax_rate as number | null | undefined) ?? null,
    taxInclusive: Boolean(shopRes.data?.tax_inclusive),
    stripeConnected: Boolean(shopRes.data?.stripe_connected),
    nextPayout,
  };
}
