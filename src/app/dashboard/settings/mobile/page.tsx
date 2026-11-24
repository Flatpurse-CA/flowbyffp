import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getShopContext } from "@/lib/dashboard/shop";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

async function save(formData: FormData) {
  "use server";
  const ctx = await getShopContext();
  if (!ctx || ctx.role !== "owner") return;
  const fsas = String(formData.get("fsas") ?? "").toUpperCase().split(/[\s,]+/).map((s) => s.replace(/[^A-Z0-9]/g, "").slice(0, 3)).filter((s) => /^[A-Z]\d?[A-Z]?$/.test(s)).slice(0, 200);
  await createAdminClient().from("shops").update({
    mobile_enabled: formData.get("mobile_enabled") === "on",
    service_fsas: fsas,
    travel_fee: Math.min(500, Math.max(0, Number(formData.get("travel_fee") ?? 0) || 0)),
    drive_buffer_min: Math.min(180, Math.max(0, Math.round(Number(formData.get("drive_buffer_min") ?? 30) || 0))),
  }).eq("id", ctx.shopId);
  revalidatePath("/dashboard/settings/mobile");
}

const field: React.CSSProperties = { background: "var(--dsurface1)", border: "1px solid var(--dsurface3)", borderRadius: 10, padding: "9px 11px", color: "var(--dtext)", fontSize: 14, fontFamily: "inherit" };
const label: React.CSSProperties = { color: "var(--dw45)", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, display: "flex", flexDirection: "column", gap: 6 };

/** Mobile Mode settings (FL-058): you travel to clients. */
export default async function MobileSettingsPage() {
  const ctx = await getShopContext();
  if (!ctx || ctx.role !== "owner") redirect("/dashboard");
  const { data: s } = await createAdminClient().from("shops").select("mobile_enabled, service_fsas, travel_fee, drive_buffer_min").eq("id", ctx.shopId).maybeSingle();
  return (
    <form action={save} style={{ padding: "24px 16px", display: "flex", flexDirection: "column", gap: 16, maxWidth: 560 }}>
      <div>
        <h1 style={{ color: "var(--dtext)", fontSize: 22, fontWeight: 800, margin: 0 }}>Mobile Mode</h1>
        <p style={{ color: "var(--dw45)", fontSize: 13.5, margin: "4px 0 0" }}>For businesses that travel to clients. Clients enter their address when booking; Flow checks your area, adds the travel fee and leaves drive time between visits.</p>
      </div>
      <label style={{ ...label, flexDirection: "row", alignItems: "center", textTransform: "none", fontSize: 14, color: "var(--dtext)" }}>
        <input type="checkbox" name="mobile_enabled" defaultChecked={Boolean(s?.mobile_enabled)} /> I travel to clients
      </label>
      <label style={label}>Service area (postal code starts, e.g. T2P, T3A, T2)
        <textarea name="fsas" rows={3} defaultValue={((s?.service_fsas as string[]) ?? []).join(", ")} style={field} placeholder="Leave empty to accept any address" />
      </label>
      <label style={label}>Travel fee ($ per visit)
        <input type="number" name="travel_fee" min={0} step="0.01" defaultValue={Number(s?.travel_fee ?? 0)} style={{ ...field, width: 140 }} />
      </label>
      <label style={label}>Drive time between visits (minutes)
        <input type="number" name="drive_buffer_min" min={0} max={180} defaultValue={Number(s?.drive_buffer_min ?? 30)} style={{ ...field, width: 140 }} />
      </label>
      <button type="submit" style={{ background: "rgb(109,40,217)", color: "#fff", border: "none", borderRadius: 10, padding: "12px 0", fontSize: 15, fontWeight: 700, cursor: "pointer", maxWidth: 220 }}>Save</button>
    </form>
  );
}
