"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireCustomer } from "@/lib/dashboard/customer";
import type { AppointmentRow } from "@/app/dashboard/appointments/actions";

export async function listMyBookings(): Promise<AppointmentRow[]> {
  const { supabase, customerId } = await requireCustomer();

  const { data } = await supabase
    .from("appointments")
    .select("*")
    .eq("customer_id", customerId)
    .order("starts_at", { ascending: false });

  return (data ?? []) as AppointmentRow[];
}

export async function cancelMyBooking(appointmentId: string) {
  const { customerId } = await requireCustomer();
  const admin = createAdminClient();

  const { data: appt, error: fetchError } = await admin
    .from("appointments")
    .select("id, customer_id, status")
    .eq("id", appointmentId)
    .maybeSingle();

  if (fetchError || !appt) throw new Error("Booking not found");
  if (appt.customer_id !== customerId) throw new Error("This booking doesn't belong to you");
  if (appt.status === "cancelled" || appt.status === "completed") throw new Error("This booking can no longer be cancelled");

  const { error } = await admin
    .from("appointments")
    .update({ status: "cancelled", updated_at: new Date().toISOString() })
    .eq("id", appointmentId);

  if (error) throw new Error(error.message);
  revalidatePath("/customer/account");
}
