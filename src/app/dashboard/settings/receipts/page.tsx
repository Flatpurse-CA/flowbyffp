import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getShopContext } from "@/lib/dashboard/shop";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

async function save(formData: FormData) {
  "use server";
  const ctx = await getShopContext();
  if (!ctx || ctx.role !== "owner") return;
  const admin = createAdminClient();
  const id = String(formData.get("id") ?? "");
  await admin.from("staff").update({
    registration_number: String(formData.get("registration_number") ?? "").trim().slice(0, 40) || null,
    registration_body: String(formData.get("registration_body") ?? "").trim().slice(0, 60) || null,
  }).eq("id", id).eq("shop_id", ctx.shopId);
  revalidatePath("/dashboard/settings/receipts");
}

const field: React.CSSProperties = { background: "var(--dsurface1)", border: "1px solid var(--dsurface3)", borderRadius: 10, padding: "9px 11px", color: "var(--dtext)", fontSize: 14, fontFamily: "inherit", flex: "1 1 160px" };

/** FL-044: practitioner registration numbers printed on insurance-ready receipts. */
export default async function ReceiptSettingsPage() {
  const ctx = await getShopContext();
  if (!ctx || ctx.role !== "owner") redirect("/dashboard");
  const admin = createAdminClient();
  const [{ data: staff }, { data: shop }] = await Promise.all([
    admin.from("staff").select("id, full_name, registration_number, registration_body").eq("shop_id", ctx.shopId).eq("active", true).order("full_name"),
    admin.from("shops").select("tax_number").eq("id", ctx.shopId).maybeSingle(),
  ]);
  return (
    <div style={{ padding: "24px 16px", display: "flex", flexDirection: "column", gap: 14 }}>
      <div>
        <h1 style={{ color: "var(--dtext)", fontSize: 22, fontWeight: 800, margin: 0 }}>Receipt details</h1>
        <p style={{ color: "var(--dw45)", fontSize: 13.5, margin: "4px 0 0" }}>
          Receipts show your GST/HST number ({shop?.tax_number ? shop.tax_number : "not set, add it under Settings > Tax"}), tips separately, and each provider&apos;s registration number for insurance claims.
        </p>
      </div>
      {(staff ?? []).map((s) => (
        <form key={s.id as string} action={save} style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center", background: "var(--dsurface1)", border: "1px solid var(--dsurface3)", borderRadius: 12, padding: 12 }}>
          <input type="hidden" name="id" value={s.id as string} />
          <strong style={{ color: "var(--dtext)", flex: "1 1 140px" }}>{s.full_name as string}</strong>
          <input name="registration_body" defaultValue={(s.registration_body as string | null) ?? ""} placeholder="College, e.g. CMTO" style={field} />
          <input name="registration_number" defaultValue={(s.registration_number as string | null) ?? ""} placeholder="Registration #" style={field} />
          <button type="submit" style={{ background: "rgb(109,40,217)", color: "#fff", border: "none", borderRadius: 10, padding: "9px 16px", fontWeight: 700, cursor: "pointer" }}>Save</button>
        </form>
      ))}
    </div>
  );
}
