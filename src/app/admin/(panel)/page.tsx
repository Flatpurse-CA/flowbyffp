import { createAdminClient } from "@/lib/supabase/admin";
import {
  Users, Store, ClipboardList, CreditCard,
  TrendingUp, TrendingDown, MoreHorizontal, Clock,
} from "lucide-react";

// ─── Vertical bar chart ────────────────────────────────────────────────────────

function BarChart({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data, 1);
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 40, width: 80 }}>
      {data.map((v, i) => (
        <div
          key={i}
          style={{
            flex: 1,
            height: `${Math.max(12, (v / max) * 100)}%`,
            background: color,
            borderRadius: "2px 2px 0 0",
            opacity: i === data.length - 1 ? 1 : 0.25 + (i / (data.length - 1)) * 0.55,
          }}
        />
      ))}
    </div>
  );
}

// ─── Stat card ─────────────────────────────────────────────────────────────────

function StatCard({
  label, value, unit, change, positive, chartData, chartColor, Icon,
}: {
  label: string; value: number | string; unit?: string; change: string;
  positive: boolean; chartData: number[]; chartColor: string;
  Icon: React.ComponentType<{ size?: number; strokeWidth?: number; color?: string }>;
}) {
  const Trend = positive ? TrendingUp : TrendingDown;
  return (
    <div style={{
      background: "rgb(11,13,21)",
      border: "1px solid rgba(255,255,255,0.06)",
      borderRadius: 14,
      padding: "18px 20px",
      display: "flex",
      flexDirection: "column",
      gap: 12,
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <Icon size={14} strokeWidth={1.7} color="rgba(255,255,255,0.35)" />
          <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 12.5, fontWeight: 500 }}>{label}</span>
        </div>
        <button style={{ background: "none", border: "none", color: "rgba(255,255,255,0.2)", cursor: "pointer", padding: 2, display: "flex" }}>
          <MoreHorizontal size={14} />
        </button>
      </div>

      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
        <div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 7 }}>
            <span style={{ color: "rgb(245,245,250)", fontSize: 30, fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 1 }}>{value}</span>
            {unit && <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 13, fontWeight: 600 }}>{unit}</span>}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{
              display: "flex", alignItems: "center", gap: 3,
              fontSize: 10.5, fontWeight: 700,
              color: positive ? "rgb(52,211,153)" : "rgb(248,113,113)",
              background: positive ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)",
              padding: "2px 7px", borderRadius: 20,
            }}>
              <Trend size={9} strokeWidth={2.5} />
              {change}
            </span>
            <span style={{ color: "rgba(255,255,255,0.2)", fontSize: 11 }}>vs last week</span>
          </div>
        </div>
        <BarChart data={chartData} color={chartColor} />
      </div>
    </div>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────────

const PLAN_STYLE: Record<string, { color: string; bg: string }> = {
  founders:  { color: "rgb(251,191,36)",        bg: "rgba(245,158,11,0.1)"  },
  unlimited: { color: "rgb(167,139,250)",       bg: "rgba(109,40,217,0.1)" },
  pro:       { color: "rgb(96,165,250)",        bg: "rgba(59,130,246,0.1)" },
  starter:   { color: "rgba(255,255,255,0.38)", bg: "rgba(255,255,255,0.05)" },
};

const STATUS_STYLE: Record<string, { color: string; bg: string }> = {
  pending:  { color: "rgb(251,191,36)",  bg: "rgba(245,158,11,0.1)"  },
  approved: { color: "rgb(52,211,153)",  bg: "rgba(16,185,129,0.1)"  },
  rejected: { color: "rgb(248,113,113)", bg: "rgba(239,68,68,0.1)"   },
};

// ─── Page ──────────────────────────────────────────────────────────────────────

export default async function AdminOverviewPage() {
  const admin = createAdminClient();

  const [usersRes, shopsRes, waitlistRes] = await Promise.all([
    admin.auth.admin.listUsers({ perPage: 1000 }),
    admin.from("shops").select("owner_id, name, plan, created_at"),
    admin.from("waitlist").select("email, shop_type, status, created_at"),
  ]);

  const users    = usersRes.data?.users ?? [];
  const shops    = (shopsRes.data   ?? []) as { owner_id: string; name: string; plan: string; created_at: string }[];
  const waitlist = (waitlistRes.data ?? []) as { email: string; shop_type: string | null; status: string; created_at: string }[];

  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const newUsers    = users.filter(u => new Date(u.created_at) > weekAgo).length;
  const newShops    = shops.filter(s => new Date(s.created_at) > weekAgo).length;
  const newWaitlist = waitlist.filter(w => new Date(w.created_at) > weekAgo).length;
  const paidShops   = shops.filter(s => s.plan !== "starter").length;

  const userSpark = [2, 5, 4, 8, 6, 11, Math.max(1, newUsers)];
  const waitSpark = [3, 7, 5, 12, 9, 15, Math.max(1, newWaitlist)];
  const shopSpark = [1, 2, 1, 3, 2, 4,  Math.max(1, newShops)];
  const paidSpark = [0, 1, 1, 2, 2, 3,  Math.max(1, paidShops)];

  const planCounts: Record<string, number> = { starter: 0, pro: 0, unlimited: 0, founders: 0 };
  shops.forEach(s => { planCounts[s.plan] = (planCounts[s.plan] ?? 0) + 1; });

  const recentUsers = [...users]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 6);

  const recentWaitlist = [...waitlist]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 8);

  const card: React.CSSProperties = {
    background: "rgb(11,13,21)",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: 14,
    overflow: "hidden",
  };

  return (
    <div style={{ maxWidth: 1200, display: "flex", flexDirection: "column", gap: 20 }}>

      {/* ── Tab row ── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", gap: 2 }}>
          {(["Overview", "Analytics", "Logs"] as const).map((tab, i) => (
            <button key={tab} style={{
              padding: "7px 14px", borderRadius: 8, border: "none",
              background: i === 0 ? "rgba(255,255,255,0.07)" : "transparent",
              cursor: "pointer", fontFamily: "inherit",
              color: i === 0 ? "rgb(240,240,245)" : "rgba(255,255,255,0.32)",
              fontSize: 13, fontWeight: i === 0 ? 600 : 400,
            }}>
              {tab}
            </button>
          ))}
        </div>
        <div style={{
          display: "flex", alignItems: "center", gap: 6,
          padding: "6px 12px", borderRadius: 8,
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.07)",
          color: "rgba(255,255,255,0.4)", fontSize: 12.5, cursor: "pointer",
        }}>
          Last 7 Days
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6" /></svg>
        </div>
      </div>

      {/* ── Stat cards ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
        <StatCard label="Total Users"  value={users.length}  unit="users"  change={`+${newUsers}`}    positive chartData={userSpark} chartColor="rgb(139,92,246)" Icon={Users}       />
        <StatCard label="Waitlist"     value={waitlist.length} unit="joined" change={`+${newWaitlist}`} positive chartData={waitSpark} chartColor="rgb(96,165,250)"  Icon={ClipboardList} />
        <StatCard label="Active Shops" value={shops.length}  unit="shops"  change={`+${newShops}`}    positive chartData={shopSpark} chartColor="rgb(52,211,153)" Icon={Store}       />
        <StatCard
          label="Paid Plans" value={paidShops} unit="active"
          change={`${shops.length ? Math.round((paidShops / shops.length) * 100) : 0}%`}
          positive chartData={paidSpark} chartColor="rgb(251,191,36)" Icon={CreditCard}
        />
      </div>

      {/* ── Row 2 ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 12 }}>

        {/* Plan breakdown */}
        <div style={{ ...card, padding: "18px 20px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
            <p style={{ color: "rgb(240,240,245)", fontSize: 13.5, fontWeight: 700, margin: 0 }}>Plan Distribution</p>
            <button style={{ background: "none", border: "none", color: "rgba(255,255,255,0.2)", cursor: "pointer", display: "flex" }}><MoreHorizontal size={15} /></button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {(["founders", "unlimited", "pro", "starter"] as const).map(plan => {
              const count = planCounts[plan] ?? 0;
              const pct   = shops.length ? Math.round((count / shops.length) * 100) : 0;
              const s     = PLAN_STYLE[plan];
              return (
                <div key={plan}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 7 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 7, height: 7, borderRadius: 2, background: s.color }} />
                      <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 12.5, textTransform: "capitalize" }}>{plan}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <span style={{ color: "rgba(255,255,255,0.25)", fontSize: 11 }}>{pct}%</span>
                      <span style={{ color: "rgba(255,255,255,0.55)", fontSize: 12.5, fontWeight: 600, width: 20, textAlign: "right" }}>{count}</span>
                    </div>
                  </div>
                  <div style={{ height: 4, borderRadius: 2, background: "rgba(255,255,255,0.05)" }}>
                    <div style={{ height: "100%", width: `${pct}%`, borderRadius: 2, background: s.color }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent signups */}
        <div style={{ ...card, padding: "18px 20px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
            <p style={{ color: "rgb(240,240,245)", fontSize: 13.5, fontWeight: 700, margin: 0 }}>Recent Signups</p>
            <span style={{ color: "rgba(255,255,255,0.22)", fontSize: 11 }}>{recentUsers.length} shown</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {recentUsers.length === 0 ? (
              <p style={{ color: "rgba(255,255,255,0.2)", fontSize: 13, margin: 0 }}>No users yet.</p>
            ) : recentUsers.map((u, i) => {
              const email    = u.email ?? "Unknown";
              const initials = email.slice(0, 2).toUpperCase();
              const date     = new Date(u.created_at).toLocaleDateString("en-CA", { month: "short", day: "numeric" });
              return (
                <div key={u.id} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
                    background: `hsl(${(i * 55 + 200) % 360}, 35%, 20%)`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.65)",
                  }}>
                    {initials}
                  </div>
                  <span style={{ flex: 1, color: "rgba(255,255,255,0.55)", fontSize: 12.5, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {email}
                  </span>
                  <div style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
                    <Clock size={10} color="rgba(255,255,255,0.18)" />
                    <span style={{ color: "rgba(255,255,255,0.22)", fontSize: 11 }}>{date}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Waitlist table ── */}
      <div style={card}>
        <div style={{
          padding: "14px 20px", borderBottom: "1px solid rgba(255,255,255,0.05)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <p style={{ color: "rgb(240,240,245)", fontSize: 13.5, fontWeight: 700, margin: 0 }}>Waitlist Entries</p>
          <span style={{
            fontSize: 10.5, fontWeight: 700, color: "rgb(251,191,36)",
            background: "rgba(245,158,11,0.1)", padding: "3px 9px", borderRadius: 20,
          }}>
            {waitlist.filter(w => w.status === "pending").length} pending
          </span>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "rgba(255,255,255,0.015)" }}>
              {["Time", "Email", "Shop Type", "Status", "Action"].map(h => (
                <th key={h} style={{
                  padding: "9px 18px", textAlign: "left",
                  color: "rgba(255,255,255,0.22)", fontSize: 11,
                  fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase",
                  borderBottom: "1px solid rgba(255,255,255,0.04)",
                }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {recentWaitlist.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: "32px 18px", textAlign: "center", color: "rgba(255,255,255,0.2)", fontSize: 13 }}>
                  No waitlist entries yet.
                </td>
              </tr>
            ) : recentWaitlist.map((entry, i) => {
              const date = new Date(entry.created_at).toLocaleTimeString("en-CA", { hour: "2-digit", minute: "2-digit" });
              const s    = STATUS_STYLE[entry.status] ?? STATUS_STYLE.pending;
              return (
                <tr key={i} style={{ borderBottom: i < recentWaitlist.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
                  <td style={{ padding: "11px 18px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 5, color: "rgba(255,255,255,0.28)", fontSize: 12, whiteSpace: "nowrap" }}>
                      <Clock size={11} strokeWidth={1.6} />
                      {date}
                    </div>
                  </td>
                  <td style={{ padding: "11px 18px", color: "rgba(255,255,255,0.6)", fontSize: 12.5, maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {entry.email}
                  </td>
                  <td style={{ padding: "11px 18px", color: "rgba(255,255,255,0.38)", fontSize: 12.5 }}>
                    {entry.shop_type ?? "—"}
                  </td>
                  <td style={{ padding: "11px 18px" }}>
                    <span style={{
                      fontSize: 10.5, fontWeight: 700, padding: "3px 10px", borderRadius: 20,
                      textTransform: "capitalize", color: s.color, background: s.bg,
                    }}>
                      {entry.status}
                    </span>
                  </td>
                  <td style={{ padding: "11px 18px" }}>
                    <button style={{
                      padding: "4px 11px", borderRadius: 7,
                      background: "rgba(109,40,217,0.1)",
                      border: "1px solid rgba(139,92,246,0.2)",
                      color: "rgb(196,181,253)", fontSize: 11, fontWeight: 600,
                      cursor: "pointer", fontFamily: "inherit",
                    }}>
                      Review
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
