"use server";

import { revalidatePath } from "next/cache";
import { getShopContext } from "@/lib/dashboard/shop";
import { createAdminClient } from "@/lib/supabase/admin";

async function owner() {
  const ctx = await getShopContext();
  if (!ctx || ctx.role !== "owner") throw new Error("Only the owner can manage rooms and equipment");
  return { shopId: ctx.shopId, admin: createAdminClient() };
}

export async function addResource(input: { name: string; kind: "room" | "equipment"; capacity: number }) {
  const { shopId, admin } = await owner();
  const name = input.name.trim().slice(0, 60);
  if (!name) return { error: "Name is required" };
  const { error } = await admin.from("resources").insert({ shop_id: shopId, name, kind: input.kind, capacity: Math.min(50, Math.max(1, Math.round(input.capacity))) });
  revalidatePath("/dashboard/services/resources");
  return error ? { error: error.message } : {};
}

export async function deleteResource(id: string) {
  const { shopId, admin } = await owner();
  await admin.from("resources").delete().eq("id", id).eq("shop_id", shopId);
  revalidatePath("/dashboard/services/resources");
}

export async function setServiceNeeds(resourceId: string, serviceIds: string[]) {
  const { shopId, admin } = await owner();
  const { data: r } = await admin.from("resources").select("id").eq("id", resourceId).eq("shop_id", shopId).maybeSingle();
  if (!r) return { error: "Not found" };
  const { data: own } = await admin.from("services").select("id").eq("shop_id", shopId).in("id", serviceIds.length ? serviceIds : ["00000000-0000-0000-0000-000000000000"]);
  await admin.from("service_resources").delete().eq("resource_id", resourceId);
  if (own?.length) await admin.from("service_resources").insert(own.map((s) => ({ service_id: s.id, resource_id: resourceId })));
  revalidatePath("/dashboard/services/resources");
  return {};
}
