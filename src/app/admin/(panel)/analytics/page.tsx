import { createAdminClient } from "@/lib/supabase/admin";
import { TrendingUp, DollarSign, CreditCard, Store } from "lucide-react";
import { PLANS, ADMIN_PLAN_BADGE, planPrice, planLabel, formatCAD } from "@/lib/plans";
import { sumRevenueByShop } from "@/lib/admin/shopRevenue";

function StatCard({ label, value, Icon, iconColor, iconBg, subtitle }: {
  label: string; value: string; Icon: React.ComponentType<{ size?: number; strokeWidth?: number; color?: string }>;
  iconColor: string; iconBg: string; subtitle: string;
}) {
  return (
    <div style={{ background: "var(--am1)", border: "1px solid var(--aw09)", borderRadius: 18, padding: "22px 24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
        <span style={{ color: "var(--aw45)", fontSize: 13, fontWeight: 500 }}>{label}</span>
        <div style={{ width: 38, height: 38, borderRadius: 11, background: iconBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Icon size={18} color={iconColor} strokeWidth={1.8} />
        </div>
      </div>
      <div style={{ color: "var(--atext2)", fontSize: 32, fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 1, marginBottom: 10 }}>{value}</div>
      <div style={{ color: "var(--aw25)", fontSize: 12.5 }}>{subtitle}</div>
    </div>
  );
}

const card: React.CSSProperties = {
  background: "var(--am1)",
  border: "1px solid var(--aw09)",
  borderRadius: 18,
  overflow: "hidden",
};

export default async function AdminAnalyticsPage() {
  const admin = createAdminClient();

  const [shopsRes, apptsRes] = await Promise.all([
    admin.from("shops").select("id, plan, created_at"),
    admin.from("appointments").select("shop_id, price").eq("status", "completed"),
  ]);

  const shops = (shopsRes.data ?? []) as { id: string; plan: string; created_at: string }[];
  const revenueByShop = sumRevenueByShop((apptsRes.data ?? []) as { shop_id: string; price: number }[]);

  const totalMRR = shops.reduce((sum, s) => sum + planPrice(s.plan), 0);
  const payingShops = shops.filter(s => planPrice(s.plan) > 0).length;
  const totalPlatformRevenue = Object.values(revenueByShop).reduce((s, v) => s + v, 0);
  const avgRevenuePerShop = shops.length > 0 ? totalPlatformRevenue / shops.length : 0;

  // New MRR added, bucketed by the signup month of the shops that generate it.
  // Not a literal historical MRR snapshot (plans can change after signup) — an
  // honest proxy for "how much recurring revenue joined the platform each month."
  const months = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(1);
    d.setMonth(d.getMonth() - 6 + i);
    return { label: d.toLocaleString("en", { month: "short" }), year: d.getFullYear(), month: d.getMonth(), newMRR: 0 };
  });
  shops.forEach(s => {
    const d = new Date(s.created_at);
    const m = months.find(x => x.year === d.getFullYear() && x.month === d.getMonth());
    if (m) m.newMRR += planPrice(s.plan);
  });
  const hasData = months.some(m => m.newMRR > 0);
  const chartMax = Math.max(...months.map(m => m.newMRR), 1);

  const planRows = PLANS.filter(p => p.key !== "enterprise" || shops.some(s => s.plan === "enterprise")).map(p => {
    const count = shops.filter(s => s.plan === p.key).length;
    const mrr = count * (p.monthlyPrice ?? 0);
    return { ...p, count, mrr };
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <h1 style={{ color: "var(--atext2)", fontSize: 22, fontWeight: 800, margin: "0 0 4px", letterSpacing: "-0.03em" }}>Analytics</h1>
        <p style={{ color: "var(--aw3)", fontSize: 13, margin: 0 }}>Platform revenue and growth, computed from real shop and booking data.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <StatCard label="MRR" value={formatCAD(totalMRR)} Icon={CreditCard} iconColor="rgb(96,165,250)" iconBg="rgba(59,130,246,0.12)"
          subtitle={payingShops > 0 ? `From ${payingShops} paying shop${payingShops !== 1 ? "s" : ""}` : "No paying shops yet"} />
        <StatCard label="Platform revenue (all-time)" value={formatCAD(totalPlatformRevenue)} Icon={DollarSign} iconColor="rgb(52,211,153)" iconBg="rgba(16,185,129,0.12)"
          subtitle="Completed bookings across all shops" />
        <StatCard label="Shops" value={String(shops.length)} Icon={Store} iconColor="rgb(167,139,250)" iconBg="rgba(109,40,217,0.15)"
          subtitle={`${payingShops} paying · ${shops.length - payingShops} free`} />
        <StatCard label="Avg revenue / shop" value={formatCAD(Math.round(avgRevenuePerShop))} Icon={TrendingUp} iconColor="rgb(251,191,36)" iconBg="rgba(245,158,11,0.12)"
          subtitle="All-time completed bookings" />
      </div>

      <div style={{ ...card, padding: "22px 24px" }}>
        <p style={{ color: "var(--atext)", fontSize: 14, fontWeight: 700, margin: "0 0 3px" }}>New MRR by signup month</p>
        <p style={{ color: "var(--aw3)", fontSize: 12, margin: 0 }}>Recurring revenue added, grouped by when those shops joined</p>

        <div style={{ display: "flex", gap: 0, marginTop: 20 }}>
          <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", paddingRight: 10, paddingBottom: 22, width: 50, flexShrink: 0 }}>
            {[chartMax, Math.round(chartMax * 0.75), Math.round(chartMax * 0.5), Math.round(chartMax * 0.25), 0].map((v, i) => (
              <span key={i} style={{ color: "var(--aw18)", fontSize: 10, lineHeight: 1 }}>{formatCAD(v)}</span>
            ))}
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ height: 180, position: "relative", borderLeft: "1px solid var(--aw06)", borderBottom: "1px solid var(--aw06)", display: "flex", alignItems: "flex-end", gap: 8, padding: "0 4px" }}>
              {[25, 50, 75].map(pct => (
                <div key={pct} style={{ position: "absolute", top: `${pct}%`, left: 0, right: 0, borderTop: "1px solid var(--aw04)" }} />
              ))}
              {hasData ? months.map((m, i) => (
                <div key={i} style={{ flex: 1, height: `${(m.newMRR / chartMax) * 100}%`, minHeight: m.newMRR > 0 ? 4 : 0, background: "rgb(139,92,246)", borderRadius: "4px 4px 0 0", zIndex: 1 }} title={formatCAD(m.newMRR)} />
              )) : (
                <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8 }}>
                  <p style={{ color: "var(--aw3)", fontSize: 13, fontWeight: 600, margin: 0 }}>No paying shops yet</p>
                </div>
              )}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, padding: "0 4px" }}>
              {months.map((m, i) => (
                <span key={i} style={{ color: "var(--aw2)", fontSize: 10 }}>{m.label}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div style={card}>
        <div style={{ padding: "18px 24px 4px" }}>
          <p style={{ color: "var(--atext)", fontSize: 14, fontWeight: 700, margin: 0 }}>Revenue by plan</p>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 8 }}>
          <thead>
            <tr style={{ background: "var(--aw015)" }}>
              {["Plan", "Shops", "% of shops", "MRR", "% of MRR"].map(h => (
                <th key={h} style={{ padding: "10px 24px", textAlign: "left", color: "var(--aw3)", fontSize: 11, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", borderBottom: "1px solid var(--aw06)" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {planRows.map((p, i) => (
              <tr key={p.key} style={{ borderBottom: i < planRows.length - 1 ? "1px solid var(--aw04)" : "none" }}>
                <td style={{ padding: "12px 24px" }}>
                  <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 9px", borderRadius: 20, color: ADMIN_PLAN_BADGE[p.key].fg, background: ADMIN_PLAN_BADGE[p.key].bg }}>
                    {planLabel(p.key)}
                  </span>
                </td>
                <td style={{ padding: "12px 24px", color: "var(--aw6)", fontSize: 13 }}>{p.count}</td>
                <td style={{ padding: "12px 24px", color: "var(--aw4)", fontSize: 13 }}>{shops.length > 0 ? Math.round((p.count / shops.length) * 100) : 0}%</td>
                <td style={{ padding: "12px 24px", color: "var(--atext2)", fontSize: 13, fontWeight: 700 }}>{formatCAD(p.mrr)}</td>
                <td style={{ padding: "12px 24px", color: "var(--aw4)", fontSize: 13 }}>{totalMRR > 0 ? Math.round((p.mrr / totalMRR) * 100) : 0}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
