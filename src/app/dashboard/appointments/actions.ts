"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireShop, getCurrentShopId } from "@/lib/dashboard/shop";

export type AppointmentStatus = "confirmed" | "pending" | "deposit" | "completed" | "cancelled";

export type AppointmentRow = {
  id: string;
  client_name: string;
  client_phone: string | null;
  client_email: string | null;
  client_notes: string | null;
  service_name: string;
  stylist_name: string | null;
  staff_id: string | null;
  starts_at: string;
  duration_minutes: number;
  price: number;
  deposit_amount: number | null;
  status: AppointmentStatus;
  tip_amount: number | null;
  payment_method: string | null;
  paid_amount: number | null;
};

export async function hasAnyAppointments(): Promise<boolean> {
  const shopId = await getCurrentShopId();
  if (!shopId) return false;

  const supabase = await createClient();
  const { count } = await supabase
    .from("appointments")
    .select("id", { count: "exact", head: true })
    .eq("shop_id", shopId);

  return (count ?? 0) > 0;
}

export async function listAppointments(rangeStart: string, rangeEnd: string): Promise<AppointmentRow[]> {
  const shopId = await getCurrentShopId();
  if (!shopId) return [];

  const supabase = await createClient();
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

export async function createAppointment(input: {
  clientName: string;
  clientPhone?: string;
  clientEmail?: string;
  serviceName: string;
  stylistName?: string;
  staffId?: string;
  startsAt: string;
  durationMinutes: number;
  price: number;
  requireDeposit?: boolean;
  depositAmount?: number;
  notes?: string;
}) {
  const { supabase, shopId } = await requireShop();

  const { error } = await supabase.from("appointments").insert({
    shop_id: shopId,
    client_name: input.clientName,
    client_phone: input.clientPhone || null,
    client_email: input.clientEmail || null,
    client_notes: input.notes || null,
    service_name: input.serviceName,
    stylist_name: input.stylistName || null,
    staff_id: input.staffId || null,
    starts_at: input.startsAt,
    duration_minutes: input.durationMinutes,
    price: input.price,
    deposit_amount: input.requireDeposit ? (input.depositAmount ?? null) : null,
    status: input.requireDeposit ? "deposit" : "confirmed",
  });

  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/appointments");
}

export async function rescheduleAppointment(id: string, startsAt: string) {
  const { supabase, shopId } = await requireShop();

  const { error } = await supabase
    .from("appointments")
    .update({ starts_at: startsAt, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("shop_id", shopId);

  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/appointments");
}

export async function confirmAppointment(id: string) {
  const { supabase, shopId } = await requireShop();

  const { error } = await supabase
    .from("appointments")
    .update({ status: "confirmed", updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("shop_id", shopId);

  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/appointments");
}

export async function cancelAppointment(id: string) {
  const { supabase, shopId } = await requireShop();

  const { error } = await supabase
    .from("appointments")
    .update({ status: "cancelled", updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("shop_id", shopId);

  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/appointments");
}

export async function completeAppointment(
  id: string,
  input: { tipAmount: number; paymentMethod: string; paidAmount: number },
) {
  const { supabase, shopId } = await requireShop();

  const { error } = await supabase
    .from("appointments")
    .update({
      status: "completed",
      tip_amount: input.tipAmount,
      payment_method: input.paymentMethod,
      paid_amount: input.paidAmount,
      completed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("shop_id", shopId);

  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/appointments");
}
