// Pure, framework-agnostic metrics helpers — no Supabase import, so this module
// is reusable from Next.js server components and the Deno daily-brief function alike.

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

export type RevenueSummary = {
  totalRevenue: number;
  autopilotRevenue: number;
  bookingsCount: number;
  openSlots: number;
  noShowRate: number;
};

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
