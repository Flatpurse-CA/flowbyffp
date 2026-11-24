"use server";

import { revalidatePath } from "next/cache";
import { getShopContext } from "@/lib/dashboard/shop";
import { createAdminClient } from "@/lib/supabase/admin";

const pct = (v: FormDataEntryValue | null) => {
  if (v === null || String(v).trim() === "") return null;
  const n = Number(v); return Number.isFinite(n) ? Math.min(100, Math.max(0, n)) : null;
};
const amt = (v: FormDataEntryValue | null) => {
  if (v === null || String(v).trim() === "") return null;
  const n = Number(v); return Number.isFinite(n) && n >= 0 ? n : null;
};
const TYPES = new Set(["percent", "flat", "none", "renter"]);

/** One form saves the shop default, the fee rule, every staff member's type/rate and every service %. */
export async function saveCommissionSettings(formData: FormData) {
  const ctx = await getShopContext();
  if (!ctx || ctx.role !== "owner") throw new Error("Only the owner can change commissions");
  const admin = createAdminClient();
  await admin.from("shops").update({
    default_commission_pct: pct(formData.get("default_pct")) ?? 0,
    commission_on_fees: formData.get("on_fees") === "on",
  }).eq("id", ctx.shopId);

  for (const id of formData.getAll("staff_id").map(String)) {
    const type = String(formData.get(`type_${id}`) ?? "percent");
    await admin.from("staff").update({
      commission_type: TYPES.has(type) ? type : "percent",
      commission_pct: pct(formData.get(`pct_${id}`)),
      commission_flat: amt(formData.get(`flat_${id}`)),
      rent_amount: amt(formData.get(`rent_${id}`)),
      rent_period: formData.get(`rentp_${id}`) === "month" ? "month" : "week",
    }).eq("id", id).eq("shop_id", ctx.shopId);
  }
  for (const id of formData.getAll("service_id").map(String)) {
    await admin.from("services").update({ commission_pct: pct(formData.get(`svc_${id}`)) }).eq("id", id).eq("shop_id", ctx.shopId);
  }
  revalidatePath("/dashboard/team/commissions");
}
