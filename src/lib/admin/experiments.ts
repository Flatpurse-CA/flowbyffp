// Real A/B experiment computation. Variant assignment reuses the exact hash
// feature_flags rollout uses (src/lib/featureFlags.ts) so a shop lands on the
// same variant whether you're computing results or actually gating behavior.
// Conversion = the shop had a real completed appointment during the
// experiment window — no synthetic event stream.

import { findSlowestWeekday, type MetricsAppointment } from "@/lib/dashboard/metrics";

const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MS_PER_DAY = 24 * 60 * 60 * 1000;

type StatusRecord = { starts_at: string; status: MetricsAppointment["status"] };

function hashToPct(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) % 100;
}

export function getVariant(experimentKey: string, shopId: string, rolloutPct: number): "a" | "b" {
  return hashToPct(shopId + experimentKey) < rolloutPct ? "b" : "a";
}

export type ExperimentResults = {
  variantA: { exposed: number; converted: number; ratePct: number };
  variantB: { exposed: number; converted: number; ratePct: number };
  liftPct: number | null;
  zScore: number | null;
  significant: boolean;
};

export function computeExperimentResults(
  experimentKey: string,
  rolloutPct: number,
  windowStart: Date,
  windowEnd: Date,
  shops: { id: string; created_at: string }[],
  appointments: (StatusRecord & { shop_id: string })[],
): ExperimentResults {
  const eligibleShops = shops.filter(s => new Date(s.created_at).getTime() < windowEnd.getTime());

  const apptsByShop = new Map<string, { starts_at: Date; status: string }[]>();
  for (const a of appointments) {
    if (!apptsByShop.has(a.shop_id)) apptsByShop.set(a.shop_id, []);
    apptsByShop.get(a.shop_id)!.push({ starts_at: new Date(a.starts_at), status: a.status });
  }

  const groups = { a: { exposed: 0, converted: 0 }, b: { exposed: 0, converted: 0 } };

  for (const s of eligibleShops) {
    const variant = getVariant(experimentKey, s.id, rolloutPct);
    groups[variant].exposed++;
    const appts = apptsByShop.get(s.id) ?? [];
    const converted = appts.some(a =>
      a.status === "completed" &&
      a.starts_at.getTime() >= windowStart.getTime() &&
      a.starts_at.getTime() <= windowEnd.getTime(),
    );
    if (converted) groups[variant].converted++;
  }

  const rateA = groups.a.exposed > 0 ? groups.a.converted / groups.a.exposed : 0;
  const rateB = groups.b.exposed > 0 ? groups.b.converted / groups.b.exposed : 0;

  // Two-proportion z-test.
  let zScore: number | null = null;
  let significant = false;
  if (groups.a.exposed > 0 && groups.b.exposed > 0) {
    const pooled = (groups.a.converted + groups.b.converted) / (groups.a.exposed + groups.b.exposed);
    const se = Math.sqrt(pooled * (1 - pooled) * (1 / groups.a.exposed + 1 / groups.b.exposed));
    zScore = se > 0 ? (rateB - rateA) / se : null;
    significant = zScore !== null && Math.abs(zScore) >= 1.96;
  }

  return {
    variantA: { exposed: groups.a.exposed, converted: groups.a.converted, ratePct: Math.round(rateA * 1000) / 10 },
    variantB: { exposed: groups.b.exposed, converted: groups.b.converted, ratePct: Math.round(rateB * 1000) / 10 },
    liftPct: rateA > 0 ? Math.round(((rateB - rateA) / rateA) * 1000) / 10 : null,
    zScore: zScore !== null ? Math.round(zScore * 100) / 100 : null,
    significant,
  };
}

/** Deterministic "AI Analyst" summary — a template filled from real computed results, not an LLM call. */
export function summarizeExperiment(
  variantALabel: string,
  variantBLabel: string,
  results: ExperimentResults,
): string {
  const total = results.variantA.exposed + results.variantB.exposed;
  if (total === 0) return "No shops have reached this experiment yet.";

  if (results.significant) {
    const bWinning = (results.liftPct ?? 0) > 0;
    const winner = bWinning ? variantBLabel : variantALabel;
    return `${winner} is winning with statistical significance (z=${results.zScore}). ${variantBLabel} conversion is ${results.variantB.ratePct}% vs ${variantALabel}'s ${results.variantA.ratePct}%, across ${total} shops.`;
  }
  return `Not yet statistically significant (z=${results.zScore ?? "n/a"}). ${variantBLabel} ${results.variantB.ratePct}% vs ${variantALabel} ${results.variantA.ratePct}%, based on ${total} shops so far.`;
}

/** Deterministic "AI Generator" — experiment ideas derived from real platform signals, not an LLM call. */
export function generateExperimentIdeas(
  shops: { plan: string; created_at: string }[],
  appointments: StatusRecord[],
  now: Date,
): string[] {
  const ideas: string[] = [];

  const slowest = findSlowestWeekday(appointments, now);
  if (slowest) {
    ideas.push(`Test a platform-wide promo on ${WEEKDAYS[slowest.weekdayIndex]}s — it's the lowest-booked day across all shops over the last 4 weeks.`);
  }

  const staleStarters = shops.filter(s => s.plan === "starter" && (now.getTime() - new Date(s.created_at).getTime()) / MS_PER_DAY > 30);
  if (staleStarters.length > 0) {
    ideas.push(`${staleStarters.length} shop${staleStarters.length === 1 ? "" : "s"} have been on Starter for 30+ days without upgrading — test an in-app upgrade nudge.`);
  }

  if (ideas.length === 0) ideas.push("Not enough platform data yet to suggest an experiment.");
  return ideas;
}

/** Deterministic "AI Product Scientist" — strategic bullets from real shop-table signals, not an LLM call. */
export function generateStrategicSummary(
  shops: { plan: string; subscription_status: string | null; created_at: string }[],
  now: Date,
): string[] {
  const bullets: string[] = [];

  const daysAgo = (d: string) => (now.getTime() - new Date(d).getTime()) / MS_PER_DAY;
  const last30 = shops.filter(s => daysAgo(s.created_at) <= 30).length;
  const prev30 = shops.filter(s => { const d = daysAgo(s.created_at); return d > 30 && d <= 60; }).length;
  if (last30 !== prev30) {
    bullets.push(`Signups are ${last30 > prev30 ? "up" : "down"}: ${last30} new shops in the last 30 days vs ${prev30} the 30 days before.`);
  }

  const canceled = shops.filter(s => s.subscription_status === "canceled").length;
  if (canceled > 0) {
    bullets.push(`${canceled} shop${canceled === 1 ? "" : "s"} canceled their subscription — worth a churn-interview outreach.`);
  }

  if (shops.length > 0) {
    const freePct = Math.round((shops.filter(s => s.plan === "starter").length / shops.length) * 100);
    bullets.push(`${freePct}% of shops are still on the free Starter plan — the biggest lever for MRR growth is Starter-to-Pro conversion.`);
  }

  if (bullets.length === 0) bullets.push("Not enough data yet for a strategic read.");
  return bullets;
}
