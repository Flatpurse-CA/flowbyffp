"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireShop, getCurrentShopId, getShopContext } from "@/lib/dashboard/shop";
import { attributeAutopilotRevenue } from "@/lib/dashboard/autopilotAttribution";
import { stripe } from "@/lib/stripe";
import { sendSms } from "@/lib/twilio";

export type AppointmentStatus = "confirmed" | "pending" | "deposit" | "completed" | "cancelled";

export type AppointmentRow = {
  id: string;
  customer_id: string | null;
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
  completed_at: string | null;
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

  const ctx = await getShopContext();
  if (ctx?.accessStatus === "grace" || ctx?.accessStatus === "inactive") {
    throw new Error("New bookings are paused until a card is added — visit Billing to resume.");
  }

  // Customers are platform-wide (one account can book at any shop) — if this
  // walk-in/phone booking's email or phone matches an existing customer
  // account, link it now so it shows up on that person's "My bookings" the
  // same as an appointment they booked themselves, instead of only existing
  // as a shop-side record with no way for the client to ever see it.
  let customerId: string | null = null;
  if (input.clientEmail || input.clientPhone) {
    const admin = createAdminClient();
    const orFilters = [
      input.clientEmail ? `email.eq.${input.clientEmail}` : null,
      input.clientPhone ? `phone.eq.${input.clientPhone}` : null,
    ].filter(Boolean).join(",");
    const { data: match } = await admin.from("customers").select("id").or(orFilters).limit(1).maybeSingle();
    customerId = (match?.id as string | undefined) ?? null;
  }

  const { error } = await supabase.from("appointments").insert({
    shop_id: shopId,
    customer_id: customerId,
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

  await attributeAutopilotRevenue(supabase, { shopId, clientEmail: input.clientEmail, price: input.price });

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

export async function updateAppointmentDetails(id: string, input: {
  clientName: string;
  clientPhone?: string;
  clientEmail?: string;
  serviceName: string;
  price: number;
  notes?: string;
}) {
  const { supabase, shopId } = await requireShop();

  const clientName = input.clientName.trim();
  if (!clientName) throw new Error("Client name can't be empty");
  const serviceName = input.serviceName.trim();
  if (!serviceName) throw new Error("Service can't be empty");
  if (!Number.isFinite(input.price) || input.price < 0) throw new Error("Price must be a positive number");

  const { error } = await supabase
    .from("appointments")
    .update({
      client_name: clientName,
      client_phone: input.clientPhone?.trim() || null,
      client_email: input.clientEmail?.trim() || null,
      service_name: serviceName,
      price: input.price,
      client_notes: input.notes?.trim() || null,
      updated_at: new Date().toISOString(),
    })
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

// Real Stripe Payment Link, created on the shop's own connected account —
// same { stripeAccount } convention as the Tap to Pay terminal routes
// (src/app/api/terminal/create-payment-intent/route.ts). Replaces what was
// previously a fake "Sending payment link…" simulation with no backend call.
export async function sendAppointmentPaymentLink(
  appointmentId: string,
  input: { amount: number; clientName: string; clientPhone: string | null; serviceName: string },
): Promise<{ error?: string; url?: string }> {
  const { supabase, shopId } = await requireShop();

  const { data: shop } = await supabase.from("shops").select("stripe_account_id, country, name").eq("id", shopId).maybeSingle();
  const stripeAccountId = shop?.stripe_account_id as string | undefined;
  if (!stripeAccountId) return { error: "Connect Stripe in Settings before sending payment links" };
  if (!input.clientPhone) return { error: "This client has no phone number on file to text the link to" };

  const currency = (shop?.country as string | undefined)?.trim().toLowerCase() === "united states" ? "usd" : "cad";

  try {
    const link = await stripe().paymentLinks.create(
      {
        line_items: [{
          price_data: {
            currency,
            product_data: { name: `${input.serviceName} — ${shop?.name ?? "Appointment"}` },
            unit_amount: Math.round(input.amount * 100),
          },
          quantity: 1,
        }],
        metadata: { appointment_id: appointmentId, shop_id: shopId },
      },
      { stripeAccount: stripeAccountId },
    );

    const { error: smsError } = await sendSms(input.clientPhone, `Hi ${input.clientName.split(" ")[0]}, here's your payment link for ${input.serviceName}: ${link.url}`);
    if (smsError) return { error: `Link created but the text didn't send: ${smsError}`, url: link.url };

    return { url: link.url };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Couldn't create the payment link" };
  }
}

export async function sendAppointmentReceipt(input: { clientPhone: string | null; clientName: string; serviceName: string; amount: number }): Promise<{ error?: string }> {
  if (!input.clientPhone) return { error: "This client has no phone number on file to text a receipt to" };
  const fmtMoney = (n: number) => `C$${n.toFixed(2)}`;
  const { error } = await sendSms(input.clientPhone, `Hi ${input.clientName.split(" ")[0]}, your receipt for ${input.serviceName}: ${fmtMoney(input.amount)} paid. Thanks for booking with us!`);
  if (error) return { error };
  return {};
}
