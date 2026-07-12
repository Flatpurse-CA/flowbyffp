"use server";

import { revalidatePath } from "next/cache";
import { requireShop, getShopContext } from "@/lib/dashboard/shop";

export type ServiceRow = {
  id: string;
  name: string;
  price: number;
  duration_minutes: number;
  category: string | null;
  active: boolean;
};

async function requireOwner() {
  const ctx = await getShopContext();
  if (!ctx || ctx.role !== "owner") throw new Error("Only the shop owner can manage services");
  return requireShop();
}

export async function listServices(): Promise<ServiceRow[]> {
  const ctx = await getShopContext();
  if (!ctx) return [];
  const { supabase, shopId } = await requireShop();
  const { data } = await supabase
    .from("services")
    .select("id, name, price, duration_minutes, category, active")
    .eq("shop_id", shopId)
    .order("category", { ascending: true })
    .order("name", { ascending: true });
  return (data ?? []) as ServiceRow[];
}

export async function createService(input: { name: string; price: number; durationMinutes: number; category: string }) {
  const { supabase, shopId } = await requireOwner();
  const { error } = await supabase.from("services").insert({
    shop_id: shopId,
    name: input.name,
    price: input.price,
    duration_minutes: input.durationMinutes,
    category: input.category || null,
  });
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/services");
}

export async function toggleServiceActive(id: string, active: boolean) {
  const { supabase, shopId } = await requireOwner();
  const { error } = await supabase
    .from("services")
    .update({ active, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("shop_id", shopId);
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/services");
}

export async function deleteService(id: string) {
  const { supabase, shopId } = await requireOwner();
  const { error } = await supabase.from("services").delete().eq("id", id).eq("shop_id", shopId);
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/services");
}
