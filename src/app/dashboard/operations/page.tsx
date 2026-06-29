"use client";

import { useState } from "react";
import { TrendingUp, TrendingDown, DollarSign, Users, Zap, BarChart2 } from "lucide-react";

const MODULES = ["Overview", "Revenue", "Team", "Clients", "AI", "Finance"] as const;
type Module = typeof MODULES[number];

// ─── Shared ────────────────────────────────────────────────────────────────────
const card: React.CSSProperties = {
  background: "rgba(255,255,255,0.025)",
  border: "1px solid rgba(255,255,255,0.07)",
  borderRadius: 16,
  padding: 20,
};

function KPITile({ label, value, sub, positive }: { label: string; value: string; sub: string; positive?: boolean }) {
  return (
    <div style={{ ...card, padding: "16px 18px" }}>
      <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 10, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", margin: "0 0 6px" }}>{label}</p>
      <p style={{ color: "rgb(250,250,250)", fontSize: 22, fontWeight: 800, margin: "0 0 4px", letterSpacing: "-0.03em" }}>{value}</p>
      <p style={{ color: positive === false ? "rgb(248,113,113)" : "rgb(52,211,153)", fontSize: 11, margin: 0, display: "flex", alignItems: "center", gap: 3 }}>
        {positive === false ? <TrendingDown size={11} /> : <TrendingUp size={11} />} {sub}
      </p>
    </div>
  );
}

// ─── Overview ─────────────────────────────────────────────────────────────────
function Overview() {
  const subMetrics = [
    { label: "Booking fill rate", value: 78 },
    { label: "Client retention",  value: 84 },
    { label: "Revenue growth",    value: 62 },
    { label: "AI contribution",   value: 91 },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: 20 }}>

        {/* Score ring */}
        <div style={{ ...card, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12 }}>
          <svg width={120} height={120} viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
            <circle cx="60" cy="60" r="50" fill="none" stroke="rgb(139,92,246)" strokeWidth="10"
              strokeDasharray={`${(86 / 100) * 314} 314`} strokeLinecap="round"
              transform="rotate(-90 60 60)" />
            <text x="60" y="56" textAnchor="middle" fill="rgb(250,250,250)" fontSize="24" fontWeight="800">86</text>
            <text x="60" y="72" textAnchor="middle" fill="rgba(255,255,255,0.35)" fontSize="10">/100</text>
          </svg>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", margin: 0 }}>
            Operations Score
          </p>
        </div>

        {/* Sub-metric bars */}
        <div style={{ ...card, display: "flex", flexDirection: "column", gap: 14 }}>
          {subMetrics.map(m => (
            <div key={m.label}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 12 }}>{m.label}</span>
                <span style={{ color: "rgb(250,250,250)", fontSize: 12, fontWeight: 700 }}>{m.value}%</span>
              </div>
              <div style={{ height: 5, background: "rgba(255,255,255,0.06)", borderRadius: 3 }}>
                <div style={{ height: "100%", width: `${m.value}%`, borderRadius: 3, background: m.value > 80 ? "rgb(52,211,153)" : m.value > 60 ? "rgb(251,191,36)" : "rgb(248,113,113)", transition: "width 0.5s ease" }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
        <KPITile label="This month" value="C$12,458" sub="+8.2% vs last month" />
        <KPITile label="AutoPilot recovered" value="C$8,240" sub="+23% vs last month" />
        <KPITile label="Open slots" value="4 / 18" sub="Fill 4 to earn +C$280" positive={false} />
        <KPITile label="No-show rate" value="3.2%" sub="-1.1% vs last month" />
      </div>

      {/* Top AI opportunities */}
      <div style={card}>
        <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", margin: "0 0 14px" }}>Top AI opportunities</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[
            { tag: "WIN-BACK", color: "rgb(167,139,250)", text: "7 clients overdue for rebook — trigger 30-day flow", impact: "+C$840" },
            { tag: "PRICING",  color: "rgb(251,191,36)",  text: "Balayage is underpriced vs. Edmonton market by 12%",  impact: "+C$180/mo" },
            { tag: "SLOTS",    color: "rgb(52,211,153)",  text: "Thu 2–5 PM consistently empty — add flash deal",       impact: "+C$320/mo" },
          ].map(o => (
            <div key={o.tag} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", background: "rgba(255,255,255,0.02)", borderRadius: 10 }}>
              <span style={{ fontSize: 9, fontWeight: 800, color: o.color, background: `${o.color}18`, padding: "3px 8px", borderRadius: 20, whiteSpace: "nowrap", letterSpacing: "0.06em" }}>{o.tag}</span>
              <span style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, flex: 1 }}>{o.text}</span>
              <span style={{ color: "rgb(52,211,153)", fontSize: 12, fontWeight: 700, whiteSpace: "nowrap" }}>{o.impact}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Revenue ──────────────────────────────────────────────────────────────────
function Revenue() {
  const DAYS = ["Jun 1","","","","5","","","","","10","","","","","15","","","","","20","","","","","25","","","","","Jun 30"];
  const DATA = [480,520,390,610,740,680,590,820,760,890,710,640,920,850,780,640,880,960,820,750,680,920,840,790,920,850,780,960,880,820];
  const W = 100; const H = 70;
  const max = Math.max(...DATA) * 1.1;
  const pts = DATA.map((v, i) => `${(i / (DATA.length - 1)) * W},${H - (v / max) * H}`).join(" ");
  const area = `0,${H} ` + pts + ` ${W},${H}`;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
        <KPITile label="This month" value="C$12,458" sub="+8.2% vs last" />
        <KPITile label="AutoPilot" value="C$8,240" sub="66% of total" />
        <KPITile label="Avg/day" value="C$415" sub="+12% vs last" />
        <KPITile label="Missed revenue" value="C$280" sub="4 open slots" positive={false} />
      </div>

      {/* Daily chart */}
      <div style={card}>
        <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", margin: "0 0 16px" }}>Daily revenue — June</p>
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
          {DAYS.filter((_, i) => i % 5 === 0).map(d => (
            <span key={d} style={{ color: "rgba(255,255,255,0.2)", fontSize: 10 }}>{d}</span>
          ))}
        </div>
      </div>

      {/* Service performance */}
      <div style={card}>
        <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", margin: "0 0 14px" }}>Service performance</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[
            { name: "Balayage",     revenue: "C$3,360", pct: 91, bookings: 12 },
            { name: "Knotless Braids", revenue: "C$2,160", pct: 78, bookings: 12 },
            { name: "Full Colour",  revenue: "C$1,980", pct: 65, bookings: 9  },
            { name: "Silk Press",   revenue: "C$1,190", pct: 54, bookings: 14 },
            { name: "Trim + Blowout", revenue: "C$910", pct: 42, bookings: 14 },
          ].map(s => (
            <div key={s.name} style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, width: 150, flexShrink: 0 }}>{s.name}</span>
              <div style={{ flex: 1, height: 6, background: "rgba(255,255,255,0.06)", borderRadius: 3 }}>
                <div style={{ height: "100%", width: `${s.pct}%`, borderRadius: 3, background: "rgb(139,92,246)" }} />
              </div>
              <span style={{ color: "rgb(52,211,153)", fontSize: 12, fontWeight: 700, width: 72, textAlign: "right", flexShrink: 0 }}>{s.revenue}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Finance ──────────────────────────────────────────────────────────────────
function Finance() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
        <KPITile label="Next payout" value="C$4,180" sub="Processing in 2 days" />
        <KPITile label="GST owing" value="C$424" sub="Due Jun 30" positive={false} />
        <KPITile label="Net this month" value="C$11,820" sub="+7.4% vs last" />
      </div>

      <div style={card}>
        <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", margin: "0 0 14px" }}>Payout history</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {[
            { date: "Jun 14, 2026", amount: "C$3,840", status: "Paid", statusColor: "rgb(52,211,153)" },
            { date: "Jun 7, 2026",  amount: "C$4,210", status: "Paid", statusColor: "rgb(52,211,153)" },
            { date: "May 31, 2026", amount: "C$3,590", status: "Paid", statusColor: "rgb(52,211,153)" },
            { date: "May 24, 2026", amount: "C$3,120", status: "Paid", statusColor: "rgb(52,211,153)" },
          ].map((p, i, arr) => (
            <div key={p.date} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "13px 0", borderBottom: i < arr.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none" }}>
              <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 13 }}>{p.date}</span>
              <span style={{ color: "rgb(250,250,250)", fontSize: 13, fontWeight: 700 }}>{p.amount}</span>
              <span style={{ color: p.statusColor, fontSize: 11, fontWeight: 700 }}>{p.status}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={card}>
        <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", margin: "0 0 14px" }}>Exports</p>
        <div style={{ display: "flex", gap: 10 }}>
          {["GST34 Report", "Accountant Summary", "Itemised Transactions"].map(label => (
            <button key={label} style={{
              padding: "9px 16px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.1)",
              background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.6)",
              fontSize: 12, fontWeight: 600, cursor: "pointer",
            }}>
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Placeholder modules ───────────────────────────────────────────────────────
function Placeholder({ module }: { module: string }) {
  const map: Record<string, { icon: React.ReactNode; desc: string }> = {
    Team:    { icon: <Users size={28} color="rgb(167,139,250)" />, desc: "Per-staff efficiency, utilization, and booking-conversion funnel." },
    Clients: { icon: <Users size={28} color="rgb(96,165,250)"  />, desc: "Rebooking-rate ring, segment cards, and repeat-visit trends." },
    AI:      { icon: <Zap   size={28} color="rgb(251,191,36)"  />, desc: "Five expandable insight cards with revenue-impact pills and one-tap actions." },
  };
  const m = map[module];
  return (
    <div style={{ textAlign: "center", padding: "80px 20px" }}>
      <div style={{ width: 64, height: 64, borderRadius: 20, background: "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 18px" }}>{m.icon}</div>
      <h3 style={{ color: "rgb(250,250,250)", fontSize: 18, fontWeight: 800, margin: "0 0 8px" }}>{module}</h3>
      <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 14, maxWidth: 380, margin: "0 auto" }}>{m.desc}</p>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function OperationsPage() {
  const [mod, setMod] = useState<Module>("Overview");

  return (
    <div style={{ maxWidth: 1280, margin: "0 auto", display: "flex", flexDirection: "column", gap: 22 }}>

      {/* Header */}
      <div>
        <h1 style={{ color: "rgb(250,250,250)", fontSize: 22, fontWeight: 800, margin: "0 0 3px", letterSpacing: "-0.03em" }}>Operations</h1>
        <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 13, margin: 0 }}>Run smarter. Waste less. Profit more.</p>
      </div>

      {/* Module nav */}
      <div style={{ display: "flex", gap: 2, borderBottom: "1px solid rgba(255,255,255,0.07)", paddingBottom: 0, overflowX: "auto" }}>
        {MODULES.map(m => (
          <button key={m} onClick={() => setMod(m)} style={{
            padding: "10px 18px", border: "none", background: "transparent", cursor: "pointer",
            fontSize: 13, fontWeight: mod === m ? 700 : 500,
            color: mod === m ? "rgb(210,196,254)" : "rgba(255,255,255,0.4)",
            borderBottom: mod === m ? "2px solid rgb(139,92,246)" : "2px solid transparent",
            transition: "color 0.15s, border-color 0.15s",
            whiteSpace: "nowrap",
          }}>
            {m}
          </button>
        ))}
      </div>

      {/* Content */}
      {mod === "Overview" && <Overview />}
      {mod === "Revenue"  && <Revenue />}
      {mod === "Finance"  && <Finance />}
      {(mod === "Team" || mod === "Clients" || mod === "AI") && <Placeholder module={mod} />}
    </div>
  );
}
