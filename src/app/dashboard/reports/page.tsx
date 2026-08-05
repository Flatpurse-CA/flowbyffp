import { TrendingUp, TrendingDown, Zap, DollarSign, Users, CalendarDays } from "lucide-react";

// ─── SVG Line Chart ───────────────────────────────────────────────────────────

function LineChart({ data, labels, color }: { data: number[]; labels: string[]; color: string }) {
  const W = 100; const H = 60;
  const min = 0; const max = Math.max(...data) * 1.1;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * W},${H - ((v - min) / (max - min)) * H}`).join(" ");
  const area = `0,${H} ` + pts + ` ${W},${H}`;
  // `rgb(52,211,153)` has unescaped parens/commas, which break the `url(#...)`
  // fragment reference below (browser reads it as closing early) and the
  // fill silently falls back to SVG's default black — sanitize into a valid id.
  const gradId = `grad-${color.replace(/[^a-zA-Z0-9]/g, "")}`;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <svg viewBox={`0 0 100 60`} preserveAspectRatio="none" style={{ width: "100%", height: 120 }}>
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.25" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon points={area} fill={`url(#${gradId})`} />
        <polyline points={pts} stroke={color} strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        {data.map((v, i) => (
          <circle key={i} cx={(i / (data.length - 1)) * W} cy={H - ((v - min) / (max - min)) * H} r="1.2" fill={color} />
        ))}
      </svg>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        {labels.map((l) => (
          <span key={l} style={{ color: "var(--dw25)", fontSize: 10 }}>{l}</span>
        ))}
      </div>
    </div>
  );
}

// ─── Bar Chart ────────────────────────────────────────────────────────────────

function BarChart({ data, labels, color }: { data: number[]; labels: string[]; color: string }) {
  const max = Math.max(...data);
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 80 }}>
      {data.map((v, i) => (
        <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
          <div style={{ width: "100%", height: `${(v / max) * 64}px`, borderRadius: "4px 4px 0 0", background: color, opacity: 0.7 + (v / max) * 0.3 }} />
          <span style={{ color: "var(--dw3)", fontSize: 9 }}>{labels[i]}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const MONTHLY_REVENUE  = [980, 1240, 1110, 1580, 1760, 1420, 1950, 2100, 1870, 2200, 2100, 2340];
const MONTHLY_BOOKINGS = [22,  30,   26,   38,   44,   34,   46,   50,   44,   52,   48,   56];
const MONTH_LABELS = ["Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun"];

const TOP_SERVICES_REPORT = [
  { name: "Knotless Braids",  bookings: 18, revenue: 3240, pct: 38 },
  { name: "Full Highlights",  bookings: 24, revenue: 2880, pct: 34 },
  { name: "Balayage",         bookings: 9,  revenue: 2520, pct: 16 },
  { name: "Silk Press",       bookings: 14, revenue: 1190, pct: 8  },
  { name: "Trim + Blowout",   bookings: 20, revenue: 1300, pct: 4  },
];

const AUTOPILOT_STATS = [
  { label: "Messages sent",      value: "147", sub: "this month"     },
  { label: "No-shows recovered", value: "12",  sub: "rebooked"       },
  { label: "Revenue recovered",  value: "$840",sub: "from AutoPilot" },
  { label: "Clients reactivated",value: "8",   sub: "30-day flow"    },
];

export default function ReportsPage() {
  const totalRevenue = MONTHLY_REVENUE.reduce((a, b) => a + b, 0);

  const card: React.CSSProperties = {
    background: "var(--dsurface1)",
    border: "1px solid var(--dw07)",
    borderRadius: 16,
    padding: "20px 22px",
  };

  return (
    <div style={{ maxWidth: 1280, margin: "0 auto", display: "flex", flexDirection: "column", gap: 22 }}>

      {/* Header */}
      <div className="reports-header" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", rowGap: 12 }}>
        <div>
          <h1 style={{ color: "var(--dtext)", fontSize: 22, fontWeight: 800, margin: "0 0 3px", letterSpacing: "-0.03em" }}>Reports</h1>
          <p style={{ color: "var(--dw35)", fontSize: 13, margin: 0 }}>Jul 2025 – Jun 2026</p>
        </div>
        <div className="reports-period-switch" style={{ display: "flex", gap: 2, background: "var(--dsurface2)", border: "1px solid var(--dw07)", borderRadius: 10, padding: 3 }}>
          {["30 days", "6 months", "12 months"].map((p, i) => (
            <button key={p} style={{ padding: "6px 14px", borderRadius: 7, border: "none", cursor: "pointer", fontSize: 12, fontWeight: i === 2 ? 700 : 400, background: i === 2 ? "rgba(109,40,217,0.4)" : "transparent", color: i === 2 ? "var(--dpurple-text)" : "var(--dw38)" }}>
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* KPI row */}
      <div className="reports-kpi-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
        {[
          { label: "Total revenue",      value: `C$${(totalRevenue).toLocaleString()}`, change: "+18%", up: true,  Icon: DollarSign, c: "rgb(52,211,153)",  bg: "rgba(16,185,129,0.15)" },
          { label: "Total bookings",     value: MONTHLY_BOOKINGS.reduce((a,b)=>a+b,0).toString(), change: "+22%", up: true,  Icon: CalendarDays, c: "rgb(139,92,246)", bg: "rgba(109,40,217,0.15)" },
          { label: "New clients",        value: "87",  change: "+14%", up: true,  Icon: Users,       c: "rgb(96,165,250)",  bg: "rgba(59,130,246,0.15)" },
          { label: "Avg booking value",  value: `C$${(totalRevenue / MONTHLY_BOOKINGS.reduce((a,b)=>a+b,0)).toFixed(0)}`, change: "-3%", up: false, Icon: TrendingUp, c: "rgb(251,191,36)", bg: "rgba(245,158,11,0.15)" },
        ].map(({ label, value, change, up, Icon, c, bg }) => (
          <div key={label} style={card}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 }}>
              <p style={{ color: "var(--dw38)", fontSize: 12, margin: 0 }}>{label}</p>
              <div style={{ width: 32, height: 32, borderRadius: 9, background: bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon size={15} strokeWidth={1.8} color={c} />
              </div>
            </div>
            <p style={{ color: "var(--dtext)", fontSize: 28, fontWeight: 800, margin: "0 0 6px", letterSpacing: "-0.04em", lineHeight: 1 }}>{value}</p>
            <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 7px", borderRadius: 20, color: up ? "rgb(52,211,153)" : "rgb(248,113,113)", background: up ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)", display: "inline-flex", alignItems: "center", gap: 3 }}>
              {up ? <TrendingUp size={9} /> : <TrendingDown size={9} />}
              {change}
            </span>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="reports-charts-row" style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 14 }}>

        {/* Revenue chart */}
        <div style={card}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
            <div>
              <p style={{ color: "var(--dtext)", fontSize: 14, fontWeight: 700, margin: "0 0 3px" }}>Revenue performance</p>
              <p style={{ color: "var(--dw3)", fontSize: 12, margin: 0 }}>Monthly revenue Jul 2025 – Jun 2026</p>
            </div>
            <p style={{ color: "rgb(52,211,153)", fontSize: 22, fontWeight: 800, margin: 0, letterSpacing: "-0.03em" }}>C${totalRevenue.toLocaleString()}</p>
          </div>
          <LineChart data={MONTHLY_REVENUE} labels={MONTH_LABELS} color="rgb(52,211,153)" />
        </div>

        {/* Top services */}
        <div style={card}>
          <p style={{ color: "var(--dtext)", fontSize: 14, fontWeight: 700, margin: "0 0 16px" }}>Top services</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {TOP_SERVICES_REPORT.map((s) => (
              <div key={s.name}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 5 }}>
                  <span style={{ color: "var(--dtext)", fontSize: 13, fontWeight: 600 }}>{s.name}</span>
                  <span style={{ color: "var(--dw4)", fontSize: 12 }}>C${s.revenue.toLocaleString()}</span>
                </div>
                <div style={{ height: 5, borderRadius: 3, background: "var(--dsurface3)" }}>
                  <div style={{ height: "100%", width: `${s.pct}%`, borderRadius: 3, background: "rgb(109,40,217)", transition: "width 0.6s" }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bookings + AutoPilot row */}
      <div className="reports-bottom-row" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>

        {/* Bookings bar chart */}
        <div style={card}>
          <p style={{ color: "var(--dtext)", fontSize: 14, fontWeight: 700, margin: "0 0 4px" }}>Monthly bookings</p>
          <p style={{ color: "var(--dw3)", fontSize: 12, margin: "0 0 20px" }}>{MONTHLY_BOOKINGS.reduce((a,b)=>a+b,0)} total this year</p>
          <BarChart data={MONTHLY_BOOKINGS} labels={MONTH_LABELS} color="rgb(109,40,217)" />
        </div>

        {/* AutoPilot ROI */}
        {/* Fixed dark-purple card regardless of theme — text below stays literal
            white, not var(--dtext), since that token would go near-black in
            light mode and disappear against this permanently-dark surface. */}
        <div style={{ ...card, background: "rgb(23,14,58)", border: "1px solid rgba(139,92,246,0.2)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18 }}>
            <Zap size={16} strokeWidth={2} color="rgb(167,139,250)" />
            <p style={{ color: "rgb(250,250,250)", fontSize: 14, fontWeight: 700, margin: 0 }}>AutoPilot impact</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {AUTOPILOT_STATS.map((s) => (
              <div key={s.label} style={{ padding: "14px 16px", background: "rgba(255,255,255,0.05)", borderRadius: 12, border: "1px solid rgba(139,92,246,0.15)" }}>
                <p style={{ color: "rgb(250,250,250)", fontSize: 22, fontWeight: 800, margin: "0 0 3px", letterSpacing: "-0.04em" }}>{s.value}</p>
                <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, margin: 0 }}>{s.label}</p>
                <p style={{ color: "rgba(167,139,250,0.6)", fontSize: 10, margin: "2px 0 0" }}>{s.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
