"use server";

import { requireShop, getCurrentShopId } from "@/lib/dashboard/shop";
import { computeFlowCoach, type FlowCoachData } from "@/lib/dashboard/flowCoach";
import type { AppointmentRow } from "../appointments/actions";
import type { StaffRow } from "../team/actions";

export async function getShopPlan(): Promise<string> {
  const shopId = await getCurrentShopId();
  if (!shopId) return "starter";
  const { supabase } = await requireShop();
  const { data } = await supabase.from("shops").select("plan").eq("id", shopId).maybeSingle();
  return (data?.plan as string) ?? "starter";
}

export async function getFlowCoachData(): Promise<FlowCoachData | null> {
  const shopId = await getCurrentShopId();
  if (!shopId) return null;

  const { supabase } = await requireShop();
  const now = new Date();

  const rangeStart = new Date(now);
  rangeStart.setDate(rangeStart.getDate() - 90);
  const rangeEnd = new Date(now);
  rangeEnd.setDate(rangeEnd.getDate() + 30);

  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

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

  const appointments = (apptsRes.data ?? []) as AppointmentRow[];
  const staff = (staffRes.data ?? []) as StaffRow[];
  const autopilotRevenueThisMonth = (eventsRes.data ?? []).reduce((s, e) => s + Number(e.amount ?? 0), 0);

  const metricsAppts = appointments.map(a => ({
    id: a.id, staff_id: a.staff_id, starts_at: a.starts_at,
    duration_minutes: a.duration_minutes, price: Number(a.price), status: a.status,
  }));
  const clientAppts = appointments.map(a => ({
    client_name: a.client_name, client_phone: a.client_phone, client_email: a.client_email,
    starts_at: a.starts_at, price: Number(a.price), status: a.status,
  }));

  return computeFlowCoach(metricsAppts, clientAppts, staff, autopilotRevenueThisMonth, now);
}
