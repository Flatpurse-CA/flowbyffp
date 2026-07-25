// Flow Coach™ — the Pro+ "AI business advisor" card set. Every card's text is a
// deterministic template filled in from real computed metrics (same approach
// already used by AutoPilot's emails and the Opportunities cards elsewhere in
// this codebase) — there is no LLM call anywhere in this project. Two cards
// (Pricing, Goal Tracking) have no real data source yet and are surfaced as
// honest "not available" cards rather than fabricated numbers, matching the
// pattern in opportunities.ts.

import { deriveClients, computeRebookingRate, type ClientAppointment } from "./clients";
import { computeHealthScore, computeStaffUtilization, findSlowestWeekday, type MetricsAppointment, type HealthScore } from "./metrics";

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function fmtPrice(n: number) {
  const sign = n < 0 ? "-" : "";
  const abs = Math.abs(n);
  return `${sign}C$${Number.isInteger(abs) ? abs : abs.toFixed(2)}`;
}

export type FlowCoachCard = {
  key: "health" | "forecast" | "staffing" | "retention" | "marketing" | "predictive" | "pricing" | "goals";
  title: string;
  eyebrow: string;
  headline: string;
  diagnosis: string | null;
  recommendation: string | null;
  impact: string | null;
  available: boolean;
};

// ─── Business Health Score ──────────────────────────────────────────────────

function healthScoreCard(health: HealthScore): FlowCoachCard {
  const factors = [
    { name: "booking fill rate", value: health.fillRate, tip: "Your calendar has open capacity — run a promo on your slowest day or let AutoPilot fill more slots." },
    { name: "client retention", value: health.retention, tip: "Fewer clients are rebooking than expected — send win-back offers to your Overdue and Churn-risk clients." },
    { name: "revenue growth", value: health.revenueGrowthScore, tip: "Revenue is trending down month-over-month — review pricing and rebooking cadence." },
    { name: "AI contribution", value: health.aiContribution, tip: "AutoPilot is generating little of your revenue — confirm Stripe is connected and your flows are active." },
  ];
  const weakest = factors.reduce((min, f) => (f.value < min.value ? f : min));

  return {
    key: "health",
    title: "Business Health Score",
    eyebrow: "How your business is doing, at a glance",
    headline: `${health.score}/100`,
    diagnosis: `Your weakest factor is ${weakest.name} at ${weakest.value}/100.`,
    recommendation: weakest.tip,
    impact: null,
    available: true,
  };
}

// ─── Revenue Forecasting ────────────────────────────────────────────────────

export type RevenueForecast = {
  forecast30d: number;
  scheduledRevenue30d: number;
  trailingWeeklyAvg: number;
  weekOverWeekPct: number;
};

// Estimate only, documented as such: forecast = max(already-booked revenue in
// the next 30 days, trailing 8-week pace adjusted by the recent trend). There's
// no ML model here — just a trend-adjusted average, same honesty level as the
// rest of this dashboard's "estimated" figures (see metrics.ts capacity note).
function computeRevenueForecast(appointments: MetricsAppointment[], now: Date): RevenueForecast {
  const buckets: number[] = [];
  for (let w = 7; w >= 0; w--) {
    const bucketEnd = new Date(now.getTime() - w * 7 * MS_PER_DAY);
    const bucketStart = new Date(bucketEnd.getTime() - 7 * MS_PER_DAY);
    const revenue = appointments
      .filter(a => a.status === "completed")
      .filter(a => {
        const t = new Date(a.starts_at).getTime();
        return t >= bucketStart.getTime() && t < bucketEnd.getTime();
      })
      .reduce((s, a) => s + Number(a.price), 0);
    buckets.push(revenue);
  }
  const trailingWeeklyAvg = buckets.reduce((s, v) => s + v, 0) / buckets.length;

  const firstMean = ((buckets[0] ?? 0) + (buckets[1] ?? 0)) / 2;
  const lastMean = ((buckets[6] ?? 0) + (buckets[7] ?? 0)) / 2;
  const weekOverWeekPct = firstMean > 0 ? Math.round(((lastMean - firstMean) / firstMean) * 100) : lastMean > 0 ? 100 : 0;

  const next30 = new Date(now.getTime() + 30 * MS_PER_DAY);
  const scheduledRevenue30d = appointments
    .filter(a => a.status !== "cancelled" && a.status !== "completed")
    .filter(a => {
      const t = new Date(a.starts_at).getTime();
      return t >= now.getTime() && t <= next30.getTime();
    })
    .reduce((s, a) => s + Number(a.price), 0);

  const trendMultiplier = Math.max(0.5, Math.min(1.5, 1 + weekOverWeekPct / 100));
  const paceForecast = trailingWeeklyAvg * (30 / 7) * trendMultiplier;
  const forecast30d = Math.max(scheduledRevenue30d, paceForecast);

  return { forecast30d, scheduledRevenue30d, trailingWeeklyAvg, weekOverWeekPct };
}

function revenueForecastCard(f: RevenueForecast): FlowCoachCard {
  const trendWord = f.weekOverWeekPct > 5 ? "climbing" : f.weekOverWeekPct < -5 ? "declining" : "holding steady";
  return {
    key: "forecast",
    title: "Revenue Forecasting",
    eyebrow: "Where your revenue is headed",
    headline: `~${fmtPrice(f.forecast30d)} projected over the next 30 days`,
    diagnosis: `Trailing weekly average is ${fmtPrice(f.trailingWeeklyAvg)}, ${trendWord} (${f.weekOverWeekPct >= 0 ? "+" : ""}${f.weekOverWeekPct}% week-over-week), with ${fmtPrice(f.scheduledRevenue30d)} already on the calendar.`,
    recommendation: f.weekOverWeekPct < -5
      ? "Revenue is trending down — see the Retention and Marketing cards below for specific next steps."
      : "Keep AutoPilot active to protect this pace.",
    impact: null,
    available: true,
  };
}

// ─── Staffing Recommendations ───────────────────────────────────────────────

function staffingCard(appointments: MetricsAppointment[], staff: { id: string; full_name: string }[], now: Date): FlowCoachCard {
  const base = { key: "staffing" as const, title: "Staffing Recommendations", eyebrow: "How your team's time is spread" };

  if (staff.length === 0) {
    return { ...base, headline: "No team members added yet", diagnosis: null, recommendation: "Add your team under Team to unlock staffing insights.", impact: null, available: true };
  }

  const rangeStart = new Date(now.getTime() - 30 * MS_PER_DAY);
  const util = staff.map(s => ({ ...computeStaffUtilization(appointments, s.id, rangeStart, now), name: s.full_name }));
  const overloaded = util.filter(u => u.utilizationPct >= 85);
  const underused = util.filter(u => u.bookings > 0 && u.utilizationPct < 25);

  if (overloaded.length > 0) {
    const names = overloaded.map(u => u.name).join(", ");
    return {
      ...base,
      headline: `${names} ${overloaded.length === 1 ? "is" : "are"} running above 85% capacity`,
      diagnosis: `Over the last 30 days, ${names} booked at or above 85% of estimated available capacity.`,
      recommendation: "Consider adding another team member or redistributing bookings to reduce burnout risk.",
      impact: null,
      available: true,
    };
  }
  if (underused.length > 0) {
    const names = underused.map(u => u.name).join(", ");
    return {
      ...base,
      headline: `${names} ${underused.length === 1 ? "has" : "have"} spare capacity`,
      diagnosis: "Utilization is under 25% over the last 30 days for at least one team member with bookings.",
      recommendation: `Route more bookings to ${names}, or point AutoPilot's fill campaigns at their open slots.`,
      impact: null,
      available: true,
    };
  }
  return {
    ...base,
    headline: "Team capacity looks balanced",
    diagnosis: "No team member is over 85% or under 25% utilization over the last 30 days.",
    recommendation: "No staffing action needed right now.",
    impact: null,
    available: true,
  };
}

// ─── Customer Retention Insights ────────────────────────────────────────────

function retentionCard(clientAppointments: ClientAppointment[], now: Date): FlowCoachCard {
  const clients = deriveClients(clientAppointments, now);
  const atRisk = clients.filter(c => c.tag === "Overdue" || c.tag === "Churn risk");
  const retention = computeRebookingRate(clients);
  const completed = clientAppointments.filter(a => a.status === "completed");
  const avgTicket = completed.length > 0 ? completed.reduce((s, a) => s + Number(a.price), 0) / completed.length : 0;
  const revenueAtRisk = avgTicket * atRisk.length;

  return {
    key: "retention",
    title: "Customer Retention Insights",
    eyebrow: "Who's slipping away",
    headline: atRisk.length > 0 ? `${atRisk.length} client${atRisk.length === 1 ? "" : "s"} at risk of churning` : "No clients currently at risk",
    diagnosis: `Your rebooking rate is ${retention}%. ${atRisk.length} client${atRisk.length === 1 ? " hasn't" : "s haven't"} returned within their usual interval.`,
    recommendation: atRisk.length > 0
      ? `Send a win-back offer to your ${atRisk.length} at-risk client${atRisk.length === 1 ? "" : "s"} before they lapse for good.`
      : "No action needed — no one is currently overdue.",
    impact: revenueAtRisk > 0 ? `-${fmtPrice(revenueAtRisk)} at risk` : null,
    available: true,
  };
}

// ─── Marketing Recommendations ──────────────────────────────────────────────

function marketingCard(clientAppointments: ClientAppointment[], now: Date): FlowCoachCard {
  const base = { key: "marketing" as const, title: "Marketing Recommendations", eyebrow: "Where a promo would help most" };
  const slowest = findSlowestWeekday(clientAppointments, now);

  if (!slowest) {
    return { ...base, headline: "Not enough booking history yet", diagnosis: null, recommendation: "Check back once you have a few weeks of bookings.", impact: null, available: true };
  }

  const completed = clientAppointments.filter(a => a.status === "completed");
  const avgTicket = completed.length > 0 ? completed.reduce((s, a) => s + Number(a.price), 0) / completed.length : 0;
  const day = WEEKDAYS[slowest.weekdayIndex];

  return {
    ...base,
    headline: `${day}s are your slowest day`,
    diagnosis: `Only ${slowest.count} booking${slowest.count === 1 ? "" : "s"} fell on a ${day} over the last 4 weeks.`,
    recommendation: `Run a flash promo or feature ${day} availability in your next AutoPilot campaign.`,
    impact: avgTicket > 0 ? `+${fmtPrice(avgTicket)}/wk potential` : null,
    available: true,
  };
}

// ─── Predictive Analytics ───────────────────────────────────────────────────

function predictiveCard(clientAppointments: ClientAppointment[], forecast: RevenueForecast, now: Date): FlowCoachCard {
  const clients = deriveClients(clientAppointments, now);
  const dueSoon = clients.filter(c =>
    c.avgIntervalDays !== null && c.daysSinceLastVisit !== null &&
    c.tag !== "Overdue" && c.tag !== "Churn risk" &&
    (c.avgIntervalDays - c.daysSinceLastVisit) <= 14,
  );
  const lapseRisk = clients.filter(c => c.tag === "Overdue" || c.tag === "Churn risk").length;
  const trendWord = forecast.weekOverWeekPct > 5 ? "accelerating" : forecast.weekOverWeekPct < -5 ? "slowing" : "holding steady";

  return {
    key: "predictive",
    title: "Predictive Analytics",
    eyebrow: "What's likely to happen next",
    headline: `${dueSoon.length} client${dueSoon.length === 1 ? "" : "s"} expected to book in the next 2 weeks`,
    diagnosis: `Revenue is ${trendWord}, and ${lapseRisk} client${lapseRisk === 1 ? " is" : "s are"} on track to lapse without a nudge.`,
    recommendation: lapseRisk > 0 ? "Reach out to your at-risk clients before their predicted lapse date." : "No one is predicted to lapse soon — good position.",
    impact: null,
    available: true,
  };
}

// ─── Not yet available (honest placeholders — see opportunities.ts for the same pattern) ──

const pricingCard: FlowCoachCard = {
  key: "pricing",
  title: "Pricing Recommendations",
  eyebrow: "Are you priced right",
  headline: "Not available yet",
  diagnosis: "Pricing recommendations need a competitive market-rate benchmark — not available yet.",
  recommendation: null,
  impact: null,
  available: false,
};

const goalsCard: FlowCoachCard = {
  key: "goals",
  title: "Goal Tracking",
  eyebrow: "Set and track targets",
  headline: "Not set up yet",
  diagnosis: "Goal Tracking needs a place to set targets first — coming soon.",
  recommendation: null,
  impact: null,
  available: false,
};

// ─── Orchestrator ────────────────────────────────────────────────────────────

export type FlowCoachData = {
  health: HealthScore;
  cards: FlowCoachCard[];
};

export function computeFlowCoach(
  appointments: MetricsAppointment[],
  clientAppointments: ClientAppointment[],
  staff: { id: string; full_name: string }[],
  autopilotRevenueThisMonth: number,
  now: Date,
): FlowCoachData {
  const health = computeHealthScore(appointments, clientAppointments, staff.length, autopilotRevenueThisMonth, now);
  const forecast = computeRevenueForecast(appointments, now);

  return {
    health,
    cards: [
      healthScoreCard(health),
      revenueForecastCard(forecast),
      staffingCard(appointments, staff, now),
      retentionCard(clientAppointments, now),
      marketingCard(clientAppointments, now),
      predictiveCard(clientAppointments, forecast, now),
      pricingCard,
      goalsCard,
    ],
  };
}
