import { createAdminClient } from "@/lib/supabase/admin";
import { Zap, Store, Activity } from "lucide-react";

const FEATURE_LABELS: Record<string, string> = {
  flow_coach_viewed: "Flow Coach™",
  autopilot_viewed: "AutoPilot",
  daily_brief_viewed: "Daily Brief",
};

const card: React.CSSProperties = { background: "var(--am1)", border: "1px solid var(--aw09)", borderRadius: 18, overflow: "hidden" };

export default async function AdminFeatureUsagePage() {
  const admin = createAdminClient();
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

  const [monthEventsRes, totalShopsRes] = await Promise.all([
    admin.from("feature_usage_events").select("feature_key, shop_id").gte("occurred_at", monthStart.toISOString()),
    admin.from("shops").select("id"),
  ]);

  const monthEvents = (monthEventsRes.data ?? []) as { feature_key: string; shop_id: string }[];
  const totalShops = (totalShopsRes.data ?? []).length;

  const totalEvents = monthEvents.length;
  const activeShops = new Set(monthEvents.map(e => e.shop_id)).size;

  const byFeature = Object.entries(
    monthEvents.reduce((acc, e) => {
      if (!acc[e.feature_key]) acc[e.feature_key] = new Set<string>();
      acc[e.feature_key].add(e.shop_id);
      return acc;
    }, {} as Record<string, Set<string>>)
  )
    .map(([key, shopSet]) => ({ key, uniqueShops: shopSet.size, events: monthEvents.filter(e => e.feature_key === key).length }))
    .sort((a, b) => b.uniqueShops - a.uniqueShops);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <h1 style={{ color: "var(--atext2)", fontSize: 22, fontWeight: 800, margin: "0 0 4px", letterSpacing: "-0.03em" }}>Feature Usage</h1>
        <p style={{ color: "var(--aw3)", fontSize: 13, margin: 0 }}>Real page-view tracking for premium features, this month. Starts empty and fills in as shops actually use them.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        {[
          { label: "Events this month", value: String(totalEvents), Icon: Activity, iconColor: "rgb(167,139,250)", iconBg: "rgba(109,40,217,0.15)" },
          { label: "Shops using tracked features", value: String(activeShops), Icon: Store, iconColor: "rgb(52,211,153)", iconBg: "rgba(16,185,129,0.12)" },
          { label: "Adoption rate", value: totalShops > 0 ? `${Math.round((activeShops / totalShops) * 100)}%` : "0%", Icon: Zap, iconColor: "rgb(251,191,36)", iconBg: "rgba(245,158,11,0.12)" },
        ].map(s => (
          <div key={s.label} style={{ ...card, padding: "20px 22px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
              <span style={{ color: "var(--aw45)", fontSize: 13, fontWeight: 500 }}>{s.label}</span>
              <div style={{ width: 34, height: 34, borderRadius: 10, background: s.iconBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <s.Icon size={16} color={s.iconColor} strokeWidth={1.8} />
              </div>
            </div>
            <p style={{ color: "var(--atext2)", fontSize: 28, fontWeight: 800, letterSpacing: "-0.03em", margin: 0 }}>{s.value}</p>
          </div>
        ))}
      </div>

      <div style={card}>
        <div style={{ padding: "18px 24px 4px" }}>
          <p style={{ color: "var(--atext)", fontSize: 14, fontWeight: 700, margin: 0 }}>By feature, this month</p>
        </div>
        {byFeature.length === 0 ? (
          <p style={{ color: "var(--aw25)", fontSize: 13, padding: "8px 24px 24px" }}>No tracked feature views yet.</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 8 }}>
            <thead>
              <tr style={{ background: "var(--aw015)" }}>
                {["Feature", "Shops using it", "% of all shops", "Total views"].map(h => (
                  <th key={h} style={{ padding: "10px 24px", textAlign: "left", color: "var(--aw3)", fontSize: 11, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", borderBottom: "1px solid var(--aw06)" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {byFeature.map((f, i) => (
                <tr key={f.key} style={{ borderBottom: i < byFeature.length - 1 ? "1px solid var(--aw04)" : "none" }}>
                  <td style={{ padding: "12px 24px", color: "var(--atext2)", fontSize: 13, fontWeight: 600 }}>{FEATURE_LABELS[f.key] ?? f.key}</td>
                  <td style={{ padding: "12px 24px", color: "var(--aw6)", fontSize: 13 }}>{f.uniqueShops}</td>
                  <td style={{ padding: "12px 24px", color: "var(--aw4)", fontSize: 13 }}>{totalShops > 0 ? Math.round((f.uniqueShops / totalShops) * 100) : 0}%</td>
                  <td style={{ padding: "12px 24px", color: "var(--aw4)", fontSize: 13 }}>{f.events}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
