import { createAdminClient } from "@/lib/supabase/admin";
import { shopTimezone, zonedTime } from "@/lib/scheduler";
import { payPeriodReport, type CommissionAppt, type CommissionStaff } from "@/lib/commissions";

const DAY = 86_400_000;

/** Period from ?from=&to= (YYYY-MM-DD), default the last 14 days. */
export function periodOf(sp: { from?: string; to?: string }, now = new Date()) {
  const ok = (s?: string) => (s && /^\d{4}-\d{2}-\d{2}$/.test(s) ? s : null);
  const to = ok(sp.to) ?? now.toISOString().slice(0, 10);
  const from = ok(sp.from) ?? new Date(new Date(to).getTime() - 13 * DAY).toISOString().slice(0, 10);
  const days = Math.max(1, Math.round((new Date(to).getTime() - new Date(from).getTime()) / DAY) + 1);
  return { from, to, days };
}

export async function loadCommissionData(shopId: string, from: string, to: string, days: number) {
  const admin = createAdminClient();
  // Period boundaries are midnight in the shop's own timezone.
  const tz = await shopTimezone(shopId);
  const [fy, fm, fd] = from.split("-").map(Number); const [ty, tm, td] = to.split("-").map(Number);
  const start = zonedTime(tz, fy, fm, fd, 0).toISOString();
  const end = zonedTime(tz, ty, tm, td + 1, 0).toISOString();
  const [{ data: shop }, { data: staff }, { data: services }, { data: appts }] = await Promise.all([
    admin.from("shops").select("default_commission_pct, commission_on_fees").eq("id", shopId).maybeSingle(),
    admin.from("staff").select("id, full_name, commission_type, commission_pct, commission_flat, rent_amount, rent_period").eq("shop_id", shopId).eq("active", true).order("full_name"),
    admin.from("services").select("id, name, commission_pct").eq("shop_id", shopId).order("name"),
    admin.from("appointments").select("staff_id, service_name, status, price, refunded_amount, tip_amount, fee_amount, fee_charged_at")
      .eq("shop_id", shopId).gte("starts_at", start).lt("starts_at", end).limit(20000),
  ]);
  const rules = {
    servicePct: new Map((services ?? []).filter((s) => s.commission_pct != null).map((s) => [(s.name as string).toLowerCase(), Number(s.commission_pct)])),
    shopDefaultPct: Number(shop?.default_commission_pct ?? 0),
    onFees: Boolean(shop?.commission_on_fees),
  };
  const rows = payPeriodReport((staff ?? []) as CommissionStaff[], (appts ?? []) as CommissionAppt[], rules, days);
  return { shop, staff: (staff ?? []) as CommissionStaff[], services: (services ?? []) as { id: string; name: string; commission_pct: number | null }[], rows };
}
