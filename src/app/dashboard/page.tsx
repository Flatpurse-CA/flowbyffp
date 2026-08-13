import { getShopContext } from "@/lib/dashboard/shop";
import { listAppointments, hasAnyAppointments } from "./appointments/actions";
import { getAutopilotState } from "./autopilot/actions";
import { getDailyBriefData } from "./daily-brief/actions";
import { HomeClient } from "./HomeClient";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export default async function HomePage() {
  const ctx = await getShopContext();
  if (!ctx) return null;

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayEnd = new Date(todayStart.getTime() + MS_PER_DAY);

  if (ctx.role === "staff") {
    const todaySchedule = await listAppointments(todayStart.toISOString(), todayEnd.toISOString());
    return <HomeClient role="staff" todaySchedule={todaySchedule} />;
  }

  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const [everBooked, rangeAppts, autopilot, brief] = await Promise.all([
    hasAnyAppointments(),
    listAppointments(lastMonthStart.toISOString(), todayEnd.toISOString()),
    getAutopilotState(),
    getDailyBriefData(),
  ]);

  const todaySchedule = rangeAppts
    .filter(a => {
      const t = new Date(a.starts_at);
      return t >= todayStart && t < todayEnd;
    })
    .sort((a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime());

  const monthRevenue = rangeAppts
    .filter(a => a.status === "completed" && new Date(a.starts_at) >= monthStart)
    .reduce((s, a) => s + Number(a.price), 0);
  const lastMonthRevenue = rangeAppts
    .filter(a => a.status === "completed" && new Date(a.starts_at) >= lastMonthStart && new Date(a.starts_at) < monthStart)
    .reduce((s, a) => s + Number(a.price), 0);
  const monthRevenueDeltaPct = lastMonthRevenue > 0
    ? Math.round(((monthRevenue - lastMonthRevenue) / lastMonthRevenue) * 1000) / 10
    : null;

  const todayAutopilotRevenue = autopilot.events
    .filter(e => {
      const t = new Date(e.created_at);
      return t >= todayStart && t < todayEnd;
    })
    .reduce((s, e) => s + Number(e.amount ?? 0), 0);

  return (
    <HomeClient
      role="owner"
      everBooked={everBooked}
      todaySchedule={todaySchedule}
      autopilot={autopilot}
      todayAutopilotRevenue={todayAutopilotRevenue}
      needsYou={brief.needsYou}
      todayBookingsCount={brief.today.bookingsCount}
      nextAppointmentTime={brief.today.nextAppointmentTime}
      monthRevenue={monthRevenue}
      monthRevenueDeltaPct={monthRevenueDeltaPct}
    />
  );
}
