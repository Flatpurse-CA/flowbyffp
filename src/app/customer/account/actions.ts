"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireCustomer } from "@/lib/dashboard/customer";
import { stripe } from "@/lib/stripe";
import { ensureStripeCustomerId } from "@/lib/stripeCustomer";
import type { AppointmentRow } from "@/app/dashboard/appointments/actions";

export async function updateBirthday(dateOfBirth: string): Promise<{ error?: string }> {
  const { customerId } = await requireCustomer();
  const admin = createAdminClient();

  const { error } = await admin
    .from("customers")
    .update({ date_of_birth: dateOfBirth || null })
    .eq("id", customerId);

  if (error) return { error: error.message };
  revalidatePath("/customer/account");
  return {};
}

// Excludes client_notes deliberately — those are staff-internal remarks
// entered from the dashboard (createAppointment/updateAppointmentDetails),
// not something written by or meant for the customer, so this only selects
// columns that are safe to send back to the customer's own browser.
export type MyBooking = Omit<AppointmentRow, "client_notes">;

export async function listMyBookings(): Promise<MyBooking[]> {
  const { supabase, customerId } = await requireCustomer();

  const { data } = await supabase
    .from("appointments")
    .select("id, customer_id, client_name, client_phone, client_email, service_name, stylist_name, staff_id, starts_at, duration_minutes, price, deposit_amount, status, tip_amount, payment_method, paid_amount")
    .eq("customer_id", customerId)
    .order("starts_at", { ascending: false });

  return (data ?? []) as MyBooking[];
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

export type SavedCard = { id: string; brand: string; last4: string; expMonth: number; expYear: number; isDefault: boolean };

export async function listMyPaymentMethods(): Promise<SavedCard[]> {
  const { customerId, email, fullName } = await requireCustomer();
  const admin = createAdminClient();
  const stripeCustomerId = await ensureStripeCustomerId(admin, customerId, email, fullName);

  const [methods, sc] = await Promise.all([
    stripe().paymentMethods.list({ customer: stripeCustomerId, type: "card" }),
    stripe().customers.retrieve(stripeCustomerId),
  ]);
  const defaultPm = !sc.deleted ? sc.invoice_settings?.default_payment_method : undefined;
  const defaultId = typeof defaultPm === "string" ? defaultPm : defaultPm?.id;

  return methods.data.map(pm => ({
    id: pm.id,
    brand: pm.card?.brand ?? "card",
    last4: pm.card?.last4 ?? "····",
    expMonth: pm.card?.exp_month ?? 0,
    expYear: pm.card?.exp_year ?? 0,
    isDefault: pm.id === defaultId,
  }));
}

export async function createCardSetupIntent(): Promise<{ clientSecret?: string; error?: string }> {
  const { customerId, email, fullName } = await requireCustomer();
  const admin = createAdminClient();
  const stripeCustomerId = await ensureStripeCustomerId(admin, customerId, email, fullName);

  try {
    const si = await stripe().setupIntents.create({ customer: stripeCustomerId, automatic_payment_methods: { enabled: true } });
    return { clientSecret: si.client_secret ?? undefined };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Couldn't start card setup" };
  }
}

async function requireOwnedPaymentMethod(stripeCustomerId: string | undefined, paymentMethodId: string) {
  if (!stripeCustomerId) throw new Error("No saved cards");
  const pm = await stripe().paymentMethods.retrieve(paymentMethodId);
  if (pm.customer !== stripeCustomerId) throw new Error("This card doesn't belong to you");
}

export async function removePaymentMethod(paymentMethodId: string): Promise<{ error?: string }> {
  const { customerId } = await requireCustomer();
  const admin = createAdminClient();
  const { data } = await admin.from("customers").select("stripe_customer_id").eq("id", customerId).maybeSingle();

  try {
    await requireOwnedPaymentMethod(data?.stripe_customer_id as string | undefined, paymentMethodId);
    await stripe().paymentMethods.detach(paymentMethodId);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Couldn't remove that card" };
  }
  revalidatePath("/customer/account");
  return {};
}

export async function setDefaultPaymentMethod(paymentMethodId: string): Promise<{ error?: string }> {
  const { customerId } = await requireCustomer();
  const admin = createAdminClient();
  const { data } = await admin.from("customers").select("stripe_customer_id").eq("id", customerId).maybeSingle();
  const stripeCustomerId = data?.stripe_customer_id as string | undefined;

  try {
    await requireOwnedPaymentMethod(stripeCustomerId, paymentMethodId);
    await stripe().customers.update(stripeCustomerId!, { invoice_settings: { default_payment_method: paymentMethodId } });
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Couldn't set that card as default" };
  }
  revalidatePath("/customer/account");
  return {};
}
