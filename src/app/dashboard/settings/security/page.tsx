import { redirect } from "next/navigation";
import { getShopContext } from "@/lib/dashboard/shop";
import { createAdminClient } from "@/lib/supabase/admin";
import { TwoStep } from "./TwoStep";
import { saveTeamSecurity } from "./teamActions";

export const dynamic = "force-dynamic";

const card: React.CSSProperties = { background: "var(--dsurface1)", border: "1px solid var(--dsurface3)", borderRadius: 12, padding: 16, margin: "0 16px 24px" };
const row: React.CSSProperties = { display: "flex", alignItems: "center", gap: 10, color: "var(--dtext)", fontSize: 13.5, padding: "6px 0" };

export default async function SecurityPage({ searchParams }: { searchParams: Promise<{ required?: string }> }) {
  const ctx = await getShopContext();
  if (!ctx) redirect("/dashboard");
  const { required } = await searchParams;
  const admin = createAdminClient();
  const [{ data: shop }, { data: staff }] = ctx.role === "owner"
    ? await Promise.all([
        admin.from("shops").select("require_team_2fa").eq("id", ctx.shopId).maybeSingle(),
        admin.from("staff").select("id, full_name, can_refund").eq("shop_id", ctx.shopId).eq("active", true).order("full_name"),
      ])
    : [{ data: null }, { data: null }];

  return (
    <>
      {required && (
        <div style={{ ...card, marginTop: 24, background: "rgb(109,40,217)", border: "none", color: "white" }}>
          Your shop requires 2-step verification for the team. Set it up below (or confirm your code) to keep using Flow.
        </div>
      )}
      <TwoStep />
      {ctx.role === "owner" && (
        <form action={saveTeamSecurity} style={card}>
          <p style={{ color: "var(--dtext)", fontWeight: 700, fontSize: 15, margin: "0 0 4px" }}>Team security</p>
          <p style={{ color: "var(--dw45)", fontSize: 12.5, margin: "0 0 10px" }}>Changes are recorded in your Activity log.</p>
          <label style={row}>
            <input type="checkbox" name="require_team_2fa" defaultChecked={Boolean(shop?.require_team_2fa)} />
            Require 2-step verification for every team member
          </label>
          <p style={{ color: "var(--dtext)", fontWeight: 600, fontSize: 13.5, margin: "14px 0 4px" }}>Who can issue refunds</p>
          <p style={{ color: "var(--dw45)", fontSize: 12.5, margin: "0 0 6px" }}>Only you, unless you tick someone here. Every refund records who issued it and why.</p>
          {(staff ?? []).length === 0 && <p style={{ color: "var(--dw45)", fontSize: 13 }}>No team members yet.</p>}
          {(staff ?? []).map((s) => (
            <label key={s.id as string} style={row}>
              <input type="hidden" name="staff_id" value={s.id as string} />
              <input type="checkbox" name="can_refund" value={s.id as string} defaultChecked={Boolean(s.can_refund)} />
              {s.full_name as string}
            </label>
          ))}
          <button type="submit" style={{ marginTop: 12, height: 38, padding: "0 16px", borderRadius: 10, border: "none", background: "rgb(109,40,217)", color: "white", fontWeight: 700, cursor: "pointer" }}>Save team security</button>
        </form>
      )}
    </>
  );
}
