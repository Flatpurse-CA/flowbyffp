import { createAdminClient } from "@/lib/supabase/admin";
import { FlaskConical, ShieldAlert, Sparkles, Lightbulb, Brain } from "lucide-react";
import { computeExperimentResults, summarizeExperiment, generateExperimentIdeas, generateStrategicSummary } from "@/lib/admin/experiments";
import { createExperiment, startExperiment, pauseExperiment, rolloutWinner, archiveExperiment } from "./actions";
import { GuardrailThresholdInput } from "./GuardrailThresholdInput";

const MS_PER_DAY = 24 * 60 * 60 * 1000;

type Experiment = {
  id: string; key: string; name: string; hypothesis: string | null;
  variant_a_label: string; variant_b_label: string; feature_flag_key: string;
  status: "draft" | "running" | "paused" | "completed" | "archived";
  started_at: string | null; ended_at: string | null; winner: "a" | "b" | null;
  created_at: string;
};

type GuardrailMetric = { id: string; key: string; label: string; comparison: "above_bad" | "below_bad"; threshold: number };

const card: React.CSSProperties = { background: "var(--am1)", border: "1px solid var(--aw09)", borderRadius: 18 };
// Solid fg/bg pairs, not a single accent color with a `${color}1A` hex-alpha
// suffix appended for the background — that trick silently produces invalid
// CSS (and therefore no background at all) when color is an rgb()/var()
// string rather than a hex literal.
const NEUTRAL_BADGE = { fg: "rgb(255,255,255)", bg: "rgb(100,116,139)" };
const STATUS_COLOR: Record<string, { fg: string; bg: string }> = {
  draft:     NEUTRAL_BADGE,
  running:   { fg: "var(--astatus-green-fg)",  bg: "var(--astatus-green-bg)" },
  paused:    { fg: "var(--astatus-amber-fg)",  bg: "var(--astatus-amber-bg)" },
  completed: { fg: "var(--astatus-blue-fg)",   bg: "var(--astatus-blue-bg)" },
  archived:  NEUTRAL_BADGE,
};

function guardrailStatus(value: number, g: GuardrailMetric): "healthy" | "warning" | "critical" {
  if (g.comparison === "above_bad") {
    if (value >= g.threshold) return "critical";
    if (value >= g.threshold * 0.7) return "warning";
    return "healthy";
  }
  if (value <= g.threshold) return "critical";
  if (value <= g.threshold * 1.3) return "warning";
  return "healthy";
}

const GUARDRAIL_STATUS_COLOR = {
  healthy:  { fg: "var(--astatus-green-fg)", bg: "var(--astatus-green-bg)" },
  warning:  { fg: "var(--astatus-amber-fg)", bg: "var(--astatus-amber-bg)" },
  critical: { fg: "var(--astatus-red-fg)",   bg: "var(--astatus-red-bg)" },
};

export default async function AdminExperimentsPage() {
  const admin = createAdminClient();
  const now = new Date();

  const [experimentsRes, flagsRes, guardrailsRes, shopsRes, apptsRes, disputesRes] = await Promise.all([
    admin.from("experiments").select("*").order("created_at", { ascending: false }),
    admin.from("feature_flags").select("key, rollout_pct, enabled"),
    admin.from("guardrail_metrics").select("*"),
    admin.from("shops").select("id, plan, created_at, subscription_status"),
    admin.from("appointments").select("shop_id, starts_at, status"),
    admin.from("disputes").select("status"),
  ]);

  const experiments = (experimentsRes.data ?? []) as Experiment[];
  const flagsByKey = Object.fromEntries((flagsRes.data ?? []).map(f => [f.key, f]));
  const guardrails = (guardrailsRes.data ?? []) as GuardrailMetric[];
  const shops = (shopsRes.data ?? []) as { id: string; plan: string; created_at: string; subscription_status: string | null }[];
  const appointments = (apptsRes.data ?? []) as { shop_id: string; starts_at: string; status: "confirmed" | "pending" | "deposit" | "completed" | "cancelled" }[];
  const disputes = (disputesRes.data ?? []) as { status: string }[];

  // Guardrail current values, trailing 30 days.
  const trailingStart = new Date(now.getTime() - 30 * MS_PER_DAY);
  const trailingAppts = appointments.filter(a => {
    const t = new Date(a.starts_at);
    return t >= trailingStart && t <= now;
  });
  const cancellationRate = trailingAppts.length > 0 ? Math.round((trailingAppts.filter(a => a.status === "cancelled").length / trailingAppts.length) * 1000) / 10 : 0;
  const openDisputesCount = disputes.filter(d => d.status !== "won" && d.status !== "lost").length;
  const activeShopIds = new Set(trailingAppts.filter(a => a.status === "completed").map(a => a.shop_id));
  const avgFillRate = shops.length > 0 ? Math.round((activeShopIds.size / shops.length) * 1000) / 10 : 0;

  const guardrailValues: Record<string, number> = {
    cancellation_rate: cancellationRate,
    open_disputes: openDisputesCount,
    avg_fill_rate: avgFillRate,
  };

  const ideas = generateExperimentIdeas(shops, appointments, now);
  const strategicBullets = generateStrategicSummary(shops, now);

  const mostActive = experiments.find(e => e.status === "running") ?? experiments.find(e => e.status === "completed");
  let analystText = "No running or completed experiments yet.";
  if (mostActive) {
    const flag = flagsByKey[mostActive.feature_flag_key];
    const results = computeExperimentResults(
      mostActive.key, flag?.rollout_pct ?? 50,
      new Date(mostActive.started_at ?? mostActive.created_at), mostActive.ended_at ? new Date(mostActive.ended_at) : now,
      shops, appointments,
    );
    analystText = `${mostActive.name}: ${summarizeExperiment(mostActive.variant_a_label, mostActive.variant_b_label, results)}`;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <h1 style={{ color: "var(--atext2)", fontSize: 22, fontWeight: 800, margin: "0 0 4px", letterSpacing: "-0.03em" }}>Experiments</h1>
        <p style={{ color: "var(--aw3)", fontSize: 13, margin: 0 }}>
          Real A/B tests backed by feature flags: variant split is deterministic, conversion is measured against actual completed bookings. No LLM involved; the cards below are templated summaries of real numbers.
        </p>
      </div>

      {/* Guardrails */}
      <div style={{ ...card, padding: "20px 24px" }}>
        <p style={{ color: "var(--atext)", fontSize: 14, fontWeight: 700, margin: "0 0 14px", display: "flex", alignItems: "center", gap: 8 }}>
          <ShieldAlert size={16} color="rgb(251,191,36)" /> Guardrail metrics
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {guardrails.map(g => {
            const value = guardrailValues[g.key] ?? 0;
            const status = guardrailStatus(value, g);
            return (
              <div key={g.id} style={{ background: "var(--aw02)", border: "1px solid var(--aw06)", borderRadius: 12, padding: "14px 16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                  <p style={{ color: "var(--aw6)", fontSize: 12.5, fontWeight: 600, margin: 0 }}>{g.label}</p>
                  <span style={{ fontSize: 9.5, fontWeight: 700, padding: "2px 8px", borderRadius: 20, textTransform: "uppercase", color: GUARDRAIL_STATUS_COLOR[status].fg, background: GUARDRAIL_STATUS_COLOR[status].bg }}>
                    {status}
                  </span>
                </div>
                <p style={{ color: "var(--atext2)", fontSize: 22, fontWeight: 800, margin: "0 0 10px" }}>{value}{g.key === "open_disputes" ? "" : "%"}</p>
                <GuardrailThresholdInput id={g.id} threshold={g.threshold} />
              </div>
            );
          })}
        </div>
      </div>

      {/* AI cards (deterministic templates over real data) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3.5">
        <div style={{ ...card, padding: "18px 20px" }}>
          <p style={{ color: "var(--atext)", fontSize: 13.5, fontWeight: 700, margin: "0 0 10px", display: "flex", alignItems: "center", gap: 7 }}>
            <Sparkles size={15} color="rgb(167,139,250)" /> Analyst
          </p>
          <p style={{ color: "var(--aw55)", fontSize: 12.5, lineHeight: 1.6, margin: 0 }}>{analystText}</p>
        </div>
        <div style={{ ...card, padding: "18px 20px" }}>
          <p style={{ color: "var(--atext)", fontSize: 13.5, fontWeight: 700, margin: "0 0 10px", display: "flex", alignItems: "center", gap: 7 }}>
            <Lightbulb size={15} color="rgb(251,191,36)" /> Generator
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {ideas.map((idea, i) => (
              <p key={i} style={{ color: "var(--aw55)", fontSize: 12.5, lineHeight: 1.6, margin: 0 }}>{idea}</p>
            ))}
          </div>
        </div>
        <div style={{ ...card, padding: "18px 20px" }}>
          <p style={{ color: "var(--atext)", fontSize: 13.5, fontWeight: 700, margin: "0 0 10px", display: "flex", alignItems: "center", gap: 7 }}>
            <Brain size={15} color="rgb(52,211,153)" /> Product Scientist
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {strategicBullets.map((b, i) => (
              <p key={i} style={{ color: "var(--aw55)", fontSize: 12.5, lineHeight: 1.6, margin: 0 }}>{b}</p>
            ))}
          </div>
        </div>
      </div>

      {/* Create experiment */}
      <div style={{ ...card, padding: "20px 24px" }}>
        <p style={{ color: "var(--atext)", fontSize: 14, fontWeight: 700, margin: "0 0 14px" }}>New experiment</p>
        <form action={createExperiment} style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "flex-end" }}>
          {[
            { name: "key", label: "Key", placeholder: "e.g. new_booking_cta", required: true, flex: "1 1 160px" },
            { name: "name", label: "Name", placeholder: "New booking CTA", required: true, flex: "1 1 180px" },
            { name: "variant_a_label", label: "Variant A", placeholder: "Control", required: false, flex: "1 1 120px" },
            { name: "variant_b_label", label: "Variant B", placeholder: "Variant B", required: false, flex: "1 1 120px" },
            { name: "hypothesis", label: "Hypothesis", placeholder: "Optional", required: false, flex: "2 1 220px" },
          ].map(f => (
            <div key={f.name} style={{ flex: f.flex }}>
              <label style={{ color: "var(--aw4)", fontSize: 11.5, fontWeight: 600, display: "block", marginBottom: 5 }}>{f.label}</label>
              <input name={f.name} placeholder={f.placeholder} required={f.required} style={{
                width: "100%", background: "var(--aw04)", border: "1px solid var(--aw09)",
                borderRadius: 9, padding: "9px 12px", color: "var(--atext)", fontSize: 13, outline: "none", boxSizing: "border-box",
              }} />
            </div>
          ))}
          <button type="submit" style={{ padding: "9px 20px", borderRadius: 9, border: "none", background: "rgb(109,40,217)", color: "white", fontSize: 13, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}>
            Create
          </button>
        </form>
      </div>

      {/* Experiments list */}
      {experiments.length === 0 ? (
        <div style={{ ...card, minHeight: 170, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10 }}>
          <div style={{ width: 50, height: 50, borderRadius: "50%", background: "var(--aw04)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <FlaskConical size={22} color="var(--aw2)" strokeWidth={1.4} />
          </div>
          <p style={{ color: "var(--aw3)", fontSize: 13, fontWeight: 600, margin: 0 }}>No experiments yet</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {experiments.map(e => {
            const flag = flagsByKey[e.feature_flag_key];
            const hasStarted = Boolean(e.started_at);
            const results = hasStarted
              ? computeExperimentResults(e.key, flag?.rollout_pct ?? 50, new Date(e.started_at!), e.ended_at ? new Date(e.ended_at) : now, shops, appointments)
              : null;

            return (
              <div key={e.id} style={{ ...card, padding: "18px 22px" }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 10, marginBottom: results ? 14 : 0 }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                      <p style={{ color: "var(--atext2)", fontSize: 14, fontWeight: 700, margin: 0 }}>{e.name}</p>
                      <span style={{ fontSize: 9.5, fontWeight: 700, padding: "2px 8px", borderRadius: 20, textTransform: "uppercase", color: STATUS_COLOR[e.status].fg, background: STATUS_COLOR[e.status].bg }}>
                        {e.status}
                      </span>
                      {e.winner && (
                        <span style={{ fontSize: 9.5, fontWeight: 700, padding: "2px 8px", borderRadius: 20, color: "var(--astatus-green-fg)", background: "var(--astatus-green-bg)" }}>
                          Winner: {e.winner === "a" ? e.variant_a_label : e.variant_b_label}
                        </span>
                      )}
                    </div>
                    <p style={{ color: "var(--aw35)", fontSize: 11.5, margin: 0, fontFamily: "monospace" }}>{e.key}</p>
                    {e.hypothesis && <p style={{ color: "var(--aw4)", fontSize: 12, margin: "4px 0 0" }}>{e.hypothesis}</p>}
                  </div>

                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {e.status === "draft" && (
                      <form action={startExperiment}>
                        <input type="hidden" name="id" value={e.id} /><input type="hidden" name="flagKey" value={e.feature_flag_key} />
                        <button type="submit" style={{ padding: "7px 14px", borderRadius: 8, border: "none", background: "var(--astatus-green-bg)", color: "var(--astatus-green-fg)", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Start</button>
                      </form>
                    )}
                    {e.status === "running" && (
                      <>
                        <form action={pauseExperiment}>
                          <input type="hidden" name="id" value={e.id} /><input type="hidden" name="flagKey" value={e.feature_flag_key} />
                          <button type="submit" style={{ padding: "7px 14px", borderRadius: 8, border: "1px solid var(--aw1)", background: "var(--aw04)", color: "var(--aw6)", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Pause</button>
                        </form>
                        <form action={rolloutWinner}>
                          <input type="hidden" name="id" value={e.id} /><input type="hidden" name="flagKey" value={e.feature_flag_key} /><input type="hidden" name="winner" value="a" />
                          <button type="submit" style={{ padding: "7px 14px", borderRadius: 8, border: "none", background: "var(--astatus-blue-bg)", color: "var(--astatus-blue-fg)", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Roll out {e.variant_a_label}</button>
                        </form>
                        <form action={rolloutWinner}>
                          <input type="hidden" name="id" value={e.id} /><input type="hidden" name="flagKey" value={e.feature_flag_key} /><input type="hidden" name="winner" value="b" />
                          <button type="submit" style={{ padding: "7px 14px", borderRadius: 8, border: "none", background: "var(--astatus-purple-bg)", color: "var(--astatus-purple-fg)", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Roll out {e.variant_b_label}</button>
                        </form>
                      </>
                    )}
                    {e.status === "paused" && (
                      <form action={startExperiment}>
                        <input type="hidden" name="id" value={e.id} /><input type="hidden" name="flagKey" value={e.feature_flag_key} />
                        <button type="submit" style={{ padding: "7px 14px", borderRadius: 8, border: "none", background: "var(--astatus-green-bg)", color: "var(--astatus-green-fg)", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Resume</button>
                      </form>
                    )}
                    {(e.status === "completed" || e.status === "paused") && (
                      <form action={archiveExperiment}>
                        <input type="hidden" name="id" value={e.id} />
                        <button type="submit" style={{ padding: "7px 14px", borderRadius: 8, border: "1px solid var(--aw1)", background: "transparent", color: "var(--aw4)", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Archive</button>
                      </form>
                    )}
                  </div>
                </div>

                {results && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                      { label: e.variant_a_label, sub: `${results.variantA.exposed} shops`, value: `${results.variantA.ratePct}%` },
                      { label: e.variant_b_label, sub: `${results.variantB.exposed} shops`, value: `${results.variantB.ratePct}%` },
                      { label: "Lift", sub: "B vs A", value: results.liftPct !== null ? `${results.liftPct > 0 ? "+" : ""}${results.liftPct}%` : "-" },
                      { label: "Significance", sub: results.zScore !== null ? `z=${results.zScore}` : "no data", value: results.significant ? "Significant" : "Not yet" },
                    ].map(m => (
                      <div key={m.label} style={{ background: "var(--aw02)", border: "1px solid var(--aw06)", borderRadius: 10, padding: "10px 12px" }}>
                        <p style={{ color: "var(--aw4)", fontSize: 10.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 4px" }}>{m.label}</p>
                        <p style={{ color: "var(--atext2)", fontSize: 16, fontWeight: 800, margin: "0 0 2px" }}>{m.value}</p>
                        <p style={{ color: "var(--aw3)", fontSize: 11, margin: 0 }}>{m.sub}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
