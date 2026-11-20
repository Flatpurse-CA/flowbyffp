import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getShopContext } from "@/lib/dashboard/shop";
import { createAdminClient } from "@/lib/supabase/admin";
import { INTAKE_TEMPLATES } from "@/lib/intake/templates";
import { intakeConfigured } from "@/lib/intake/crypto";

export const dynamic = "force-dynamic";

async function addTemplate(formData: FormData) {
  "use server";
  const ctx = await getShopContext();
  if (!ctx || ctx.role !== "owner") return;
  const t = INTAKE_TEMPLATES[String(formData.get("template"))];
  if (!t) return;
  await createAdminClient().from("intake_forms").insert({ shop_id: ctx.shopId, name: t.name, fields: t.fields });
  revalidatePath("/dashboard/settings/intake");
}

async function toggle(formData: FormData) {
  "use server";
  const ctx = await getShopContext();
  if (!ctx || ctx.role !== "owner") return;
  await createAdminClient().from("intake_forms").update({ active: formData.get("active") === "true" }).eq("id", String(formData.get("id"))).eq("shop_id", ctx.shopId);
  revalidatePath("/dashboard/settings/intake");
}

const btn: React.CSSProperties = { background: "rgb(109,40,217)", color: "#fff", border: "none", borderRadius: 10, padding: "9px 14px", fontWeight: 700, cursor: "pointer", fontSize: 13 };
const card: React.CSSProperties = { background: "var(--dsurface1)", border: "1px solid var(--dsurface3)", borderRadius: 12, padding: 14 };

/** Owner sets up intake forms (FL-043). The active form is linked from booking confirmations. */
export default async function IntakeSettingsPage() {
  const ctx = await getShopContext();
  if (!ctx || ctx.role !== "owner") redirect("/dashboard");
  const { data: forms } = await createAdminClient().from("intake_forms").select("id, name, fields, active").eq("shop_id", ctx.shopId).order("created_at");
  return (
    <div style={{ padding: "24px 16px", display: "flex", flexDirection: "column", gap: 14 }}>
      <div>
        <h1 style={{ color: "var(--dtext)", fontSize: 22, fontWeight: 800, margin: 0 }}>Intake forms</h1>
        <p style={{ color: "var(--dw45)", fontSize: 13.5, margin: "4px 0 0" }}>Clients fill the active form from their booking link. Answers are encrypted; only you and the assigned staff member can open them, and every view is logged.</p>
        {!intakeConfigured() && <p style={{ color: "rgb(220,38,38)", fontSize: 13, margin: "6px 0 0", fontWeight: 600 }}>Encryption key not set on the server yet. Forms can be set up but clients can&apos;t submit until it is.</p>}
      </div>
      <form action={addTemplate} style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {Object.entries(INTAKE_TEMPLATES).map(([k, t]) => <button key={k} name="template" value={k} type="submit" style={btn}>Add {t.name}</button>)}
      </form>
      {(forms ?? []).map((f) => (
        <section key={f.id as string} style={card}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "center" }}>
            <strong style={{ color: "var(--dtext)" }}>{f.name as string} <span style={{ color: "var(--dw45)", fontWeight: 500, fontSize: 12.5 }}>{(f.fields as unknown[]).length} questions · {f.active ? "Active" : "Off"}</span></strong>
            <form action={toggle}>
              <input type="hidden" name="id" value={f.id as string} />
              <input type="hidden" name="active" value={f.active ? "false" : "true"} />
              <button type="submit" style={{ ...btn, background: f.active ? "var(--dsurface3)" : "rgb(109,40,217)", color: f.active ? "var(--dtext)" : "#fff" }}>{f.active ? "Turn off" : "Turn on"}</button>
            </form>
          </div>
        </section>
      ))}
    </div>
  );
}
