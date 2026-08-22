"use server";

import { requireShop, getCurrentShopId } from "@/lib/dashboard/shop";
import { deriveClients, type ClientAppointment } from "@/lib/dashboard/clients";
import { computeRebookTrend, type MetricsAppointment } from "@/lib/dashboard/metrics";
import type { AppointmentRow } from "../appointments/actions";

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function fmtPrice(n: number) {
  return Number.isInteger(n) ? `C$${n}` : `C$${n.toFixed(2)}`;
}

export type NeedsYouCard = { id: string; text: string; kind: "winback" | "staff" | "payment" };

export type AutopilotActivitySummary = {
  actionsCount: number;
  revenue: number;
  byFlow: { flowKey: string; count: number }[];
};

export type DailyBriefData = {
  summary: string;
  yesterday: { revenue: number; bookings: number; cancellations: number; newClients: number };
  today: { bookingsCount: number; revenueScheduled: number; nextAppointmentTime: string | null; staffWorking: number };
  needsYou: NeedsYouCard[];
  autopilotActivity: AutopilotActivitySummary;
};

const EMPTY: DailyBriefData = {
  summary: "Set up your shop to start seeing your daily brief.",
  yesterday: { revenue: 0, bookings: 0, cancellations: 0, newClients: 0 },
  today: { bookingsCount: 0, revenueScheduled: 0, nextAppointmentTime: null, staffWorking: 0 },
  needsYou: [],
  autopilotActivity: { actionsCount: 0, revenue: 0, byFlow: [] },
};

export async function getDailyBriefData(): Promise<DailyBriefData> {
  const shopId = await getCurrentShopId();
  if (!shopId) return EMPTY;

  const { supabase } = await requireShop();
  const now = new Date();

  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayEnd = new Date(todayStart.getTime() + MS_PER_DAY);
  const yesterdayStart = new Date(todayStart.getTime() - MS_PER_DAY);
  const historyStart = new Date(now.getTime() - 120 * MS_PER_DAY);

  const { data: apptsRaw } = await supabase
    .from("appointments")
    .select("*")
    .eq("shop_id", shopId)
    .gte("starts_at", historyStart.toISOString())
    .lte("starts_at", todayEnd.toISOString())
    .order("starts_at", { ascending: true });

  const appts = (apptsRaw ?? []) as AppointmentRow[];

  const yesterdayAppts = appts.filter(a => {
    const t = new Date(a.starts_at);
    return t >= yesterdayStart && t < todayStart;
  });
  const todayAppts = appts.filter(a => {
    const t = new Date(a.starts_at);
    return t >= todayStart && t < todayEnd;
  });

  const yesterdayRevenue = yesterdayAppts.filter(a => a.status === "completed").reduce((s, a) => s + Number(a.price), 0);
  const yesterdayBookings = yesterdayAppts.filter(a => a.status !== "cancelled").length;
  const yesterdayCancellations = yesterdayAppts.filter(a => a.status === "cancelled").length;

  const keyFor = (a: AppointmentRow) => (a.client_phone || a.client_email || a.client_name).trim().toLowerCase();
  const yesterdayClientKeys = new Set(yesterdayAppts.filter(a => a.status !== "cancelled").map(keyFor));
  let newClients = 0;
  for (const key of yesterdayClientKeys) {
    const hasEarlierVisit = appts.some(a => keyFor(a) === key && a.status === "completed" && new Date(a.starts_at) < yesterdayStart);
    if (!hasEarlierVisit) newClients++;
  }

  const activeTodayAppts = todayAppts.filter(a => a.status !== "cancelled");
  const revenueScheduled = activeTodayAppts.reduce((s, a) => s + Number(a.price), 0);
  const staffWorking = new Set(activeTodayAppts.map(a => a.staff_id).filter(Boolean)).size;
  const upcoming = activeTodayAppts
    .filter(a => a.status !== "completed" && new Date(a.starts_at) >= now)
    .sort((a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime())[0];
  const nextAppointmentTime = upcoming
    ? new Intl.DateTimeFormat("en-US", { timeZone: "America/Edmonton", hour: "numeric", minute: "2-digit" }).format(new Date(upcoming.starts_at))
    : null;

  const clientAppts: ClientAppointment[] = appts.map(a => ({
    client_name: a.client_name, client_phone: a.client_phone, client_email: a.client_email, customer_id: a.customer_id,
    starts_at: a.starts_at, price: Number(a.price), status: a.status,
  }));
  const clients = deriveClients(clientAppts, now);
  const churnRisk = clients.filter(c => c.tag === "Churn risk").sort((a, b) => (b.daysSinceLastVisit ?? 0) - (a.daysSinceLastVisit ?? 0))[0];

  const staffIds = Array.from(new Set(appts.map(a => a.staff_id).filter((id): id is string => Boolean(id))));
  const metricsAppts: MetricsAppointment[] = appts.map(a => ({
    id: a.id, staff_id: a.staff_id, starts_at: a.starts_at, duration_minutes: a.duration_minutes,
    price: Number(a.price), status: a.status,
  }));
  let decliningStaffId: string | null = null;
  for (const id of staffIds) {
    if (computeRebookTrend(metricsAppts, id, now).declining) { decliningStaffId = id; break; }
  }

  const unpaidDepositToday = todayAppts.find(a => a.status === "deposit");

  const { data: autopilotEventsRaw } = await supabase
    .from("autopilot_events")
    .select("flow_key, amount")
    .eq("shop_id", shopId)
    .gte("created_at", yesterdayStart.toISOString())
    .lt("created_at", todayStart.toISOString());
  const autopilotEvents = autopilotEventsRaw ?? [];
  const flowCounts = new Map<string, number>();
  for (const e of autopilotEvents) {
    flowCounts.set(e.flow_key as string, (flowCounts.get(e.flow_key as string) ?? 0) + 1);
  }
  const autopilotActivity: AutopilotActivitySummary = {
    actionsCount: autopilotEvents.length,
    revenue: autopilotEvents.reduce((s, e) => s + Number(e.amount ?? 0), 0),
    byFlow: Array.from(flowCounts.entries()).map(([flowKey, count]) => ({ flowKey, count })),
  };

  const needsYou: NeedsYouCard[] = [];
  if (churnRisk) {
    const days = churnRisk.daysSinceLastVisit ? Math.round(churnRisk.daysSinceLastVisit) : null;
    needsYou.push({
      id: `winback-${churnRisk.key}`,
      text: `${churnRisk.name}${days ? ` hasn't booked in ${days}d` : " is overdue for rebook"}: send a win-back offer`,
      kind: "winback",
    });
  }
  if (decliningStaffId) {
    needsYou.push({ id: `staff-${decliningStaffId}`, text: "A team member's rebook rate is dropping, check their Team profile", kind: "staff" });
  }
  if (unpaidDepositToday) {
    needsYou.push({ id: `payment-${unpaidDepositToday.id}`, text: `${unpaidDepositToday.client_name} has an unpaid deposit for today's appointment`, kind: "payment" });
  }

  const summary = todayAppts.length === 0 && yesterdayBookings === 0
    ? "Quiet stretch, no bookings yesterday or today yet."
    : `Yesterday you ${yesterdayRevenue > 0 ? `earned ${fmtPrice(yesterdayRevenue)}` : "had no completed revenue"}. Today you have ${activeTodayAppts.length} booking${activeTodayAppts.length === 1 ? "" : "s"} scheduled.`;

  return {
    summary,
    yesterday: { revenue: yesterdayRevenue, bookings: yesterdayBookings, cancellations: yesterdayCancellations, newClients },
    today: { bookingsCount: activeTodayAppts.length, revenueScheduled, nextAppointmentTime, staffWorking },
    needsYou,
    autopilotActivity,
  };
}
