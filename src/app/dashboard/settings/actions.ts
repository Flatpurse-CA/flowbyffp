"use server";

import { revalidatePath } from "next/cache";
import { requireShop } from "@/lib/dashboard/shop";

export async function updateFamilyHours(input: { enabled: boolean; start: string; end: string }) {
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
