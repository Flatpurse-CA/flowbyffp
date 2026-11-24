import { redirect } from "next/navigation";
import { getShopContext } from "@/lib/dashboard/shop";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

const LABELS: Record<string, string> = {
  refund: "Refund issued", policy_saved: "Booking policy changed", data_export: "Client data exported",
  no_show_fee: "No-show fee charged", plan_cancel: "Plan cancelled", plan_pause: "Plan paused",
  staff_archived: "Team member removed", resource_deleted: "Room/equipment deleted", account_deletion: "Account deletion scheduled",
  support_view: "FlatPurse support viewed your account (read-only)",
};

/** FL-013: owner-only activity log of sensitive actions. */
export default async function AuditPage() {
  const ctx = await getShopContext();
  if (!ctx || ctx.role !== "owner") redirect("/dashboard");
  const { data } = await createAdminClient().from("shop_audit_log").select("id, actor_role, action, detail, created_at").eq("shop_id", ctx.shopId).order("created_at", { ascending: false }).limit(200);
  return (
    <div style={{ padding: "24px 16px", display: "flex", flexDirection: "column", gap: 8 }}>
      <h1 style={{ color: "var(--dtext)", fontSize: 22, fontWeight: 800, margin: "0 0 6px" }}>Activity log</h1>
      {(data ?? []).length === 0 && <p style={{ color: "var(--dw45)" }}>Nothing logged yet.</p>}
      {(data ?? []).map((r) => (
        <div key={r.id as number} style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap", background: "var(--dsurface1)", border: "1px solid var(--dsurface3)", borderRadius: 10, padding: "10px 12px", fontSize: 13.5, color: "var(--dtext)" }}>
          <span><strong>{LABELS[r.action as string] ?? r.action}</strong> <span style={{ color: "var(--dw45)" }}>by {r.actor_role as string}{Object.keys(r.detail as object).length ? ` · ${Object.entries(r.detail as Record<string, unknown>).map(([k, v]) => `${k}: ${String(v)}`).join(", ")}` : ""}</span></span>
          <span style={{ color: "var(--dw45)" }}>{new Date(r.created_at as string).toLocaleString("en-CA", { timeZone: "America/Edmonton" })}</span>
        </div>
      ))}
    </div>
  );
}
