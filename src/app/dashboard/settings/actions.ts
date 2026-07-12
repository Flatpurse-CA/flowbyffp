"use server";

import { revalidatePath } from "next/cache";
import { requireShop, getShopContext } from "@/lib/dashboard/shop";

export type BusinessHourRow = { weekday: number; open: boolean; start: string; end: string };

export async function getBusinessHours(): Promise<BusinessHourRow[]> {
  const ctx = await getShopContext();
  if (!ctx) return [];
  const { supabase, shopId } = await requireShop();

  const { data } = await supabase
    .from("business_hours")
    .select("weekday, open, start_time, end_time")
    .eq("shop_id", shopId)
    .order("weekday", { ascending: true });

  return (data ?? []).map(r => ({
    weekday: r.weekday as number,
    open: Boolean(r.open),
    start: String(r.start_time).slice(0, 5),
    end: String(r.end_time).slice(0, 5),
  }));
}

export async function updateBusinessHours(rows: BusinessHourRow[]) {
  const ctx = await getShopContext();
  if (!ctx || ctx.role !== "owner") throw new Error("Only the shop owner can change business hours");
  const { supabase, shopId } = await requireShop();

  const { error } = await supabase
    .from("business_hours")
    .upsert(
      rows.map(r => ({ shop_id: shopId, weekday: r.weekday, open: r.open, start_time: r.start, end_time: r.end })),
      { onConflict: "shop_id,weekday" },
    );

  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/settings");
}

export async function updateFamilyHours(input: { enabled: boolean; start: string; end: string }) {
  const ctx = await getShopContext();
  if (!ctx || ctx.role !== "owner") throw new Error("Only the shop owner can change Family Hours");
  const { supabase, shopId } = await requireShop();

  const { error } = await supabase
    .from("shops")
    .update({
      family_hours_enabled: input.enabled,
      family_hours_start: input.start,
      family_hours_end: input.end,
    })
    .eq("id", shopId);

  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/settings");
  revalidatePath("/dashboard/daily-brief");
}
