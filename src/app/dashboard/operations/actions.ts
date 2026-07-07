"use server";

import { requireShop, getCurrentShopId } from "@/lib/dashboard/shop";
import type { AppointmentRow } from "../appointments/actions";
import type { StaffRow } from "../team/actions";

export type OperationsData = {
  appointments: AppointmentRow[];
  staff: StaffRow[];
  autopilotRevenueThisMonth: number;
};

export async function getOperationsData(): Promise<OperationsData> {
  const shopId = await getCurrentShopId();
  if (!shopId) return { appointments: [], staff: [], autopilotRevenueThisMonth: 0 };

  const { supabase } = await requireShop();

  const now = new Date();
  const rangeStart = new Date(now);
  rangeStart.setDate(rangeStart.getDate() - 90);
  const rangeEnd = new Date(now);
  rangeEnd.setDate(rangeEnd.getDate() + 14);

  const monthStart = new Date(now);
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const [apptsRes, staffRes, eventsRes] = await Promise.all([
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
  ]);

  const autopilotRevenueThisMonth = (eventsRes.data ?? []).reduce((s, e) => s + Number(e.amount ?? 0), 0);

  return {
    appointments: (apptsRes.data ?? []) as AppointmentRow[],
    staff: (staffRes.data ?? []) as StaffRow[],
    autopilotRevenueThisMonth,
  };
}
