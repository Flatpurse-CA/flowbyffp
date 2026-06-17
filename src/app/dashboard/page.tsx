import { createClient } from "@/lib/supabase/server";
import {
  CalendarDays, DollarSign, Users, Zap,
  TrendingUp, TrendingDown, ArrowUpRight, MoreHorizontal,
  Clock, RefreshCw, Smartphone, MessageCircle, Gift,
} from "lucide-react";

// ─── Tiny SVG sparkline ───────────────────────────────────────────────────────

function Sparkline({ data, color }: { data: number[]; color: string }) {
  const W = 80; const H = 32;
  const min = Math.min(...data); const max = Math.max(...data);
  const range = max - min || 1;
  const pts = data
    .map((v, i) => `${(i / (data.length - 1)) * W},${H - ((v - min) / range) * H}`)
    .join(" ");
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} fill="none" style={{ flexShrink: 0 }}>
      <polyline points={pts} stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ─── Stat card ────────────────────────────────────────────────────────────────

function StatCard({
  label, value, sub, change, positive, sparkData, sparkColor, Icon, iconBg, iconColor,
}: {
  label: string; value: string; sub: string; change: string;
  positive: boolean; sparkData: number[]; sparkColor: string;
  Icon: React.ComponentType<{ size?: number; strokeWidth?: number; color?: string }>;
  iconBg: string; iconColor: string;
}) {
  const Trend = positive ? TrendingUp : TrendingDown;
  return (
    <div style={{
      background: "rgba(255,255,255,0.025)",
      border: "1px solid rgba(255,255,255,0.07)",
      borderRadius: 16,
      padding: "20px 22px",
    }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, fontWeight: 500, margin: 0, letterSpacing: "0.02em" }}>{label}</p>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{
              fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 20,
              background: positive ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.12)",
              color: positive ? "rgb(34,197,94)" : "rgb(248,113,113)",
              display: "flex", alignItems: "center", gap: 3,
            }}>
              <Trend size={9} strokeWidth={2.5} />
              {change}
            </span>
          </div>
        </div>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: iconBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Icon size={16} strokeWidth={1.8} color={iconColor} />
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
        <div>
          <p style={{ color: "rgb(250,250,250)", fontSize: 30, fontWeight: 800, margin: "0 0 4px", letterSpacing: "-0.04em", lineHeight: 1 }}>{value}</p>
          <p style={{ color: "rgba(255,255,255,0.28)", fontSize: 11, margin: 0 }}>{sub}</p>
        </div>
        <Sparkline data={sparkData} color={sparkColor} />
      </div>
    </div>
  );
}

// ─── Section header ───────────────────────────────────────────────────────────

function SectionHeader({ title, action }: { title: string; action?: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
      <p style={{ color: "rgb(250,250,250)", fontSize: 14, fontWeight: 700, margin: 0 }}>{title}</p>
      {action && (
        <button style={{ background: "none", border: "none", color: "rgba(139,92,246,0.8)", fontSize: 12, fontWeight: 600, cursor: "pointer", padding: 0, display: "flex", alignItems: "center", gap: 3 }}>
          {action} <ArrowUpRight size={12} />
        </button>
      )}
    </div>
  );
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const STATS = [
  {
    label: "Today's Bookings",
    value: "8",
    sub: "vs yesterday (6 bookings)",
    change: "+33%",
    positive: true,
    sparkData: [3, 5, 4, 7, 6, 8, 8],
    sparkColor: "rgb(139,92,246)",
    Icon: CalendarDays,
    iconBg: "rgba(109,40,217,0.18)",
    iconColor: "rgb(167,139,250)",
  },
  {
    label: "Monthly Revenue",
    value: "C$2,340",
    sub: "Jun 01 – Jun 17, 2026",
    change: "+12.5%",
    positive: true,
    sparkData: [1200, 1450, 1800, 1600, 2100, 1950, 2340],
    sparkColor: "rgb(52,211,153)",
    Icon: DollarSign,
    iconBg: "rgba(16,185,129,0.15)",
    iconColor: "rgb(52,211,153)",
  },
  {
    label: "New Clients",
    value: "14",
    sub: "this week",
    change: "+8.2%",
    positive: true,
    sparkData: [5, 8, 6, 11, 9, 12, 14],
    sparkColor: "rgb(96,165,250)",
    Icon: Users,
    iconBg: "rgba(59,130,246,0.15)",
    iconColor: "rgb(96,165,250)",
  },
  {
    label: "AutoPilot Saves",
    value: "3",
    sub: "no-shows recovered today",
    change: "+21%",
    positive: true,
    sparkData: [0, 1, 2, 1, 3, 2, 3],
    sparkColor: "rgb(251,191,36)",
    Icon: Zap,
    iconBg: "rgba(245,158,11,0.15)",
    iconColor: "rgb(251,191,36)",
  },
];

const APPOINTMENTS = [
  { name: "Amara Obi",    service: "Full highlights + trim",  time: "9:00 AM",  stylist: "Fatima",  status: "confirmed" },
  { name: "Lola Adeyemi", service: "Knotless braids",         time: "11:30 AM", stylist: "Grace",   status: "confirmed" },
  { name: "Temi Bello",   service: "Silk press",              time: "1:00 PM",  stylist: "Fatima",  status: "pending"   },
  { name: "Zara Johnson", service: "Colour + gloss",          time: "3:00 PM",  stylist: "Grace",   status: "confirmed" },
  { name: "Chisom Eze",   service: "Trim + blowout",          time: "5:00 PM",  stylist: "Fatima",  status: "confirmed" },
];

const AUTOPILOT_FLOWS = [
  { Icon: RefreshCw,     label: "No-show recovery",        value: "1 rebooked",       active: true  },
  { Icon: Smartphone,    label: "30-day reactivation",     value: "3 msgs sent",      active: true  },
  { Icon: Zap,           label: "Last-minute slot filler", value: "0 gaps remaining", active: true  },
  { Icon: MessageCircle, label: "AI Front Desk",           value: "Off",              active: false },
  { Icon: Gift,          label: "Birthday campaign",       value: "2 sent this week", active: true  },
];

const TOP_SERVICES = [
  { name: "Full Highlights",   bookings: 24, revenue: "$720",  change: "+18%",  up: true  },
  { name: "Knotless Braids",   bookings: 18, revenue: "$1,080", change: "+32%", up: true  },
  { name: "Silk Press",        bookings: 14, revenue: "$490",  change: "+7%",   up: true  },
  { name: "Colour + Gloss",    bookings: 9,  revenue: "$675",  change: "-4%",   up: false },
];

// Booking heatmap data: [hour][day] = 0–4 intensity
const HEATMAP_HOURS = ["9 AM", "10 AM", "11 AM", "12 PM", "1 PM", "2 PM", "3 PM", "4 PM"];
const HEATMAP_DAYS  = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const HEATMAP_DATA  = [
  [1, 1, 2, 2, 1, 0, 0],
  [2, 3, 3, 4, 3, 1, 0],
  [2, 4, 4, 4, 3, 2, 0],
  [3, 4, 4, 3, 4, 3, 1],
  [3, 3, 4, 4, 4, 4, 2],
  [2, 2, 3, 3, 3, 4, 3],
  [1, 2, 2, 2, 2, 3, 2],
  [1, 1, 1, 1, 1, 2, 1],
];

const heatColor = (v: number) => {
  if (v === 0) return "rgba(255,255,255,0.04)";
  if (v === 1) return "rgba(109,40,217,0.15)";
  if (v === 2) return "rgba(109,40,217,0.32)";
  if (v === 3) return "rgba(109,40,217,0.55)";
  return "rgba(109,40,217,0.85)";
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  const email = data.user?.email ?? "";
  const name  = email.split("@")[0];
  const displayName = name.charAt(0).toUpperCase() + name.slice(1);

  const now     = new Date();
  const hour    = now.getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const dateStr  = now.toLocaleDateString("en-CA", { weekday: "short", month: "short", day: "numeric", year: "numeric" });

  const card: React.CSSProperties = {
    background: "rgba(255,255,255,0.025)",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: 16,
    overflow: "hidden",
  };

  return (
    <div style={{ maxWidth: 1280, margin: "0 auto", display: "flex", flexDirection: "column", gap: 24 }}>

      {/* Page heading */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 12, margin: "0 0 4px" }}>{dateStr}</p>
          <h1 style={{ color: "rgb(250,250,250)", fontSize: 22, fontWeight: 800, margin: 0, letterSpacing: "-0.03em" }}>
            {greeting}, {displayName} 👋
          </h1>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 14px", background: "rgba(109,40,217,0.12)", border: "1px solid rgba(139,92,246,0.25)", borderRadius: 10 }}>
          <div style={{ width: 6, height: 6, borderRadius: 3, background: "rgb(52,211,153)", boxShadow: "0 0 6px rgb(52,211,153)" }} />
          <span style={{ color: "rgba(255,255,255,0.7)", fontSize: 12, fontWeight: 600 }}>AutoPilot active</span>
        </div>
      </div>

      {/* Stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
        {STATS.map((s) => <StatCard key={s.label} {...s} />)}
      </div>

      {/* Row 2: Appointments + AutoPilot */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 14, alignItems: "start" }}>

        {/* Appointments table */}
        <div style={card}>
          <div style={{ padding: "16px 20px 12px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
            <SectionHeader title="Today's Appointments" action="View all" />
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {["Client", "Service", "Time", "Stylist", "Status"].map((h) => (
                  <th key={h} style={{ padding: "10px 20px", textAlign: "left", color: "rgba(255,255,255,0.28)", fontSize: 11, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", background: "rgba(255,255,255,0.015)", borderBottom: "1px solid rgba(255,255,255,0.05)", whiteSpace: "nowrap" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {APPOINTMENTS.map((a, i) => (
                <tr key={i} style={{ borderBottom: i < APPOINTMENTS.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
                  <td style={{ padding: "13px 20px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: "50%",
                        background: `hsl(${(i * 53 + 240) % 360}, 40%, 26%)`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.85)", flexShrink: 0,
                      }}>
                        {a.name.split(" ").map((n) => n[0]).join("")}
                      </div>
                      <span style={{ color: "rgb(250,250,250)", fontSize: 13, fontWeight: 600 }}>{a.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: "13px 20px", color: "rgba(255,255,255,0.5)", fontSize: 12.5, whiteSpace: "nowrap", maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis" }}>{a.service}</td>
                  <td style={{ padding: "13px 20px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 5, color: "rgba(255,255,255,0.5)", fontSize: 12.5, whiteSpace: "nowrap" }}>
                      <Clock size={11} strokeWidth={1.8} />
                      {a.time}
                    </div>
                  </td>
                  <td style={{ padding: "13px 20px", color: "rgba(255,255,255,0.5)", fontSize: 12.5 }}>{a.stylist}</td>
                  <td style={{ padding: "13px 20px" }}>
                    <span style={{
                      fontSize: 10, fontWeight: 700, padding: "3px 9px", borderRadius: 20,
                      letterSpacing: "0.04em", textTransform: "uppercase",
                      color: a.status === "confirmed" ? "rgb(52,211,153)" : "rgb(251,191,36)",
                      background: a.status === "confirmed" ? "rgba(16,185,129,0.1)" : "rgba(245,158,11,0.1)",
                    }}>
                      {a.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* AutoPilot */}
        <div style={{ ...card, padding: "16px 18px" }}>
          <SectionHeader title="AutoPilot" />
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {AUTOPILOT_FLOWS.map(({ Icon, label, value, active }) => (
              <div key={label} style={{
                display: "flex", alignItems: "center", gap: 11, padding: "11px 13px", borderRadius: 11,
                background: active ? "rgba(109,40,217,0.08)" : "rgba(255,255,255,0.02)",
                border: active ? "1px solid rgba(139,92,246,0.18)" : "1px solid rgba(255,255,255,0.05)",
              }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                  background: active ? "rgba(109,40,217,0.2)" : "rgba(255,255,255,0.05)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Icon size={14} strokeWidth={1.8} color={active ? "rgb(167,139,250)" : "rgba(255,255,255,0.25)"} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ color: active ? "rgb(250,250,250)" : "rgba(255,255,255,0.3)", fontSize: 12, fontWeight: 600, margin: "0 0 1px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{label}</p>
                  <p style={{ color: active ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.2)", fontSize: 11, margin: 0 }}>{value}</p>
                </div>
                <div style={{ width: 7, height: 7, borderRadius: "50%", background: active ? "rgb(52,211,153)" : "rgba(255,255,255,0.12)", boxShadow: active ? "0 0 6px rgb(52,211,153)" : "none", flexShrink: 0 }} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 3: Heatmap + Top Services */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 14, alignItems: "start" }}>

        {/* Bookings heatmap */}
        <div style={{ ...card, padding: "16px 20px 20px" }}>
          <div style={{ marginBottom: 16 }}>
            <SectionHeader title="Bookings by time" />
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              {[["Light", "rgba(109,40,217,0.15)"], ["Busy", "rgba(109,40,217,0.55)"], ["Peak", "rgba(109,40,217,0.85)"]].map(([l, c]) => (
                <div key={l} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <div style={{ width: 8, height: 8, borderRadius: 2, background: c }} />
                  <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 10 }}>{l}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            {/* Hour labels */}
            <div style={{ display: "flex", flexDirection: "column", gap: 5, paddingTop: 22 }}>
              {HEATMAP_HOURS.map((h) => (
                <div key={h} style={{ height: 24, display: "flex", alignItems: "center", color: "rgba(255,255,255,0.25)", fontSize: 10, whiteSpace: "nowrap", width: 36 }}>{h}</div>
              ))}
            </div>

            {/* Grid */}
            <div style={{ flex: 1 }}>
              {/* Day labels */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 5, marginBottom: 5 }}>
                {HEATMAP_DAYS.map((d) => (
                  <div key={d} style={{ textAlign: "center", color: "rgba(255,255,255,0.3)", fontSize: 10, fontWeight: 600 }}>{d}</div>
                ))}
              </div>
              {HEATMAP_DATA.map((row, ri) => (
                <div key={ri} style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 5, marginBottom: 5 }}>
                  {row.map((val, ci) => (
                    <div key={ci} style={{ height: 24, borderRadius: 5, background: heatColor(val), transition: "background 0.2s" }} />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top services */}
        <div style={{ ...card, padding: "16px 18px" }}>
          <SectionHeader title="Top services" action="View all" />
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {["Service", "Bookings", "Revenue", ""].map((h, i) => (
                  <th key={i} style={{ padding: "6px 8px", textAlign: i === 0 ? "left" : "right", color: "rgba(255,255,255,0.25)", fontSize: 10, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", paddingBottom: 10, borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {TOP_SERVICES.map((s, i) => (
                <tr key={i} style={{ borderBottom: i < TOP_SERVICES.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
                  <td style={{ padding: "11px 8px", color: "rgb(250,250,250)", fontSize: 12.5, fontWeight: 600 }}>{s.name}</td>
                  <td style={{ padding: "11px 8px", textAlign: "right", color: "rgba(255,255,255,0.5)", fontSize: 12.5 }}>{s.bookings}</td>
                  <td style={{ padding: "11px 8px", textAlign: "right", color: "rgba(255,255,255,0.5)", fontSize: 12.5 }}>{s.revenue}</td>
                  <td style={{ padding: "11px 8px", textAlign: "right" }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: s.up ? "rgb(52,211,153)" : "rgb(248,113,113)", display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 2 }}>
                      {s.up ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                      {s.change}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
