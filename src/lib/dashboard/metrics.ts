// Pure, framework-agnostic metrics helpers — no Supabase import, so this module
// is reusable from Next.js server components and the Deno daily-brief function alike.

import { deriveClients, computeRebookingRate, type ClientAppointment } from "./clients";

export type MetricsAppointment = {
  id: string;
  staff_id: string | null;
  starts_at: string;
  duration_minutes: number;
  price: number;
  status: "confirmed" | "pending" | "deposit" | "completed" | "cancelled";
};

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function isCounted(a: MetricsAppointment) {
  return a.status !== "cancelled";
}

// No per-staff schedule exists yet, so "capacity" is approximated as every
// calendar day in range at a flat 480min (8h) workday — documented estimate,
// not a real booked-hours constraint.
export function computeStaffUtilization(
  appointments: MetricsAppointment[],
  staffId: string,
  rangeStart: Date,
  rangeEnd: Date,
  capacityMinutesPerDay = 480,
): { bookings: number; revenue: number; utilizationPct: number; completedCount: number; avgTicket: number } {
  const mine = appointments.filter(a => a.staff_id === staffId && isCounted(a));

  const bookedMinutes = mine.reduce((sum, a) => sum + a.duration_minutes, 0);
  const completed = mine.filter(a => a.status === "completed");
  const revenue = completed.reduce((sum, a) => sum + Number(a.price), 0);

  const days = Math.max(1, Math.round((rangeEnd.getTime() - rangeStart.getTime()) / MS_PER_DAY));
  const capacityMinutes = days * capacityMinutesPerDay;
  const utilizationPct = capacityMinutes > 0
    ? Math.min(100, Math.round((bookedMinutes / capacityMinutes) * 100))
    : 0;

  return {
    bookings: mine.length,
    revenue,
    utilizationPct,
    completedCount: completed.length,
    avgTicket: completed.length > 0 ? revenue / completed.length : 0,
  };
}

export type RebookTrend = { buckets: number[]; avg: number; declining: boolean };

// 8 rolling 7-day buckets, oldest first, ending on `now`'s week.
export function computeRebookTrend(
  appointments: MetricsAppointment[],
  staffId: string,
  now: Date,
): RebookTrend {
  const mine = appointments.filter(a => a.staff_id === staffId && isCounted(a));

  const buckets: number[] = [];
  for (let w = 7; w >= 0; w--) {
    const bucketEnd = new Date(now.getTime() - w * 7 * MS_PER_DAY);
    const bucketStart = new Date(bucketEnd.getTime() - 7 * MS_PER_DAY);
    const count = mine.filter(a => {
      const t = new Date(a.starts_at).getTime();
      return t >= bucketStart.getTime() && t < bucketEnd.getTime();
    }).length;
    buckets.push(count);
  }

  const total = buckets.reduce((s, v) => s + v, 0);
  const avg = buckets.length > 0 ? total / buckets.length : 0;

  const firstTwo = (buckets[0] ?? 0) + (buckets[1] ?? 0);
  const lastTwo = (buckets[6] ?? 0) + (buckets[7] ?? 0);
  const firstMean = firstTwo / 2;
  const lastMean = lastTwo / 2;

  // Avoid false alarms on sparse data: only flag decline once there's enough
  // volume across the window to distinguish a trend from noise.
  const declining = total >= 6 && firstMean > 0 && lastMean < firstMean * 0.75;

  return { buckets, avg, declining };
}

export type SlowestWeekday = { weekdayIndex: number; count: number } | null;

// Minimal shape shared by MetricsAppointment and ClientAppointment (clients.ts) —
// lets this helper serve both the Opportunities (SLOTS) and Flow Coach
// (Marketing) cards without forcing either side's appointment type on the other.
type DatedStatusRecord = { starts_at: string; status: MetricsAppointment["status"] };

// Trailing-N-day booking count bucketed by weekday, to find the historically
// slowest day. One source of truth for both cards above.
export function findSlowestWeekday(appointments: DatedStatusRecord[], now: Date, windowDays = 28): SlowestWeekday {
  const windowStart = new Date(now.getTime() - windowDays * MS_PER_DAY);
  const recent = appointments.filter(a => {
    const t = new Date(a.starts_at).getTime();
    return t >= windowStart.getTime() && t <= now.getTime() && a.status !== "cancelled";
  });
  if (recent.length === 0) return null;

  const byWeekday = new Array(7).fill(0);
  for (const a of recent) byWeekday[new Date(a.starts_at).getDay()]++;

  return byWeekday
    .map((count, weekdayIndex) => ({ weekdayIndex, count }))
    .reduce((min, d) => (d.count < min.count ? d : min));
}

export type RevenueSummary = {
  totalRevenue: number;
  autopilotRevenue: number;
  bookingsCount: number;
  openSlots: number;
  noShowRate: number;
};

export type HealthScore = {
  score: number;
  fillRate: number;
  retention: number;
  revenueGrowthScore: number;
  revenueGrowthPct: number;
  aiContribution: number;
  thisMonthRevenue: number;
  lastMonthRevenue: number;
};

// Same 4-factor average (fill rate, retention, revenue growth, AI contribution)
// originally computed inline in OperationsClient — extracted so Flow Coach's
// Business Health Score card and the Operations Overview tab share one formula
// instead of two copies drifting apart.
export function computeHealthScore(
  appointments: MetricsAppointment[],
  clientAppointments: ClientAppointment[],
  staffCount: number,
  autopilotRevenueThisMonth: number,
  now: Date,
): HealthScore {
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const thisMonthAppts = appointments.filter(a => {
    const t = new Date(a.starts_at);
    return t >= monthStart && t <= now;
  });
  const lastMonthAppts = appointments.filter(a => {
    const t = new Date(a.starts_at);
    return t >= lastMonthStart && t < monthStart;
  });

  const thisMonthRevenue = thisMonthAppts.filter(a => a.status === "completed").reduce((s, a) => s + Number(a.price), 0);
  const lastMonthRevenue = lastMonthAppts.filter(a => a.status === "completed").reduce((s, a) => s + Number(a.price), 0);
  const revenueGrowthPct = lastMonthRevenue > 0
    ? Math.round(((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100)
    : thisMonthRevenue > 0 ? 100 : 0;

  const bookedMinutesThisMonth = thisMonthAppts.filter(isCounted).reduce((s, a) => s + a.duration_minutes, 0);
  const capacityPerDay = Math.max(staffCount, 1) * 480;
  const daysElapsed = Math.max(1, now.getDate());
  const fillRate = Math.min(100, Math.round((bookedMinutesThisMonth / (daysElapsed * capacityPerDay)) * 100));

  const retention = computeRebookingRate(deriveClients(clientAppointments, now));
  const aiContribution = thisMonthRevenue > 0 ? Math.min(100, Math.round((autopilotRevenueThisMonth / thisMonthRevenue) * 100)) : 0;
  const revenueGrowthScore = Math.max(0, Math.min(100, revenueGrowthPct + 50));
  const score = Math.round((fillRate + retention + revenueGrowthScore + aiContribution) / 4);

  return { score, fillRate, retention, revenueGrowthScore, revenueGrowthPct, aiContribution, thisMonthRevenue, lastMonthRevenue };
}

export function computeRevenueSummary(
  appointments: MetricsAppointment[],
  autopilotEventRevenue: number,
): RevenueSummary {
  const completed = appointments.filter(a => a.status === "completed");
  const totalRevenue = completed.reduce((s, a) => s + Number(a.price), 0);
  const cancelled = appointments.filter(a => a.status === "cancelled").length;
  const counted = appointments.filter(isCounted).length;

  return {
    totalRevenue,
    autopilotRevenue: Math.min(autopilotEventRevenue, totalRevenue),
    bookingsCount: counted,
    openSlots: 0, // no persisted schedule to diff against — see operations placeholder
    noShowRate: appointments.length > 0 ? Math.round((cancelled / appointments.length) * 1000) / 10 : 0,
  };
}
