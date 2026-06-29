"use client";

import { useState } from "react";
import { Plus, TrendingDown, TrendingUp, AlertTriangle, MoreHorizontal } from "lucide-react";

const STAFF = [
  {
    id: 1, initials: "EW", color: "rgb(139,92,246)", name: "Emma Watson", role: "Senior Stylist",
    bookings: 18, revenue: "C$2,840", utilization: 94, alert: null,
    trend: [6,7,8,8,7,9,8,6], avgLine: 7.4,
  },
  {
    id: 2, initials: "JM", color: "rgb(239,68,68)", name: "James Miller", role: "Barber",
    bookings: 14, revenue: "C$1,190", utilization: 78, alert: "Rebook rate dropping",
    trend: [8,8,7,7,6,5,4,3], avgLine: 6.0,
  },
  {
    id: 3, initials: "ZA", color: "rgb(16,185,129)", name: "Zara Ahmed", role: "Colorist",
    bookings: 11, revenue: "C$2,100", utilization: 68, alert: null,
    trend: [5,6,6,7,7,8,8,7], avgLine: 6.8,
  },
];

function TrendChart({ data, avg, declining }: { data: number[]; avg: number; declining: boolean }) {
  const W = 100; const H = 48;
  const max = Math.max(...data) * 1.15; const min = 0;
  const x = (i: number) => (i / (data.length - 1)) * W;
  const y = (v: number) => H - ((v - min) / (max - min)) * H;
  const pts = data.map((v, i) => `${x(i)},${y(v)}`).join(" ");
  const area = `0,${H} ` + pts + ` ${W},${H}`;
  const avgY = y(avg);
  const color = declining ? "rgb(248,113,113)" : "rgb(52,211,153)";

  return (
    <svg viewBox="0 0 100 48" preserveAspectRatio="none" style={{ width: "100%", height: 64 }}>
      <defs>
        <linearGradient id={`g-${color}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.18" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={area} fill={`url(#g-${color})`} />
      <polyline points={pts} stroke={color} strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="0" y1={avgY} x2={W} y2={avgY} stroke="rgba(255,255,255,0.2)" strokeWidth="0.8" strokeDasharray="3,2" />
      <circle cx={x(data.length - 1)} cy={y(data[data.length - 1])} r="2" fill={color} />
    </svg>
  );
}

export default function TeamPage() {
  const [selected, setSelected] = useState<number | null>(null);
  const [period, setPeriod] = useState("This week");

  const selectedStaff = STAFF.find(s => s.id === selected) ?? null;

  const card: React.CSSProperties = {
    background: "rgba(255,255,255,0.025)",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: 16,
    overflow: "hidden",
  };

  if (STAFF.length === 0) {
    return (
      <div style={{ maxWidth: 480, margin: "80px auto", textAlign: "center", padding: "0 20px" }}>
        <div style={{ fontSize: 40, marginBottom: 20 }}>👥</div>
        <h2 style={{ color: "rgb(240,240,248)", fontSize: 22, fontWeight: 800, margin: "0 0 10px", letterSpacing: "-0.03em" }}>
          Add your team when ready
        </h2>
        <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 14, lineHeight: 1.6, margin: "0 0 28px" }}>
          Each staff member gets their own calendar column so clients can book with the person they love.
        </p>
        <button style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          padding: "12px 22px", borderRadius: 12,
          background: "rgb(109,40,217)", border: "none",
          color: "white", fontSize: 14, fontWeight: 700, cursor: "pointer",
        }}>
          <Plus size={16} strokeWidth={2.5} /> Add first team member
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1280, margin: "0 auto", display: "flex", gap: 20 }}>

      {/* Staff list */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 16 }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h1 style={{ color: "rgb(250,250,250)", fontSize: 22, fontWeight: 800, margin: "0 0 3px", letterSpacing: "-0.03em" }}>Team</h1>
            <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 13, margin: 0 }}>{STAFF.length} active staff members</p>
          </div>
          <button style={{
            display: "flex", alignItems: "center", gap: 7,
            padding: "10px 18px", borderRadius: 11,
            background: "rgb(109,40,217)", border: "none",
            color: "white", fontSize: 13, fontWeight: 700, cursor: "pointer",
          }}>
            <Plus size={15} strokeWidth={2.5} /> Add member
          </button>
        </div>

        {/* Staff cards */}
        {STAFF.map(staff => (
          <div
            key={staff.id}
            onClick={() => setSelected(staff.id === selected ? null : staff.id)}
            style={{
              ...card,
              cursor: "pointer",
              border: staff.id === selected
                ? "1px solid rgba(139,92,246,0.5)"
                : staff.alert
                  ? "1px solid rgba(248,113,113,0.25)"
                  : "1px solid rgba(255,255,255,0.07)",
              transition: "border-color 0.15s",
            }}
          >
            <div style={{ padding: "18px 20px", display: "flex", alignItems: "center", gap: 16 }}>
              {/* Avatar */}
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: `${staff.color}22`,
                border: `1.5px solid ${staff.color}44`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 16, fontWeight: 800, color: staff.color, flexShrink: 0,
              }}>
                {staff.initials}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                  <span style={{ color: "rgb(250,250,250)", fontSize: 14, fontWeight: 700 }}>{staff.name}</span>
                  <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 12 }}>{staff.role}</span>
                  {staff.alert && (
                    <span style={{
                      display: "flex", alignItems: "center", gap: 4,
                      fontSize: 10, fontWeight: 700,
                      color: "rgb(248,113,113)", background: "rgba(239,68,68,0.1)",
                      padding: "2px 8px", borderRadius: 20,
                    }}>
                      <AlertTriangle size={9} /> {staff.alert}
                    </span>
                  )}
                </div>
                <div style={{ display: "flex", gap: 18 }}>
                  <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 12 }}>
                    <span style={{ color: "rgb(250,250,250)", fontWeight: 600 }}>{staff.bookings}</span> bookings this week
                  </span>
                  <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 12 }}>
                    <span style={{ color: "rgb(52,211,153)", fontWeight: 600 }}>{staff.revenue}</span> revenue
                  </span>
                  <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 12 }}>
                    <span style={{ color: "rgb(250,250,250)", fontWeight: 600 }}>{staff.utilization}%</span> utilized
                  </span>
                </div>
              </div>

              <button style={{ background: "none", border: "none", color: "rgba(255,255,255,0.3)", cursor: "pointer", padding: 4 }}>
                <MoreHorizontal size={16} />
              </button>
            </div>

            {/* Utilization bar */}
            <div style={{ height: 3, background: "rgba(255,255,255,0.06)", margin: "0 20px 18px" }}>
              <div style={{
                height: "100%", borderRadius: 2,
                width: `${staff.utilization}%`,
                background: staff.utilization > 85 ? "rgb(52,211,153)" : staff.utilization > 65 ? "rgb(251,191,36)" : "rgb(248,113,113)",
                transition: "width 0.4s ease",
              }} />
            </div>
          </div>
        ))}
      </div>

      {/* Staff detail panel */}
      {selectedStaff && (
        <div style={{ width: 320, flexShrink: 0, display: "flex", flexDirection: "column", gap: 14 }}>

          {/* Profile */}
          <div style={{ ...card, padding: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
              <div style={{
                width: 52, height: 52, borderRadius: 14,
                background: `${selectedStaff.color}22`,
                border: `1.5px solid ${selectedStaff.color}55`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 20, fontWeight: 800, color: selectedStaff.color,
              }}>
                {selectedStaff.initials}
              </div>
              <div>
                <p style={{ color: "rgb(250,250,250)", fontSize: 16, fontWeight: 800, margin: "0 0 2px" }}>{selectedStaff.name}</p>
                <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, margin: 0 }}>{selectedStaff.role}</p>
              </div>
            </div>

            {/* Period picker */}
            <div style={{ display: "flex", gap: 4, background: "rgba(255,255,255,0.04)", borderRadius: 10, padding: 3, marginBottom: 16 }}>
              {["This week", "This month", "90 days"].map(p => (
                <button key={p} onClick={() => setPeriod(p)} style={{
                  flex: 1, padding: "5px 0", borderRadius: 7, border: "none", cursor: "pointer",
                  fontSize: 11, fontWeight: period === p ? 700 : 500,
                  background: period === p ? "rgba(139,92,246,0.35)" : "transparent",
                  color: period === p ? "rgb(210,196,254)" : "rgba(255,255,255,0.35)",
                }}>
                  {p}
                </button>
              ))}
            </div>

            {/* Metrics 2×2 */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {[
                { label: "Bookings", value: String(selectedStaff.bookings), sub: "+2 vs last week" },
                { label: "Revenue", value: selectedStaff.revenue, sub: "+8% vs last week" },
                { label: "Utilization", value: `${selectedStaff.utilization}%`, sub: "of available slots" },
                { label: "Avg ticket", value: "C$127", sub: "per appointment" },
              ].map(m => (
                <div key={m.label} style={{
                  background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
                  borderRadius: 12, padding: "12px 14px",
                }}>
                  <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 10, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", margin: "0 0 4px" }}>{m.label}</p>
                  <p style={{ color: "rgb(250,250,250)", fontSize: 18, fontWeight: 800, margin: "0 0 2px", letterSpacing: "-0.03em" }}>{m.value}</p>
                  <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 10, margin: 0 }}>{m.sub}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Rebook trend */}
          <div style={{ ...card, padding: 20 }}>
            {selectedStaff.alert && (
              <div style={{
                display: "flex", alignItems: "center", gap: 8,
                background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)",
                borderRadius: 10, padding: "10px 14px", marginBottom: 14,
              }}>
                <AlertTriangle size={14} color="rgb(248,113,113)" />
                <div>
                  <p style={{ color: "rgb(248,113,113)", fontSize: 12, fontWeight: 700, margin: 0 }}>Needs attention</p>
                  <p style={{ color: "rgba(248,113,113,0.7)", fontSize: 11, margin: 0 }}>{selectedStaff.alert}</p>
                </div>
              </div>
            )}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", margin: 0 }}>
                8-week rebook trend
              </p>
              {selectedStaff.alert
                ? <TrendingDown size={14} color="rgb(248,113,113)" />
                : <TrendingUp size={14} color="rgb(52,211,153)" />
              }
            </div>
            <TrendChart
              data={selectedStaff.trend}
              avg={selectedStaff.avgLine}
              declining={!!selectedStaff.alert}
            />
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
              {["W1","W2","W3","W4","W5","W6","W7","W8"].map(w => (
                <span key={w} style={{ color: "rgba(255,255,255,0.2)", fontSize: 9 }}>{w}</span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
