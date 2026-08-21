import { createAdminClient } from "@/lib/supabase/admin";
import { Zap, Store, DollarSign, CheckCircle2 } from "lucide-react";
import { formatCAD } from "@/lib/plans";

const FLOW_LABELS: Record<string, string> = {
  noshow: "No-show recovery",
  filler: "Cancellation filler",
  winback: "Win-back",
  frontdesk: "AI Front Desk",
  reminders: "Rebooking reminder",
  birthday: "Birthday offer",
};

type EventRow = {
  id: string;
  shop_id: string;
  flow_key: string;
  event_text: string;
  amount: number | null;
  outcome: string;
  channel: string;
  created_at: string;
  shops: { name: string } | { name: string }[] | null;
};

function shopNameFrom(row: EventRow): string {
  const s = row.shops;
  if (!s) return "-";
  return Array.isArray(s) ? (s[0]?.name ?? "-") : s.name;
}

const card: React.CSSProperties = {
  background: "var(--am1)",
  border: "1px solid var(--aw09)",
  borderRadius: 18,
  overflow: "hidden",
};

export default async function AdminAutoPilotActivityPage() {
  const admin = createAdminClient();
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

  const [eventsRes, monthEventsRes] = await Promise.all([
    admin.from("autopilot_events").select("id, shop_id, flow_key, event_text, amount, outcome, channel, created_at, shops(name)")
      .order("created_at", { ascending: false }).limit(30),
    admin.from("autopilot_events").select("shop_id, flow_key, amount, outcome").gte("created_at", monthStart.toISOString()),
  ]);

  const recentEvents = (eventsRes.data ?? []) as unknown as EventRow[];
  const monthEvents = (monthEventsRes.data ?? []) as { shop_id: string; flow_key: string; amount: number | null; outcome: string }[];

  const totalThisMonth = monthEvents.length;
  const revenueThisMonth = monthEvents.reduce((s, e) => s + Number(e.amount ?? 0), 0);
  const activeShops = new Set(monthEvents.map(e => e.shop_id)).size;
  const successCount = monthEvents.filter(e => e.outcome === "sent" || e.outcome === "booked").length;
  const successRate = totalThisMonth > 0 ? Math.round((successCount / totalThisMonth) * 100) : 0;

  const byFlow = Object.entries(
    monthEvents.reduce((acc, e) => {
      if (!acc[e.flow_key]) acc[e.flow_key] = { count: 0, revenue: 0 };
      acc[e.flow_key].count++;
      acc[e.flow_key].revenue += Number(e.amount ?? 0);
      return acc;
    }, {} as Record<string, { count: number; revenue: number }>)
  ).sort((a, b) => b[1].count - a[1].count);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <h1 style={{ color: "var(--atext2)", fontSize: 22, fontWeight: 800, margin: "0 0 4px", letterSpacing: "-0.03em" }}>AutoPilot Activity</h1>
        <p style={{ color: "var(--aw3)", fontSize: 13, margin: 0 }}>Real automation events across every shop on the platform, this month.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        {[
          { label: "Events this month", value: String(totalThisMonth), Icon: Zap, iconColor: "rgb(167,139,250)", iconBg: "rgba(109,40,217,0.15)", subtitle: "Across all flows" },
          { label: "Revenue recovered", value: formatCAD(revenueThisMonth), Icon: DollarSign, iconColor: "rgb(52,211,153)", iconBg: "rgba(16,185,129,0.12)", subtitle: "Attributed to AutoPilot" },
          { label: "Shops using AutoPilot", value: String(activeShops), Icon: Store, iconColor: "rgb(96,165,250)", iconBg: "rgba(59,130,246,0.12)", subtitle: "Active this month" },
          { label: "Success rate", value: `${successRate}%`, Icon: CheckCircle2, iconColor: "rgb(251,191,36)", iconBg: "rgba(245,158,11,0.12)", subtitle: `${successCount} of ${totalThisMonth} sent/booked` },
        ].map(s => (
          <div key={s.label} style={{ ...card, padding: "22px 24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
              <span style={{ color: "var(--aw45)", fontSize: 13, fontWeight: 500 }}>{s.label}</span>
              <div style={{ width: 38, height: 38, borderRadius: 11, background: s.iconBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <s.Icon size={18} color={s.iconColor} strokeWidth={1.8} />
              </div>
            </div>
            <div style={{ color: "var(--atext2)", fontSize: 32, fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 1, marginBottom: 10 }}>{s.value}</div>
            <div style={{ color: "var(--aw25)", fontSize: 12.5 }}>{s.subtitle}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.4fr] gap-3.5">
        <div style={{ ...card, padding: "20px 24px" }}>
          <p style={{ color: "var(--atext)", fontSize: 14, fontWeight: 700, margin: "0 0 14px" }}>By flow, this month</p>
          {byFlow.length === 0 ? (
            <p style={{ color: "var(--aw25)", fontSize: 13, margin: 0 }}>No AutoPilot activity yet this month.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {byFlow.map(([flow, stats]) => (
                <div key={flow} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <p style={{ color: "var(--aw7)", fontSize: 13, fontWeight: 600, margin: "0 0 1px" }}>{FLOW_LABELS[flow] ?? flow}</p>
                    <p style={{ color: "var(--aw3)", fontSize: 11.5, margin: 0 }}>{stats.count} event{stats.count !== 1 ? "s" : ""}</p>
                  </div>
                  <span style={{ color: "rgb(52,211,153)", fontSize: 13, fontWeight: 700 }}>{formatCAD(stats.revenue)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={card}>
          <div style={{ padding: "18px 24px 4px" }}>
            <p style={{ color: "var(--atext)", fontSize: 14, fontWeight: 700, margin: 0 }}>Recent events</p>
          </div>
          {recentEvents.length === 0 ? (
            <p style={{ color: "var(--aw25)", fontSize: 13, padding: "8px 24px 20px" }}>No events yet.</p>
          ) : (
            <div style={{ maxHeight: 420, overflowY: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 8 }}>
                <tbody>
                  {recentEvents.map((e, i) => (
                    <tr key={e.id} style={{ borderBottom: i < recentEvents.length - 1 ? "1px solid var(--aw04)" : "none" }}>
                      <td style={{ padding: "10px 24px", color: "var(--aw6)", fontSize: 12.5, whiteSpace: "nowrap" }}>{shopNameFrom(e)}</td>
                      <td style={{ padding: "10px 12px", color: "var(--aw4)", fontSize: 12 }}>{FLOW_LABELS[e.flow_key] ?? e.flow_key}</td>
                      <td style={{ padding: "10px 12px", color: "var(--aw35)", fontSize: 11.5, maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.event_text}</td>
                      <td style={{ padding: "10px 24px", textAlign: "right" }}>
                        <span style={{
                          fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20,
                          color: e.outcome === "failed" ? "rgb(248,113,113)" : "rgb(52,211,153)",
                          background: e.outcome === "failed" ? "rgba(239,68,68,0.1)" : "rgba(16,185,129,0.1)",
                        }}>
                          {e.outcome}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
