import Link from "next/link";
import { redirect } from "next/navigation";
import { getShopContext } from "@/lib/dashboard/shop";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

/** Intake responses list: names and dates only; answers open one at a time and are logged. */
export default async function IntakeListPage() {
  const ctx = await getShopContext();
  if (!ctx) redirect("/dashboard");
  const admin = createAdminClient();
  const owner = ctx.role === "owner";
  let q = admin.from("intake_responses").select(`id, client_name, created_at, appointments${owner ? "" : "!inner"}(starts_at, service_name, staff_id)`).eq("shop_id", ctx.shopId).order("created_at", { ascending: false }).limit(100);
  if (!owner) q = q.eq("appointments.staff_id", ctx.staffId ?? "00000000-0000-0000-0000-000000000000");
  const { data } = await q;
  return (
    <div style={{ padding: "24px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
      <h1 style={{ color: "var(--dtext)", fontSize: 22, fontWeight: 800, margin: 0 }}>Intake forms</h1>
      {ctx.role === "owner" && <Link href="/dashboard/settings/intake" style={{ color: "rgb(109,40,217)", fontWeight: 600, fontSize: 13.5 }}>Set up forms</Link>}
      {(data ?? []).length === 0 && <p style={{ color: "var(--dw45)" }}>No forms submitted yet.</p>}
      {(data ?? []).map((r) => {
        const a = r.appointments as unknown as { starts_at: string; service_name: string } | null;
        return (
          <Link key={r.id as string} href={`/dashboard/intake/view?id=${r.id}`} style={{ display: "block", background: "var(--dsurface1)", border: "1px solid var(--dsurface3)", borderRadius: 12, padding: "12px 14px", color: "var(--dtext)", textDecoration: "none" }}>
            <strong>{r.client_name as string}</strong>
            <span style={{ display: "block", color: "var(--dw45)", fontSize: 12.5 }}>{a ? `${a.service_name} · ${new Date(a.starts_at).toLocaleDateString("en-CA", { timeZone: "America/Edmonton", month: "short", day: "numeric" })}` : ""} · submitted {new Date(r.created_at as string).toLocaleDateString("en-CA", { timeZone: "America/Edmonton" })}</span>
          </Link>
        );
      })}
    </div>
  );
}
