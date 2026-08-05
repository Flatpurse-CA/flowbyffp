"use client";

import { useMemo, useState } from "react";
import { TrendingUp, TrendingDown, Users, ChevronDown } from "lucide-react";
import type { OperationsData } from "./actions";
import { computeStaffUtilization, computeHealthScore, type MetricsAppointment } from "@/lib/dashboard/metrics";
import { deriveClients, type ClientAppointment } from "@/lib/dashboard/clients";
import { computeOpportunities } from "@/lib/dashboard/opportunities";
import { tint } from "@/lib/color";

const MODULES = ["Overview", "Revenue", "Team", "Clients", "AI", "Finance"] as const;
type Module = typeof MODULES[number];

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function fmtPrice(n: number) {
  const sign = n < 0 ? "-" : "";
  const abs = Math.abs(n);
  return `${sign}C$${Number.isInteger(abs) ? abs : abs.toFixed(2)}`;
}

const card: React.CSSProperties = {
  background: "var(--dw025)",
  border: "1px solid var(--dw07)",
  borderRadius: 16,
  padding: 20,
};

function KPITile({ label, value, sub, positive }: { label: string; value: string; sub: string; positive?: boolean }) {
  return (
    <div style={{ ...card, padding: "16px 18px" }}>
      <p style={{ color: "var(--dw35)", fontSize: 10, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", margin: "0 0 6px" }}>{label}</p>
      <p style={{ color: "var(--dtext)", fontSize: 22, fontWeight: 800, margin: "0 0 4px", letterSpacing: "-0.03em" }}>{value}</p>
      <p style={{ color: positive === false ? "rgb(248,113,113)" : "rgb(52,211,153)", fontSize: 11, margin: 0, display: "flex", alignItems: "center", gap: 3 }}>
        {positive === false ? <TrendingDown size={11} /> : <TrendingUp size={11} />} {sub}
      </p>
    </div>
  );
}

export function OperationsClient({ data }: { data: OperationsData }) {
  const [mod, setMod] = useState<Module>("Overview");
  const now = useMemo(() => new Date(), []);

  const metricsAppts: MetricsAppointment[] = useMemo(() => data.appointments.map(a => ({
    id: a.id, staff_id: a.staff_id, starts_at: a.starts_at,
    duration_minutes: a.duration_minutes, price: Number(a.price), status: a.status,
  })), [data.appointments]);

  const clientAppts: ClientAppointment[] = useMemo(() => data.appointments.map(a => ({
    client_name: a.client_name, client_phone: a.client_phone, client_email: a.client_email,
    starts_at: a.starts_at, price: Number(a.price), status: a.status,
  })), [data.appointments]);

  const monthStart = useMemo(() => new Date(now.getFullYear(), now.getMonth(), 1), [now]);

  const thisMonthAppts = useMemo(() => data.appointments.filter(a => {
    const t = new Date(a.starts_at);
    return t >= monthStart && t <= now;
  }), [data.appointments, monthStart, now]);

  const thisMonthRevenue = thisMonthAppts.filter(a => a.status === "completed").reduce((s, a) => s + Number(a.price), 0);

  const cancelledThisMonth = thisMonthAppts.filter(a => a.status === "cancelled");
  const cancellationRate = thisMonthAppts.length > 0 ? Math.round((cancelledThisMonth.length / thisMonthAppts.length) * 100) : 0;
  const missedRevenueThisMonth = cancelledThisMonth.reduce((s, a) => s + Number(a.price), 0);

  const upcomingCount = useMemo(() => {
    const weekOut = new Date(now.getTime() + 7 * MS_PER_DAY);
    return data.appointments.filter(a => {
      const t = new Date(a.starts_at);
      return t >= now && t <= weekOut && a.status !== "cancelled" && a.status !== "completed";
    }).length;
  }, [data.appointments, now]);

  const allClients = useMemo(() => deriveClients(clientAppts, now), [clientAppts, now]);

  // No persisted staff schedule exists yet — capacity is an approximation, same as metrics.ts.
  const health = useMemo(
    () => computeHealthScore(metricsAppts, clientAppts, data.staff.length, data.autopilotRevenueThisMonth, now),
    [metricsAppts, clientAppts, data.staff.length, data.autopilotRevenueThisMonth, now],
  );
  const { score: operationsScore, fillRate, retention, revenueGrowthScore, aiContribution } = health;

  const opportunities = useMemo(() => computeOpportunities(clientAppts, now), [clientAppts, now]);

  return (
    <div style={{ maxWidth: 1280, margin: "0 auto", display: "flex", flexDirection: "column", gap: 22 }}>

      <div>
        <h1 style={{ color: "var(--dtext)", fontSize: 22, fontWeight: 800, margin: "0 0 3px", letterSpacing: "-0.03em" }}>Operations</h1>
        <p style={{ color: "var(--dw35)", fontSize: 13, margin: 0 }}>Run smarter. Waste less. Profit more.</p>
      </div>

      <div style={{ display: "flex", gap: 2, borderBottom: "1px solid var(--dw07)", paddingBottom: 0, overflowX: "auto" }}>
        {MODULES.map(m => (
          <button key={m} onClick={() => setMod(m)} style={{
            padding: "10px 18px", border: "none", background: "transparent", cursor: "pointer",
            fontSize: 13, fontWeight: mod === m ? 700 : 500,
            color: mod === m ? "var(--dpurple-text)" : "var(--dw4)",
            borderBottom: mod === m ? "2px solid rgb(139,92,246)" : "2px solid transparent",
            transition: "color 0.15s, border-color 0.15s",
            whiteSpace: "nowrap",
          }}>
            {m}
          </button>
        ))}
      </div>

      {mod === "Overview" && (
        <Overview
          operationsScore={operationsScore}
          fillRate={fillRate} retention={retention} revenueGrowthScore={revenueGrowthScore} aiContribution={aiContribution}
          thisMonthRevenue={thisMonthRevenue} autopilotRevenue={data.autopilotRevenueThisMonth}
          upcomingCount={upcomingCount} cancellationRate={cancellationRate}
          opportunities={opportunities.slice(0, 3)}
        />
      )}
      {mod === "Revenue" && (
        <Revenue
          appointments={data.appointments} now={now}
          thisMonthRevenue={thisMonthRevenue} autopilotRevenue={data.autopilotRevenueThisMonth}
          missedRevenueThisMonth={missedRevenueThisMonth}
        />
      )}
      {mod === "Team" && <TeamModule staff={data.staff} metricsAppts={metricsAppts} monthStart={monthStart} now={now} />}
      {mod === "Clients" && <ClientsModule clients={allClients} appointments={clientAppts} now={now} retention={retention} />}
      {mod === "AI" && <AIModule opportunities={opportunities} />}
      {mod === "Finance" && <Finance />}
    </div>
  );
}

// ─── Overview ─────────────────────────────────────────────────────────────────
function Overview({ operationsScore, fillRate, retention, revenueGrowthScore, aiContribution, thisMonthRevenue, autopilotRevenue, upcomingCount, cancellationRate, opportunities }: {
  operationsScore: number; fillRate: number; retention: number; revenueGrowthScore: number; aiContribution: number;
  thisMonthRevenue: number; autopilotRevenue: number; upcomingCount: number; cancellationRate: number;
  opportunities: ReturnType<typeof computeOpportunities>;
}) {
  const subMetrics = [
    { label: "Booking fill rate", value: fillRate },
    { label: "Client retention", value: retention },
    { label: "Revenue growth", value: revenueGrowthScore },
    { label: "AI contribution", value: aiContribution },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div className="ops-score-grid" style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: 20 }}>
        <div style={{ ...card, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12 }}>
          <svg width={120} height={120} viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="50" fill="none" stroke="var(--dw06)" strokeWidth="10" />
            <circle cx="60" cy="60" r="50" fill="none" stroke="rgb(139,92,246)" strokeWidth="10"
              strokeDasharray={`${(operationsScore / 100) * 314} 314`} strokeLinecap="round"
              transform="rotate(-90 60 60)" />
            <text x="60" y="56" textAnchor="middle" fill="var(--dtext)" fontSize="24" fontWeight="800">{operationsScore}</text>
            <text x="60" y="72" textAnchor="middle" fill="var(--dw35)" fontSize="10">/100</text>
          </svg>
          <p style={{ color: "var(--dw5)", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", margin: 0 }}>
            Operations Score
          </p>
        </div>

        <div style={{ ...card, display: "flex", flexDirection: "column", gap: 14 }}>
          {subMetrics.map(m => (
            <div key={m.label}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                <span style={{ color: "var(--dw5)", fontSize: 12 }}>{m.label}</span>
                <span style={{ color: "var(--dtext)", fontSize: 12, fontWeight: 700 }}>{m.value}%</span>
              </div>
              <div style={{ height: 5, background: "var(--dw06)", borderRadius: 3 }}>
                <div style={{ height: "100%", width: `${m.value}%`, borderRadius: 3, background: m.value > 80 ? "rgb(52,211,153)" : m.value > 60 ? "rgb(251,191,36)" : "rgb(248,113,113)", transition: "width 0.5s ease" }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="ops-kpi-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
        <KPITile label="This month" value={fmtPrice(thisMonthRevenue)} sub="completed appointments" />
        <KPITile label="AutoPilot recovered" value={fmtPrice(autopilotRevenue)} sub="this month" />
        <KPITile label="Upcoming (7d)" value={String(upcomingCount)} sub="bookings scheduled" />
        <KPITile label="Cancellation rate" value={`${cancellationRate}%`} sub="this month" positive={cancellationRate <= 10} />
      </div>

      <div style={card}>
        <p style={{ color: "var(--dw4)", fontSize: 11, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", margin: "0 0 14px" }}>Top AI opportunities</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {opportunities.map(o => (
            <div key={o.tag} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", background: "var(--dw02)", borderRadius: 10 }}>
              <span style={{ fontSize: 9, fontWeight: 800, color: o.color, background: tint(o.color, 0.09), padding: "3px 8px", borderRadius: 20, whiteSpace: "nowrap", letterSpacing: "0.06em" }}>{o.tag}</span>
              <span style={{ color: "var(--dw6)", fontSize: 13, flex: 1 }}>{o.text}</span>
              {o.impact && <span style={{ color: "rgb(52,211,153)", fontSize: 12, fontWeight: 700, whiteSpace: "nowrap" }}>{o.impact}</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Revenue ──────────────────────────────────────────────────────────────────
function Revenue({ appointments, now, thisMonthRevenue, autopilotRevenue, missedRevenueThisMonth }: {
  appointments: OperationsData["appointments"]; now: Date;
  thisMonthRevenue: number; autopilotRevenue: number; missedRevenueThisMonth: number;
}) {
  const days: { label: string; value: number }[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now.getTime() - i * MS_PER_DAY);
    const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const dayEnd = new Date(dayStart.getTime() + MS_PER_DAY);
    const revenue = appointments
      .filter(a => a.status === "completed" && new Date(a.starts_at) >= dayStart && new Date(a.starts_at) < dayEnd)
      .reduce((s, a) => s + Number(a.price), 0);
    days.push({ label: dayStart.toLocaleDateString("en-CA", { month: "short", day: "numeric" }), value: revenue });
  }

  const W = 100; const H = 70;
  const max = Math.max(...days.map(d => d.value), 1) * 1.1;
  const pts = days.map((d, i) => `${(i / (days.length - 1)) * W},${H - (d.value / max) * H}`).join(" ");
  const area = `0,${H} ` + pts + ` ${W},${H}`;

  const serviceMap = new Map<string, { revenue: number; bookings: number }>();
  for (const a of appointments) {
    if (a.status !== "completed") continue;
    const entry = serviceMap.get(a.service_name) ?? { revenue: 0, bookings: 0 };
    entry.revenue += Number(a.price);
    entry.bookings += 1;
    serviceMap.set(a.service_name, entry);
  }
  const services = Array.from(serviceMap.entries())
    .map(([name, v]) => ({ name, ...v }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);
  const maxServiceRevenue = Math.max(...services.map(s => s.revenue), 1);

  const avgPerDay = thisMonthRevenue / Math.max(1, now.getDate());
  const autopilotPct = thisMonthRevenue > 0 ? Math.round((autopilotRevenue / thisMonthRevenue) * 100) : 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div className="ops-kpi-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
        <KPITile label="This month" value={fmtPrice(thisMonthRevenue)} sub="completed appointments" />
        <KPITile label="AutoPilot" value={fmtPrice(autopilotRevenue)} sub={`${autopilotPct}% of total`} />
        <KPITile label="Avg/day" value={fmtPrice(avgPerDay)} sub="this month so far" />
        <KPITile label="Missed revenue" value={fmtPrice(missedRevenueThisMonth)} sub="cancellations this month" positive={missedRevenueThisMonth === 0} />
      </div>

      <div style={card}>
        <p style={{ color: "var(--dw4)", fontSize: 11, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", margin: "0 0 16px" }}>Daily revenue — last 30 days</p>
        <svg viewBox="0 0 100 70" preserveAspectRatio="none" style={{ width: "100%", height: 140 }}>
          <defs>
            <linearGradient id="rev-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgb(139,92,246)" stopOpacity="0.3" />
              <stop offset="100%" stopColor="rgb(139,92,246)" stopOpacity="0" />
            </linearGradient>
          </defs>
          <polygon points={area} fill="url(#rev-grad)" />
          <polyline points={pts} stroke="rgb(139,92,246)" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
          {days.filter((_, i) => i % 5 === 0).map(d => (
            <span key={d.label} style={{ color: "var(--dw2)", fontSize: 10 }}>{d.label}</span>
          ))}
        </div>
      </div>

      <div style={card}>
        <p style={{ color: "var(--dw4)", fontSize: 11, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", margin: "0 0 14px" }}>Service performance</p>
        {services.length === 0 ? (
          <p style={{ color: "var(--dw3)", fontSize: 13, margin: 0 }}>No completed appointments yet.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {services.map(s => (
              <div key={s.name} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ color: "var(--dw6)", fontSize: 13, width: 150, flexShrink: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.name}</span>
                <div style={{ flex: 1, height: 6, background: "var(--dw06)", borderRadius: 3 }}>
                  <div style={{ height: "100%", width: `${(s.revenue / maxServiceRevenue) * 100}%`, borderRadius: 3, background: "rgb(139,92,246)" }} />
                </div>
                <span style={{ color: "rgb(52,211,153)", fontSize: 12, fontWeight: 700, width: 72, textAlign: "right", flexShrink: 0 }}>{fmtPrice(s.revenue)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Team ─────────────────────────────────────────────────────────────────────
function TeamModule({ staff, metricsAppts, monthStart, now }: {
  staff: OperationsData["staff"]; metricsAppts: MetricsAppointment[]; monthStart: Date; now: Date;
}) {
  if (staff.length === 0) {
    return <Placeholder icon={<Users size={28} color="rgb(167,139,250)" />} title="Team" desc="Add team members on the Team page to see per-staff efficiency here." />;
  }

  const rows = staff.map(s => ({ ...s, ...computeStaffUtilization(metricsAppts, s.id, monthStart, now) }))
    .sort((a, b) => b.revenue - a.revenue);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={card}>
        <p style={{ color: "var(--dw4)", fontSize: 11, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", margin: "0 0 14px" }}>Per-staff efficiency — this month</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {rows.map(r => (
            <div key={r.id} style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{
                width: 34, height: 34, borderRadius: 10, background: tint(r.color, 0.13), border: `1.5px solid ${tint(r.color, 0.27)}`,
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: r.color, flexShrink: 0,
              }}>
                {r.full_name.split(" ").map(w => w[0]).slice(0, 2).join("")}
              </div>
              <span style={{ color: "var(--dtext)", fontSize: 13, fontWeight: 600, width: 140, flexShrink: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.full_name}</span>
              <div style={{ flex: 1, height: 6, background: "var(--dw06)", borderRadius: 3 }}>
                <div style={{ height: "100%", width: `${r.utilizationPct}%`, borderRadius: 3, background: r.utilizationPct > 85 ? "rgb(52,211,153)" : r.utilizationPct > 65 ? "rgb(251,191,36)" : "rgb(248,113,113)" }} />
              </div>
              <span style={{ color: "var(--dw5)", fontSize: 12, width: 44, textAlign: "right", flexShrink: 0 }}>{r.utilizationPct}%</span>
              <span style={{ color: "rgb(52,211,153)", fontSize: 12, fontWeight: 700, width: 72, textAlign: "right", flexShrink: 0 }}>{fmtPrice(r.revenue)}</span>
            </div>
          ))}
        </div>
      </div>
      <div style={{ ...card, textAlign: "center", padding: "28px 20px" }}>
        <p style={{ color: "var(--dw35)", fontSize: 13, margin: 0 }}>
          Booking-conversion funnel needs booking-page visit analytics — not available yet.
        </p>
      </div>
    </div>
  );
}

// ─── Clients ──────────────────────────────────────────────────────────────────
function ClientsModule({ clients, appointments, now, retention }: {
  clients: ReturnType<typeof deriveClients>; appointments: ClientAppointment[]; now: Date; retention: number;
}) {
  const segments = [
    { label: "VIP", count: clients.filter(c => c.tag === "VIP").length, color: "rgb(251,191,36)" },
    { label: "Loyal", count: clients.filter(c => c.tag === "Loyal").length, color: "rgb(52,211,153)" },
    { label: "Overdue", count: clients.filter(c => c.tag === "Overdue").length, color: "rgb(96,165,250)" },
    { label: "Churn risk", count: clients.filter(c => c.tag === "Churn risk").length, color: "rgb(248,113,113)" },
  ];

  // 8 rolling weekly buckets: is each completed visit the client's first ever, or a repeat?
  const firstVisit = new Map<string, number>();
  for (const c of clients) if (c.lastVisitAt) firstVisit.set(c.key, 0);
  const sortedByClient = new Map<string, string[]>();
  for (const a of appointments) {
    if (a.status !== "completed") continue;
    const key = (a.client_phone || a.client_email || a.client_name).trim().toLowerCase();
    if (!sortedByClient.has(key)) sortedByClient.set(key, []);
    sortedByClient.get(key)!.push(a.starts_at);
  }
  const firstVisitAt = new Map<string, number>();
  for (const [key, dates] of sortedByClient) {
    firstVisitAt.set(key, Math.min(...dates.map(d => new Date(d).getTime())));
  }

  const buckets: { newCount: number; returningCount: number }[] = [];
  for (let w = 7; w >= 0; w--) {
    const bucketEnd = new Date(now.getTime() - w * 7 * MS_PER_DAY);
    const bucketStart = new Date(bucketEnd.getTime() - 7 * MS_PER_DAY);
    let newCount = 0; let returningCount = 0;
    for (const a of appointments) {
      if (a.status !== "completed") continue;
      const t = new Date(a.starts_at).getTime();
      if (t < bucketStart.getTime() || t >= bucketEnd.getTime()) continue;
      const key = (a.client_phone || a.client_email || a.client_name).trim().toLowerCase();
      if (firstVisitAt.get(key) === t) newCount++; else returningCount++;
    }
    buckets.push({ newCount, returningCount });
  }
  const maxBucket = Math.max(...buckets.map(b => b.newCount + b.returningCount), 1);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div className="ops-score-grid" style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: 20 }}>
        <div style={{ ...card, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12 }}>
          <svg width={120} height={120} viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="50" fill="none" stroke="var(--dw06)" strokeWidth="10" />
            <circle cx="60" cy="60" r="50" fill="none" stroke="rgb(96,165,250)" strokeWidth="10"
              strokeDasharray={`${(retention / 100) * 314} 314`} strokeLinecap="round" transform="rotate(-90 60 60)" />
            <text x="60" y="56" textAnchor="middle" fill="var(--dtext)" fontSize="24" fontWeight="800">{retention}</text>
            <text x="60" y="72" textAnchor="middle" fill="var(--dw35)" fontSize="10">%</text>
          </svg>
          <p style={{ color: "var(--dw5)", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", margin: 0 }}>Rebooking rate</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          {segments.map(s => (
            <div key={s.label} style={{ ...card, padding: "14px 16px" }}>
              <p style={{ color: s.color, fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", margin: "0 0 6px" }}>{s.label}</p>
              <p style={{ color: "var(--dtext)", fontSize: 26, fontWeight: 800, margin: 0, letterSpacing: "-0.03em" }}>{s.count}</p>
            </div>
          ))}
        </div>
      </div>

      <div style={card}>
        <p style={{ color: "var(--dw4)", fontSize: 11, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", margin: "0 0 14px" }}>New vs. returning — last 8 weeks</p>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 100 }}>
          {buckets.map((b, i) => (
            <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "flex-end", height: "100%", gap: 2 }}>
              <div style={{ width: "100%", height: `${(b.newCount / maxBucket) * 100}%`, background: "rgb(139,92,246)", borderRadius: "3px 3px 0 0", minHeight: b.newCount > 0 ? 2 : 0 }} />
              <div style={{ width: "100%", height: `${(b.returningCount / maxBucket) * 100}%`, background: "rgb(52,211,153)", minHeight: b.returningCount > 0 ? 2 : 0 }} />
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 16, marginTop: 12 }}>
          <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "var(--dw4)" }}><span style={{ width: 8, height: 8, borderRadius: 2, background: "rgb(139,92,246)" }} /> New</span>
          <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "var(--dw4)" }}><span style={{ width: 8, height: 8, borderRadius: 2, background: "rgb(52,211,153)" }} /> Returning</span>
        </div>
      </div>
    </div>
  );
}

// ─── AI ───────────────────────────────────────────────────────────────────────
function AIModule({ opportunities }: { opportunities: ReturnType<typeof computeOpportunities> }) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const toggle = (tag: string) => setExpanded(prev => {
    const next = new Set(prev);
    if (next.has(tag)) next.delete(tag); else next.add(tag);
    return next;
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {opportunities.map(o => {
        const isOpen = expanded.has(o.tag);
        return (
          <div key={o.tag} style={{ ...card, padding: 0, opacity: o.available ? 1 : 0.65 }}>
            <button onClick={() => toggle(o.tag)} style={{
              width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "16px 18px",
              background: "none", border: "none", cursor: "pointer", textAlign: "left",
            }}>
              <span style={{ fontSize: 9, fontWeight: 800, color: o.color, background: tint(o.color, 0.09), padding: "3px 8px", borderRadius: 20, whiteSpace: "nowrap", letterSpacing: "0.06em" }}>{o.tag}</span>
              <span style={{ color: "var(--dw7)", fontSize: 13, flex: 1 }}>{o.text}</span>
              {o.impact && <span style={{ color: "rgb(52,211,153)", fontSize: 12, fontWeight: 700 }}>{o.impact}</span>}
              <ChevronDown size={15} color="var(--dw3)" style={{ transform: isOpen ? "rotate(180deg)" : "none", transition: "transform 0.15s" }} />
            </button>
            {isOpen && (
              <div style={{ padding: "0 18px 16px", color: "var(--dw4)", fontSize: 12, lineHeight: 1.6 }}>
                {o.available
                  ? "Computed from your real appointment and client history."
                  : "This insight needs an integration that isn't connected for this shop yet."}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Finance ──────────────────────────────────────────────────────────────────
function Finance() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ ...card, display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontSize: 10, fontWeight: 800, color: "rgb(251,191,36)", background: "rgba(245,158,11,0.12)", padding: "4px 10px", borderRadius: 20 }}>MOCK DATA</span>
        <span style={{ color: "var(--dw5)", fontSize: 12.5 }}>Requires Stripe Connect for real payouts and GST figures — shown for layout reference only.</span>
      </div>
      <div className="ops-kpi-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
        <KPITile label="Next payout" value="C$4,180" sub="Processing in 2 days" />
        <KPITile label="GST owing" value="C$424" sub="Due Jun 30" positive={false} />
        <KPITile label="Net this month" value="C$11,820" sub="+7.4% vs last" />
      </div>
      <div style={card}>
        <p style={{ color: "var(--dw4)", fontSize: 11, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", margin: "0 0 14px" }}>Exports</p>
        <div style={{ display: "flex", gap: 10 }}>
          {["GST34 Report", "Accountant Summary", "Itemised Transactions"].map(label => (
            <button key={label} disabled style={{
              padding: "9px 16px", borderRadius: 10, border: "1px solid var(--dw1)",
              background: "var(--dw04)", color: "var(--dw4)",
              fontSize: 12, fontWeight: 600, cursor: "not-allowed",
            }}>
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Shared placeholder ────────────────────────────────────────────────────────
function Placeholder({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div style={{ textAlign: "center", padding: "80px 20px" }}>
      <div style={{ width: 64, height: 64, borderRadius: 20, background: "var(--dw05)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 18px" }}>{icon}</div>
      <h3 style={{ color: "var(--dtext)", fontSize: 18, fontWeight: 800, margin: "0 0 8px" }}>{title}</h3>
      <p style={{ color: "var(--dw35)", fontSize: 14, maxWidth: 380, margin: "0 auto" }}>{desc}</p>
    </div>
  );
}
