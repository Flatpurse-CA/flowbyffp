// Real signup-cohort retention: for shops that joined in the same week, what
// % were still actively booking (had a real, non-cancelled appointment) in
// each of the 4 weeks following their own signup date. A cell is null (shown
// as "—") until enough time has actually elapsed for that cohort to reach that
// week marker — no synthetic 0% for cohorts that just haven't gotten there yet.

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const MS_PER_WEEK = 7 * MS_PER_DAY;

export type CohortRow = {
  cohortLabel: string;
  cohortStart: string;
  size: number;
  w1: number | null;
  w2: number | null;
  w3: number | null;
  w4: number | null;
};

function startOfWeek(d: Date): Date {
  const date = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const day = date.getDay();
  const diff = (day === 0 ? -6 : 1) - day; // Monday-start week
  date.setDate(date.getDate() + diff);
  return date;
}

export function computeSignupCohorts(
  shops: { id: string; created_at: string }[],
  appointments: { shop_id: string; starts_at: string; status: string }[],
  now: Date,
  weeksBack = 8,
): CohortRow[] {
  const cohorts = new Map<string, { start: Date; shops: { id: string; createdAt: Date }[] }>();
  for (const s of shops) {
    const createdAt = new Date(s.created_at);
    const weekStart = startOfWeek(createdAt);
    const key = weekStart.toISOString().slice(0, 10);
    if (!cohorts.has(key)) cohorts.set(key, { start: weekStart, shops: [] });
    cohorts.get(key)!.shops.push({ id: s.id, createdAt });
  }

  const apptsByShop = new Map<string, Date[]>();
  for (const a of appointments) {
    if (a.status === "cancelled") continue;
    if (!apptsByShop.has(a.shop_id)) apptsByShop.set(a.shop_id, []);
    apptsByShop.get(a.shop_id)!.push(new Date(a.starts_at));
  }

  const weekActivityPct = (cohortShops: { id: string; createdAt: Date }[], weekIndex: number): number | null => {
    let eligible = 0;
    let active = 0;
    for (const s of cohortShops) {
      const windowStart = new Date(s.createdAt.getTime() + (weekIndex - 1) * MS_PER_WEEK);
      const windowEnd = new Date(s.createdAt.getTime() + weekIndex * MS_PER_WEEK);
      if (windowEnd.getTime() > now.getTime()) continue;
      eligible++;
      const appts = apptsByShop.get(s.id) ?? [];
      if (appts.some(t => t.getTime() >= windowStart.getTime() && t.getTime() < windowEnd.getTime())) active++;
    }
    return eligible === 0 ? null : Math.round((active / eligible) * 100);
  };

  const sortedKeys = Array.from(cohorts.keys()).sort().slice(-weeksBack);

  return sortedKeys.map(key => {
    const { start, shops: cohortShops } = cohorts.get(key)!;
    return {
      cohortLabel: start.toLocaleDateString("en-CA", { month: "short", day: "numeric" }),
      cohortStart: key,
      size: cohortShops.length,
      w1: weekActivityPct(cohortShops, 1),
      w2: weekActivityPct(cohortShops, 2),
      w3: weekActivityPct(cohortShops, 3),
      w4: weekActivityPct(cohortShops, 4),
    };
  });
}
