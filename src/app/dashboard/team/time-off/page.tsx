import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getShopContext } from "@/lib/dashboard/shop";
import { createAdminClient } from "@/lib/supabase/admin";
import { shopWallTimeToUTC } from "@/lib/dashboard/shopTime";

export const dynamic = "force-dynamic";

async function add(formData: FormData) {
  "use server";
  const ctx = await getShopContext();
  if (!ctx) return;
  const staffRaw = String(formData.get("staff_id") ?? "");
  // Staff can only block their own time; the owner can block anyone or the whole shop.
  const staffId = ctx.role === "owner" ? (staffRaw === "shop" ? null : staffRaw) : ctx.staffId;
  const from = String(formData.get("from") ?? ""), to = String(formData.get("to") ?? "");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(from) || !/^\d{4}-\d{2}-\d{2}$/.test(to) || to < from) return;
  const fromT = String(formData.get("from_time") || "00:00"), toT = String(formData.get("to_time") || "23:59");
  await createAdminClient().from("time_off").insert({
    shop_id: ctx.shopId, staff_id: staffId,
    starts_at: shopWallTimeToUTC(from, fromT).toISOString(), ends_at: shopWallTimeToUTC(to, toT).toISOString(),
    reason: String(formData.get("reason") ?? "").slice(0, 120) || null,
  });
  revalidatePath("/dashboard/team/time-off");
}

async function remove(formData: FormData) {
  "use server";
  const ctx = await getShopContext();
  if (!ctx) return;
  let q = createAdminClient().from("time_off").delete().eq("id", String(formData.get("id"))).eq("shop_id", ctx.shopId);
  if (ctx.role !== "owner") q = q.eq("staff_id", ctx.staffId ?? "");
  await q;
  revalidatePath("/dashboard/team/time-off");
}

const field: React.CSSProperties = { background: "var(--dsurface1)", border: "1px solid var(--dsurface3)", borderRadius: 10, padding: "9px 11px", color: "var(--dtext)", fontSize: 14, fontFamily: "inherit" };
const fmt = (iso: string) => new Date(iso).toLocaleString("en-CA", { timeZone: "America/Edmonton", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });

/** FL-087: time off and blocked time. Booking never offers these times. */
export default async function TimeOffPage() {
  const ctx = await getShopContext();
  if (!ctx) redirect("/dashboard");
  const admin = createAdminClient();
  const [{ data: staff }, { data: rows }] = await Promise.all([
    admin.from("staff").select("id, full_name").eq("shop_id", ctx.shopId).eq("active", true).order("full_name"),
    admin.from("time_off").select("id, staff_id, starts_at, ends_at, reason").eq("shop_id", ctx.shopId).gte("ends_at", new Date().toISOString()).order("starts_at"),
  ]);
  const name = (id: string | null) => id ? (staff ?? []).find((s) => s.id === id)?.full_name ?? "Staff" : "Whole shop";
  const visible = (rows ?? []).filter((r) => ctx.role === "owner" || r.staff_id === ctx.staffId || r.staff_id === null);
  return (
    <div style={{ padding: "24px 16px", display: "flex", flexDirection: "column", gap: 14 }}>
      <div>
        <h1 style={{ color: "var(--dtext)", fontSize: 22, fontWeight: 800, margin: 0 }}>Time off</h1>
        <p style={{ color: "var(--dw45)", fontSize: 13.5, margin: "4px 0 0" }}>Holidays, appointments, closures. Clients can&apos;t book these times.</p>
      </div>
      <form action={add} style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
        {ctx.role === "owner" ? (
          <select name="staff_id" style={field} defaultValue="shop">
            <option value="shop">Whole shop</option>
            {(staff ?? []).map((s) => <option key={s.id as string} value={s.id as string}>{s.full_name as string}</option>)}
          </select>
        ) : <input type="hidden" name="staff_id" value={ctx.staffId ?? ""} />}
        <input type="date" name="from" required style={field} aria-label="From date" />
        <input type="time" name="from_time" style={field} aria-label="From time" />
        <span style={{ color: "var(--dw45)" }}>to</span>
        <input type="date" name="to" required style={field} aria-label="To date" />
        <input type="time" name="to_time" style={field} aria-label="To time" />
        <input name="reason" placeholder="Reason (optional)" style={{ ...field, flex: "1 1 160px" }} />
        <button type="submit" style={{ background: "rgb(109,40,217)", color: "#fff", border: "none", borderRadius: 10, padding: "9px 16px", fontWeight: 700, cursor: "pointer" }}>Add</button>
      </form>
      {visible.length === 0 && <p style={{ color: "var(--dw45)", margin: 0 }}>No upcoming time off.</p>}
      {visible.map((r) => (
        <form key={r.id as string} action={remove} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, background: "var(--dsurface1)", border: "1px solid var(--dsurface3)", borderRadius: 10, padding: "10px 12px" }}>
          <input type="hidden" name="id" value={r.id as string} />
          <span style={{ color: "var(--dtext)", fontSize: 13.5 }}><strong>{name(r.staff_id as string | null)}</strong> · {fmt(r.starts_at as string)} to {fmt(r.ends_at as string)}{r.reason ? ` · ${r.reason}` : ""}</span>
          <button type="submit" style={{ ...field, cursor: "pointer", color: "rgb(220,38,38)", padding: "6px 10px" }}>Remove</button>
        </form>
      ))}
    </div>
  );
}
