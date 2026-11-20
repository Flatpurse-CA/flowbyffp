"use server";

import { logShopAction } from "@/lib/audit";
import { revalidatePath } from "next/cache";
import { getShopContext } from "@/lib/dashboard/shop";
import { createAdminClient } from "@/lib/supabase/admin";
import type { FeeMode, Policy } from "@/lib/booking/policy";

const MODES: FeeMode[] = ["none", "fixed", "percent"];
const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, Number.isFinite(n) ? n : lo));

export async function savePolicy(p: Policy): Promise<{ error?: string }> {
  const ctx = await getShopContext();
  if (!ctx || ctx.role !== "owner") return { error: "Only the owner can change the booking policy" };
  for (const m of [p.deposit_mode, p.late_cancel_fee_mode, p.no_show_fee_mode]) if (!MODES.includes(m)) return { error: "Invalid option" };
  const val = (mode: FeeMode, v: number) => mode === "percent" ? clamp(v, 0, 100) : clamp(v, 0, 10000);
  const { error } = await createAdminClient().from("shops").update({
    deposit_mode: p.deposit_mode, deposit_value: val(p.deposit_mode, p.deposit_value),
    cancel_window_hours: Math.round(clamp(p.cancel_window_hours, 0, 168)),
    late_cancel_fee_mode: p.late_cancel_fee_mode, late_cancel_fee_value: val(p.late_cancel_fee_mode, p.late_cancel_fee_value),
    no_show_fee_mode: p.no_show_fee_mode, no_show_fee_value: val(p.no_show_fee_mode, p.no_show_fee_value),
  }).eq("id", ctx.shopId);
  if (!error) await logShopAction("policy_saved", { window_h: p.cancel_window_hours });
  revalidatePath("/dashboard/settings/policy");
  return error ? { error: error.message } : {};
}
