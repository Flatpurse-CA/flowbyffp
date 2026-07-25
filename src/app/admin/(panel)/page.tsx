import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { Users, Store, ClipboardList, CreditCard, TrendingUp } from "lucide-react";
import { PLAN_COLORS as PLAN_COLOR, planPrice, planLabel, formatCAD } from "@/lib/plans";

function StatCard({
  label, value, Icon, iconColor, iconBg, subtitle,
}: {
  label: string;
  value: number | string;
  Icon: React.ComponentType<{ size?: number; strokeWidth?: number; color?: string }>;
  iconColor: string;
  iconBg: string;
  subtitle: string;
}) {
  return (
    <div style={{
      background: "rgb(10,10,12)",
      border: "1px solid rgba(255,255,255,0.09)",
      borderRadius: 18,
      padding: "22px 24px",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
        <span style={{ color: "rgba(255,255,255,0.45)", fontSize: 13, fontWeight: 500 }}>{label}</span>
        <div style={{
          width: 38, height: 38, borderRadius: 11,
          background: iconBg,
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
        }}>
          <Icon size={18} color={iconColor} strokeWidth={1.8} />
        </div>
      </div>
      <div style={{ color: "rgb(245,245,252)", fontSize: 36, fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 1, marginBottom: 10 }}>
        {value}
      </div>
      <div style={{ color: "rgba(255,255,255,0.25)", fontSize: 12.5 }}>
        {subtitle}
      </div>
    </div>
  );
}

export default async function AdminOverviewPage() {
  const admin = createAdminClient();

  const [usersRes, shopsRes, waitlistRes] = await Promise.all([
    admin.auth.admin.listUsers({ perPage: 1000 }),
    admin.from("shops").select("owner_id, name, plan, created_at"),
    admin.from("waitlist").select("email, shop_type, created_at"),
  ]);

  const users    = usersRes.data?.users ?? [];
  const shops    = (shopsRes.data   ?? []) as { owner_id: string; name: string; plan: string; created_at: string }[];
  const waitlist = (waitlistRes.data ?? []) as { email: string; shop_type: string | null; created_at: string }[];

  const weekAgo  = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const newUsers = users.filter(u => new Date(u.created_at) > weekAgo).length;
  const newShops = shops.filter(s => new Date(s.created_at) > weekAgo).length;
  const newWait  = waitlist.filter(w => new Date(w.created_at) > weekAgo).length;

  // Monthly user growth (last 7 months)
  const months = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(1);
    d.setMonth(d.getMonth() - 6 + i);
    return { label: d.toLocaleString("en", { month: "short" }), year: d.getFullYear(), month: d.getMonth(), count: 0 };
  });
  users.forEach(u => {
    const d = new Date(u.created_at);
    const m = months.find(x => x.year === d.getFullYear() && x.month === d.getMonth());
    if (m) m.count++;
  });
  const hasData  = months.some(m => m.count > 0);
  const chartMax = Math.max(...months.map(m => m.count), 1);

  const recentUsers = [...users]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 8);

  const recentShops = [...shops]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 6);

  const estimatedMRR = shops.reduce((sum, s) => sum + planPrice(s.plan), 0);
  const payingShops  = shops.filter(s => planPrice(s.plan) > 0).length;

  const card: React.CSSProperties = {
    background: "rgb(10,10,12)",
    border: "1px solid rgba(255,255,255,0.09)",
    borderRadius: 18,
    overflow: "hidden",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <StatCard
          label="Total Members"
          value={users.length}
          Icon={Users}
          iconColor="rgb(167,139,250)"
          iconBg="rgba(109,40,217,0.15)"
          subtitle={newUsers > 0 ? `+${newUsers} this week` : "No new members yet"}
        />
        <StatCard
          label="Active Shops"
          value={shops.length}
          Icon={Store}
          iconColor="rgb(52,211,153)"
          iconBg="rgba(16,185,129,0.12)"
          subtitle={newShops > 0 ? `+${newShops} this week` : "No new shops yet"}
        />
        <StatCard
          label="Waitlist"
          value={waitlist.length}
          Icon={ClipboardList}
          iconColor="rgb(251,191,36)"
          iconBg="rgba(245,158,11,0.12)"
          subtitle={newWait > 0 ? `+${newWait} this week` : "No new signups yet"}
        />
        <StatCard
          label="Estimated MRR"
          value={formatCAD(estimatedMRR)}
          Icon={CreditCard}
          iconColor="rgb(96,165,250)"
          iconBg="rgba(59,130,246,0.12)"
          subtitle={payingShops > 0 ? `From ${payingShops} paying shop${payingShops !== 1 ? "s" : ""} · billing not connected` : "Billing not connected yet"}
        />
      </div>

      {/* ── Growth chart + Recent members ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-3.5">

        {/* Member growth */}
        <div style={{ ...card, padding: "22px 24px" }}>
          <p style={{ color: "rgb(240,240,248)", fontSize: 14, fontWeight: 700, margin: "0 0 3px" }}>Member growth</p>
          <p style={{ color: "rgba(255,255,255,0.28)", fontSize: 12, margin: 0 }}>Members joined over the last 7 months</p>

          <div style={{ display: "flex", gap: 0, marginTop: 20 }}>
            {/* Y axis */}
            <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", paddingRight: 10, paddingBottom: 22, width: 30, flexShrink: 0 }}>
              {[chartMax, Math.round(chartMax * 0.75), Math.round(chartMax * 0.5), Math.round(chartMax * 0.25), 0].map((v, i) => (
                <span key={i} style={{ color: "rgba(255,255,255,0.18)", fontSize: 10, lineHeight: 1 }}>{v}</span>
              ))}
            </div>

            {/* Chart + X axis */}
            <div style={{ flex: 1 }}>
              <div style={{ height: 200, position: "relative", borderLeft: "1px solid rgba(255,255,255,0.06)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                {[25, 50, 75].map(pct => (
                  <div key={pct} style={{ position: "absolute", top: `${pct}%`, left: 0, right: 0, borderTop: "1px solid rgba(255,255,255,0.04)" }} />
                ))}

                {hasData ? (
                  <svg
                    viewBox="0 0 100 100"
                    preserveAspectRatio="none"
                    style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
                  >
                    <defs>
                      <linearGradient id="lg" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="rgba(139,92,246,0.25)" />
                        <stop offset="100%" stopColor="rgba(139,92,246,0)" />
                      </linearGradient>
                    </defs>
                    <path
                      d={[
                        ...months.map((m, i) => `${i === 0 ? "M" : "L"}${(i / 6) * 100},${100 - (m.count / chartMax) * 100}`),
                        "L100,100 L0,100 Z",
                      ].join(" ")}
                      fill="url(#lg)"
                    />
                    <path
                      d={months.map((m, i) => `${i === 0 ? "M" : "L"}${(i / 6) * 100},${100 - (m.count / chartMax) * 100}`).join(" ")}
                      fill="none"
                      stroke="rgb(139,92,246)"
                      strokeWidth={2}
                      vectorEffect="non-scaling-stroke"
                    />
                    {months.map((m, i) => (
                      <circle
                        key={i}
                        cx={(i / 6) * 100}
                        cy={100 - (m.count / chartMax) * 100}
                        r={3}
                        fill="rgb(139,92,246)"
                        vectorEffect="non-scaling-stroke"
                      />
                    ))}
                  </svg>
                ) : (
                  <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8 }}>
                    <div style={{ width: 44, height: 44, borderRadius: "50%", background: "rgba(255,255,255,0.04)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <TrendingUp size={18} color="rgba(255,255,255,0.2)" strokeWidth={1.5} />
                    </div>
                    <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 13, fontWeight: 600, margin: 0 }}>No data yet</p>
                    <p style={{ color: "rgba(255,255,255,0.18)", fontSize: 12, margin: 0 }}>Chart will populate as members join</p>
                  </div>
                )}
              </div>

              {/* X axis labels */}
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
                {months.map((m, i) => (
                  <span key={i} style={{ color: "rgba(255,255,255,0.2)", fontSize: 10 }}>{m.label}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Recent members */}
        <div style={{ ...card, padding: "22px 24px", display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
            <p style={{ color: "rgb(240,240,248)", fontSize: 14, fontWeight: 700, margin: 0 }}>Recent members</p>
            {users.length > 0 && (
              <Link
                href="/admin/users"
                style={{ color: "rgba(255,255,255,0.35)", fontSize: 12, textDecoration: "none" }}
              >
                View all
              </Link>
            )}
          </div>

          {recentUsers.length === 0 ? (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10, minHeight: 220 }}>
              <div style={{ width: 50, height: 50, borderRadius: "50%", background: "rgba(255,255,255,0.04)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Users size={22} color="rgba(255,255,255,0.2)" strokeWidth={1.4} />
              </div>
              <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 13, fontWeight: 600, margin: 0 }}>No members yet</p>
              <p style={{ color: "rgba(255,255,255,0.18)", fontSize: 12, margin: 0, textAlign: "center", lineHeight: 1.5 }}>
                Members will appear here once they join
              </p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
              {recentUsers.map((u, i) => {
                const emailStr = u.email ?? "Unknown";
                const initials = emailStr.slice(0, 2).toUpperCase();
                const date     = new Date(u.created_at).toLocaleDateString("en-CA", { month: "short", day: "numeric" });
                return (
                  <div key={u.id} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
                      background: `hsl(${(i * 55 + 200) % 360}, 35%, 20%)`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.65)",
                    }}>
                      {initials}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 12.5, margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {emailStr}
                      </p>
                      <p style={{ color: "rgba(255,255,255,0.25)", fontSize: 11, margin: 0 }}>{date}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── Shops ── */}
      <div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <p style={{ color: "rgb(240,240,248)", fontSize: 15, fontWeight: 700, margin: 0 }}>Shops</p>
          <Link
            href="/admin/shops"
            style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              padding: "8px 16px", borderRadius: 10,
              background: "rgba(139,92,246,0.1)",
              border: "1px solid rgba(139,92,246,0.2)",
              color: "rgb(167,139,250)", fontSize: 13, fontWeight: 600,
              textDecoration: "none",
            }}
          >
            + View all shops
          </Link>
        </div>

        {recentShops.length === 0 ? (
          <div style={{
            ...card,
            minHeight: 170,
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10,
          }}>
            <div style={{ width: 50, height: 50, borderRadius: "50%", background: "rgba(255,255,255,0.04)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Store size={22} color="rgba(255,255,255,0.2)" strokeWidth={1.4} />
            </div>
            <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 13, fontWeight: 600, margin: 0 }}>No shops yet</p>
            <p style={{ color: "rgba(255,255,255,0.18)", fontSize: 12, margin: 0 }}>Shops will appear here once owners register</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {recentShops.map((shop, i) => {
              const color = PLAN_COLOR[shop.plan] ?? PLAN_COLOR.starter;
              const date  = new Date(shop.created_at).toLocaleDateString("en-CA", { month: "short", day: "numeric", year: "numeric" });
              return (
                <div key={i} style={{
                  background: "rgb(10,10,12)",
                  border: "1px solid rgba(255,255,255,0.09)",
                  borderRadius: 14, padding: "16px 18px",
                }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: 10,
                      background: "rgba(255,255,255,0.05)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <Store size={16} color="rgba(255,255,255,0.4)" strokeWidth={1.6} />
                    </div>
                    <span style={{
                      fontSize: 10.5, fontWeight: 700, padding: "2px 9px", borderRadius: 20,
                      textTransform: "capitalize", color,
                      background: `${color}1A`,
                    }}>
                      {planLabel(shop.plan)}
                    </span>
                  </div>
                  <p style={{ color: "rgb(240,240,248)", fontSize: 13, fontWeight: 700, margin: "0 0 4px" }}>{shop.name}</p>
                  <p style={{ color: "rgba(255,255,255,0.25)", fontSize: 11.5, margin: 0 }}>{date}</p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Waitlist ── */}
      <div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <p style={{ color: "rgb(240,240,248)", fontSize: 15, fontWeight: 700, margin: 0 }}>Waitlist</p>
            {waitlist.length > 0 && (
              <span style={{ fontSize: 10.5, fontWeight: 700, color: "rgb(167,139,250)", background: "rgba(109,40,217,0.1)", padding: "3px 9px", borderRadius: 20 }}>
                {waitlist.length} total
              </span>
            )}
          </div>
          <Link
            href="/admin/waitlist"
            style={{
              padding: "7px 14px", borderRadius: 10,
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "rgba(255,255,255,0.45)", fontSize: 13, fontWeight: 600,
              textDecoration: "none",
            }}
          >
            Manage waitlist
          </Link>
        </div>

        {waitlist.length === 0 ? (
          <div style={{
            ...card,
            minHeight: 120,
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8,
          }}>
            <ClipboardList size={22} color="rgba(255,255,255,0.15)" strokeWidth={1.4} />
            <p style={{ color: "rgba(255,255,255,0.25)", fontSize: 13, margin: 0 }}>No waitlist entries yet</p>
          </div>
        ) : (
          <div style={card} className="overflow-x-auto">
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "rgba(255,255,255,0.02)" }}>
                  {["Email", "Shop Type", "Joined"].map(h => (
                    <th key={h} style={{
                      padding: "10px 20px", textAlign: "left",
                      color: "rgba(255,255,255,0.22)", fontSize: 11,
                      fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase",
                      borderBottom: "1px solid rgba(255,255,255,0.05)",
                    }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {waitlist.slice(0, 6).map((entry, i) => {
                  const date = new Date(entry.created_at).toLocaleDateString("en-CA", { month: "short", day: "numeric", year: "numeric" });
                  return (
                    <tr key={i} style={{ borderBottom: i < Math.min(waitlist.length, 6) - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
                      <td style={{ padding: "11px 20px", color: "rgba(255,255,255,0.6)", fontSize: 13 }}>{entry.email}</td>
                      <td style={{ padding: "11px 20px", color: "rgba(255,255,255,0.38)", fontSize: 13 }}>
                        {entry.shop_type ? (
                          <span style={{
                            fontSize: 11, fontWeight: 600, padding: "2px 9px", borderRadius: 20,
                            background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.5)",
                            border: "1px solid rgba(255,255,255,0.08)",
                          }}>
                            {entry.shop_type}
                          </span>
                        ) : "—"}
                      </td>
                      <td style={{ padding: "11px 20px", color: "rgba(255,255,255,0.28)", fontSize: 12 }}>{date}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
