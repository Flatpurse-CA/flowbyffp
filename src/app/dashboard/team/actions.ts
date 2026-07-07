"use server";

import { revalidatePath } from "next/cache";
import { requireShop, getCurrentShopId } from "@/lib/dashboard/shop";
import type { AppointmentRow } from "../appointments/actions";

export type StaffRow = {
  id: string;
  full_name: string;
  role: string | null;
  color: string;
  active: boolean;
};

export async function listStaff(): Promise<StaffRow[]> {
  const shopId = await getCurrentShopId();
  if (!shopId) return [];

  const { supabase } = await requireShop();
  const { data, error } = await supabase
    .from("staff")
    .select("id, full_name, role, color, active")
    .eq("shop_id", shopId)
    .eq("active", true)
    .order("created_at", { ascending: true });

  if (error) return [];
  return (data ?? []) as StaffRow[];
}

export async function listAppointmentsForMetrics(rangeStart: string, rangeEnd: string): Promise<AppointmentRow[]> {
  const shopId = await getCurrentShopId();
  if (!shopId) return [];

  const { supabase } = await requireShop();
  const { data, error } = await supabase
    .from("appointments")
    .select("*")
    .eq("shop_id", shopId)
    .gte("starts_at", rangeStart)
    .lte("starts_at", rangeEnd)
    .order("starts_at", { ascending: true });

  if (error) return [];
  return (data ?? []) as AppointmentRow[];
}

const PALETTE = [
  "rgb(139,92,246)", "rgb(239,68,68)", "rgb(16,185,129)",
  "rgb(251,191,36)", "rgb(96,165,250)", "rgb(251,146,60)",
];

export async function createStaff(input: { fullName: string; role?: string }) {
  const { supabase, shopId } = await requireShop();

  const { count } = await supabase
    .from("staff")
    .select("id", { count: "exact", head: true })
    .eq("shop_id", shopId);

  const color = PALETTE[(count ?? 0) % PALETTE.length];

  const { error } = await supabase.from("staff").insert({
    shop_id: shopId,
    full_name: input.fullName,
    role: input.role || null,
    color,
  });

  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/team");
  revalidatePath("/dashboard/operations");
}

export async function updateStaff(id: string, input: { fullName?: string; role?: string }) {
  const { supabase, shopId } = await requireShop();

  const { error } = await supabase
    .from("staff")
    .update({
      ...(input.fullName !== undefined ? { full_name: input.fullName } : {}),
      ...(input.role !== undefined ? { role: input.role } : {}),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("shop_id", shopId);

  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/team");
}

export async function archiveStaff(id: string) {
  const { supabase, shopId } = await requireShop();

  const { error } = await supabase
    .from("staff")
    .update({ active: false, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("shop_id", shopId);

  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/team");
  revalidatePath("/dashboard/operations");
}
