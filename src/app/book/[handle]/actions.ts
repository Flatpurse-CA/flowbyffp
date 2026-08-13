"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { getCustomerContext } from "@/lib/dashboard/customer";
import { shopWallTimeToUTC } from "@/lib/dashboard/shopTime";
import { sendBookingConfirmationEmail } from "@/lib/resend";
import { stripe } from "@/lib/stripe";
import { ensureStripeCustomerId } from "@/lib/stripeCustomer";
import { attributeAutopilotRevenue } from "@/lib/dashboard/autopilotAttribution";

const SLOT_INTERVAL_MINUTES = 30;

export async function getAvailableSlots(input: {
  shopId: string; serviceId: string; staffId: string | "any"; date: string; // date: "YYYY-MM-DD"
}): Promise<string[]> {
  const admin = createAdminClient();

  const { data: service } = await admin
    .from("services")
    .select("duration_minutes")
    .eq("id", input.serviceId)
    .eq("shop_id", input.shopId)
    .eq("active", true)
    .maybeSingle();
  if (!service) return [];
  const durationMinutes = service.duration_minutes as number;

  const weekday = new Date(`${input.date}T00:00:00Z`).getUTCDay();
  const { data: hoursRow } = await admin
    .from("business_hours")
    .select("open, start_time, end_time")
    .eq("shop_id", input.shopId)
    .eq("weekday", weekday)
    .maybeSingle();
  if (!hoursRow || !hoursRow.open) return [];

  const dayStart = shopWallTimeToUTC(input.date, String(hoursRow.start_time).slice(0, 5));
  const dayEnd = shopWallTimeToUTC(input.date, String(hoursRow.end_time).slice(0, 5));

  let staffIds: string[] = [];
  if (input.staffId === "any") {
    const { data: staffRows } = await admin.from("staff").select("id").eq("shop_id", input.shopId).eq("active", true);
    staffIds = (staffRows ?? []).map(s => s.id as string);
  } else {
    staffIds = [input.staffId];
  }
  const unstaffed = staffIds.length === 0;

  const { data: apptsRaw } = await admin
    .from("appointments")
    .select("staff_id, starts_at, duration_minutes")
    .eq("shop_id", input.shopId)
    .neq("status", "cancelled")
    .gte("starts_at", dayStart.toISOString())
    .lte("starts_at", new Date(dayEnd.getTime() + 4 * 60 * 60 * 1000).toISOString());
  const appts = apptsRaw ?? [];

  const overlaps = (aStart: number, aEnd: number, bStart: number, bEnd: number) => aStart < bEnd && aEnd > bStart;

  const slots: string[] = [];
  for (let t = dayStart.getTime(); t + durationMinutes * 60000 <= dayEnd.getTime(); t += SLOT_INTERVAL_MINUTES * 60000) {
    const slotEnd = t + durationMinutes * 60000;

    const isFree = (sid: string | null) => !appts.some(a => {
      if (a.staff_id !== sid) return false;
      const aStart = new Date(a.starts_at).getTime();
      return overlaps(aStart, aStart + (a.duration_minutes as number) * 60000, t, slotEnd);
    });

    const available = unstaffed ? isFree(null) : staffIds.some(isFree);
    if (available) slots.push(new Date(t).toISOString());
  }

  return slots;
}

export async function createPublicBooking(input: {
  shopId: string;
  serviceId: string;
  staffId: string | null;
  startsAt: string;
  notes?: string;
}): Promise<{ error?: string; appointmentId?: string }> {
  const ctx = await getCustomerContext();
  if (!ctx) return { error: "You need to be signed in to book" };

  const admin = createAdminClient();

  const { data: shop } = await admin.from("shops").select("id, name").eq("id", input.shopId).maybeSingle();
  if (!shop) return { error: "This shop couldn't be found" };

  const { data: service } = await admin
    .from("services")
    .select("id, name, price, duration_minutes")
    .eq("id", input.serviceId)
    .eq("shop_id", input.shopId)
    .eq("active", true)
    .maybeSingle();
  if (!service) return { error: "This service is no longer available" };

  let stylistName: string | null = null;
  if (input.staffId) {
    const { data: staff } = await admin.from("staff").select("full_name").eq("id", input.staffId).eq("shop_id", input.shopId).eq("active", true).maybeSingle();
    if (!staff) return { error: "That team member is no longer available" };
    stylistName = staff.full_name as string;
  }

  // Re-check for a conflict at insert time (best-effort — a race is still possible
  // between two customers booking the same slot simultaneously, acceptable for v1).
  const slotStart = new Date(input.startsAt).getTime();
  const slotEnd = slotStart + (service.duration_minutes as number) * 60000;
  if (input.staffId) {
    const { data: conflicting } = await admin
      .from("appointments")
      .select("id, starts_at, duration_minutes")
      .eq("shop_id", input.shopId)
      .eq("staff_id", input.staffId)
      .neq("status", "cancelled")
      .gte("starts_at", new Date(slotStart - 4 * 60 * 60 * 1000).toISOString())
      .lte("starts_at", new Date(slotEnd).toISOString());
    const clash = (conflicting ?? []).some(a => {
      const aStart = new Date(a.starts_at).getTime();
      const aEnd = aStart + (a.duration_minutes as number) * 60000;
      return aStart < slotEnd && aEnd > slotStart;
    });
    if (clash) return { error: "That slot was just booked by someone else, pick another time" };
  }

  const { data: inserted, error } = await admin
    .from("appointments")
    .insert({
      shop_id: input.shopId,
      customer_id: ctx.customerId,
      client_name: ctx.fullName,
      client_phone: ctx.phone,
      client_email: ctx.email,
      client_notes: input.notes || null,
      service_name: service.name,
      stylist_name: stylistName,
      staff_id: input.staffId,
      starts_at: input.startsAt,
      duration_minutes: service.duration_minutes,
      price: service.price,
      status: "pending",
    })
    .select("id")
    .single();

  if (error || !inserted) return { error: error?.message ?? "Couldn't create that booking" };

  await attributeAutopilotRevenue(admin, { shopId: input.shopId, clientEmail: ctx.email, price: Number(service.price) });

  try {
    await sendBookingConfirmationEmail(ctx.email, {
      shopName: shop.name as string,
      serviceName: service.name as string,
      startsAt: input.startsAt,
      stylistName,
    });
  } catch {
    // Booking already succeeded — a failed confirmation email shouldn't fail the booking itself.
  }

  return { appointmentId: inserted.id as string };
}

export async function createPaymentIntent(input: {
  appointmentId: string; depositOnly: boolean;
}): Promise<{ clientSecret?: string; amount?: number; error?: string }> {
  const ctx = await getCustomerContext();
  if (!ctx) return { error: "You need to be signed in to pay" };

  const admin = createAdminClient();

  const { data: appt } = await admin
    .from("appointments")
    .select("id, shop_id, customer_id, price")
    .eq("id", input.appointmentId)
    .maybeSingle();
  if (!appt || appt.customer_id !== ctx.customerId) return { error: "Booking not found" };

  const { data: shop } = await admin
    .from("shops")
    .select("stripe_account_id, stripe_connected")
    .eq("id", appt.shop_id)
    .maybeSingle();
  if (!shop?.stripe_connected || !shop.stripe_account_id) return { error: "This shop isn't set up for online payments" };

  const stripeCustomerId = await ensureStripeCustomerId(admin, ctx.customerId, ctx.email, ctx.fullName);

  const fullAmount = Number(appt.price);
  const amount = input.depositOnly ? Math.ceil(fullAmount * 0.2 * 100) / 100 : fullAmount;

  try {
    const intent = await stripe().paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: "cad",
      customer: stripeCustomerId,
      // Saves the card to the customer's account (surfaces in "Payment methods" and
      // as a quick-pay option on their next booking) without requiring a checkbox.
      setup_future_usage: "off_session",
      transfer_data: { destination: shop.stripe_account_id },
      metadata: { appointment_id: appt.id },
      automatic_payment_methods: { enabled: true },
    });
    return { clientSecret: intent.client_secret ?? undefined, amount };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Couldn't start payment" };
  }
}

export async function payWithSavedCard(input: {
  appointmentId: string; paymentMethodId: string; depositOnly: boolean;
}): Promise<{ success?: boolean; requiresActionClientSecret?: string; error?: string }> {
  const ctx = await getCustomerContext();
  if (!ctx) return { error: "You need to be signed in to pay" };

  const admin = createAdminClient();

  const { data: appt } = await admin
    .from("appointments")
    .select("id, shop_id, customer_id, price")
    .eq("id", input.appointmentId)
    .maybeSingle();
  if (!appt || appt.customer_id !== ctx.customerId) return { error: "Booking not found" };

  const { data: shop } = await admin
    .from("shops")
    .select("stripe_account_id, stripe_connected")
    .eq("id", appt.shop_id)
    .maybeSingle();
  if (!shop?.stripe_connected || !shop.stripe_account_id) return { error: "This shop isn't set up for online payments" };

  const { data: customerRow } = await admin.from("customers").select("stripe_customer_id").eq("id", ctx.customerId).maybeSingle();
  const stripeCustomerId = customerRow?.stripe_customer_id as string | undefined;
  if (!stripeCustomerId) return { error: "No saved card found" };

  const pm = await stripe().paymentMethods.retrieve(input.paymentMethodId);
  if (pm.customer !== stripeCustomerId) return { error: "This card doesn't belong to you" };

  const fullAmount = Number(appt.price);
  const amount = input.depositOnly ? Math.ceil(fullAmount * 0.2 * 100) / 100 : fullAmount;

  try {
    await stripe().paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: "cad",
      customer: stripeCustomerId,
      payment_method: input.paymentMethodId,
      off_session: true,
      confirm: true,
      transfer_data: { destination: shop.stripe_account_id },
      metadata: { appointment_id: appt.id },
    });
    return { success: true };
  } catch (e) {
    const stripeErr = e as { payment_intent?: { client_secret?: string | null }; message?: string };
    if (stripeErr.payment_intent?.client_secret) {
      return { requiresActionClientSecret: stripeErr.payment_intent.client_secret };
    }
    return { error: stripeErr.message ?? "Payment failed" };
  }
}
