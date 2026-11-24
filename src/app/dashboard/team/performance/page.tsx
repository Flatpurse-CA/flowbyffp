import { redirect } from "next/navigation";
import { getShopContext } from "@/lib/dashboard/shop";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

const money = (n: number) => `$${n.toFixed(0)}`;
const DAY = 86_400_000;
const nowMs = () => Date.now();

/** FL-089: staff performance, last 30 days. Revenue excludes tips. */
export default async function PerformancePage({ searchParams }: { searchParams: Promise<{ days?: string }> }) {
  const ctx = await getShopContext();
  if (!ctx || ctx.role !== "owner") redirect("/dashboard");
  const days = Math.min(365, Math.max(7, Number((await searchParams).days ?? 30) || 30));
  const since = new Date(nowMs() - days * DAY).toISOString();
  const admin = createAdminClient();
  const [{ data: staff }, { data: appts }] = await Promise.all([
    admin.from("staff").select("id, full_name").eq("shop_id", ctx.shopId).eq("active", true).order("full_name"),
    admin.from("appointments").select("staff_id, status, paid_amount, tip_amount, client_email, client_phone, client_name, starts_at")
      .eq("shop_id", ctx.shopId).gte("starts_at", since).lte("starts_at", new Date().toISOString()).limit(10000),
  ]);
  const { data: future } = await admin.from("appointments").select("staff_id, client_email, client_phone, client_name")
    .eq("shop_id", ctx.shopId).gt("starts_at", new Date().toISOString()).neq("status", "cancelled").limit(10000);
  const key = (a: { client_email: string | null; client_phone: string | null; client_name: string }) => (a.client_email || a.client_phone || a.client_name).toLowerCase();
  const rebooked = new Set((future ?? []).map((a) => `${a.staff_id}:${key(a)}`));

  const rows = (staff ?? []).map((s) => {
    const mine = (appts ?? []).filter((a) => a.staff_id === s.id);
    const done = mine.filter((a) => a.status === "completed" || a.paid_amount != null);
    const clients = new Set(done.map(key));
    const rebook = [...clients].filter((c) => rebooked.has(`${s.id}:${c}`)).length;
    return {
      name: s.full_name as string,
      bookings: done.length,
      revenue: done.reduce((t, a) => t + Number(a.paid_amount ?? 0) - Number(a.tip_amount ?? 0), 0),
      tips: done.reduce((t, a) => t + Number(a.tip_amount ?? 0), 0),
      noShows: mine.filter((a) => a.status === "no_show").length,
      rebookRate: clients.size ? Math.round((rebook / clients.size) * 100) : 0,
    };
  }).sort((a, b) => b.revenue - a.revenue);

  const th: React.CSSProperties = { textAlign: "left", padding: "10px 12px", color: "var(--dw45)", fontSize: 11, textTransform: "uppercase", letterSpacing: 0.5 };
  const td: React.CSSProperties = { padding: "10px 12px", color: "var(--dtext)", fontSize: 13.5, borderTop: "1px solid var(--dsurface3)" };
  return (
    <div style={{ padding: "24px 16px", display: "flex", flexDirection: "column", gap: 12 }}>
      <div>
        <h1 style={{ color: "var(--dtext)", fontSize: 22, fontWeight: 800, margin: 0 }}>Team performance</h1>
        <p style={{ color: "var(--dw45)", fontSize: 13.5, margin: "4px 0 0" }}>Last {days} days. Revenue excludes tips. Rebook rate = clients served who have a future booking with the same person.</p>
      </div>
      <div style={{ overflowX: "auto", background: "var(--dsurface1)", border: "1px solid var(--dsurface3)", borderRadius: 12 }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 560 }}>
          <thead><tr>{["Staff", "Visits", "Revenue", "Tips", "Rebook rate", "No-shows"].map((h) => <th key={h} style={th}>{h}</th>)}</tr></thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.name}>
                <td style={{ ...td, fontWeight: 700 }}>{r.name}</td><td style={td}>{r.bookings}</td><td style={td}>{money(r.revenue)}</td>
                <td style={td}>{money(r.tips)}</td><td style={td}>{r.rebookRate}%</td><td style={td}>{r.noShows}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
