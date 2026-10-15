"use server";

import { normalizePhoneForStorage } from "@/lib/phone";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCustomerContext } from "@/lib/dashboard/customer";
import { shopWallTimeToUTC } from "@/lib/dashboard/shopTime";
import { sendBookingConfirmationEmail, sendNewBookingAlertEmail } from "@/lib/resend";
import { getRequestOrigin } from "@/lib/requestOrigin";
import { stripe } from "@/lib/stripe";
import { ensureStripeCustomerId } from "@/lib/stripeCustomer";
import { attributeAutopilotRevenue } from "@/lib/dashboard/autopilotAttribution";
import { computeAccessStatus } from "@/lib/dashboard/accessStatus";
import { checkRateLimit } from "@/lib/rateLimit";
import { fillBusinessHoursDefaults } from "@/lib/dashboard/businessHours";
import { computeTax, shopTaxSettings, type TaxBreakdown } from "@/lib/tax";

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
  const { data: hoursRows } = await admin
    .from("business_hours")
    .select("weekday, open, start_time, end_time")
    .eq("shop_id", input.shopId);
  // No rows at all means the shop has never visited Settings > Hours — fall back
  // to the same Mon-Sat 9-6 default the settings screen itself shows, rather
  // than treating an unconfigured shop as closed every day (see page.tsx).
  const hoursRow = fillBusinessHoursDefaults(hoursRows ?? []).find(r => r.weekday === weekday);
  if (!hoursRow || !hoursRow.open) return [];

  let dayStart = shopWallTimeToUTC(input.date, String(hoursRow.start_time).slice(0, 5));
  let dayEnd = shopWallTimeToUTC(input.date, String(hoursRow.end_time).slice(0, 5));

  let staffIds: string[] = [];
  if (input.staffId === "any") {
    const { data: staffRows } = await admin.from("staff").select("id").eq("shop_id", input.shopId).eq("active", true);
    staffIds = (staffRows ?? []).map(s => s.id as string);
    // "Any staff" intentionally stays on the shop-wide window — narrowing to
    // each staff member's own hours here would mean a different available
    // window per candidate, which this single-window slot loop doesn't model.
  } else {
    staffIds = [input.staffId];

    // A specific staff member's own hours (if they've been configured) narrow
    // the shop-wide window. No row for this weekday = fall back to shop hours
    // unchanged, so staff added before this feature existed keep working.
    const { data: staffHoursRow } = await admin
      .from("staff_hours")
      .select("open, start_time, end_time")
      .eq("staff_id", input.staffId)
      .eq("weekday", weekday)
      .maybeSingle();

    if (staffHoursRow) {
      if (!staffHoursRow.open) return [];
      const staffStart = shopWallTimeToUTC(input.date, String(staffHoursRow.start_time).slice(0, 5));
      const staffEnd = shopWallTimeToUTC(input.date, String(staffHoursRow.end_time).slice(0, 5));
      dayStart = new Date(Math.max(dayStart.getTime(), staffStart.getTime()));
      dayEnd = new Date(Math.min(dayEnd.getTime(), staffEnd.getTime()));
      if (dayStart >= dayEnd) return [];
    }
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

  if (!await checkRateLimit(`create-booking:${ctx.customerId}`, 10, 10 * 60 * 1000)) {
    return { error: "Too many booking attempts — wait a few minutes and try again" };
  }

  const admin = createAdminClient();

  const { data: shop } = await admin.from("shops").select("id, owner_id, name, street_address, city, province, phone, trial_started_at, subscription_status, trial_override, trial_paused_at").eq("id", input.shopId).maybeSingle();
  if (!shop) return { error: "This shop couldn't be found" };

  const { status: shopAccessStatus } = computeAccessStatus(shop as { trial_started_at: string; subscription_status: string | null; trial_override: boolean; trial_paused_at: string | null });
  if (shopAccessStatus === "grace" || shopAccessStatus === "inactive") {
    return { error: "This business isn't currently accepting new bookings" };
  }

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
      client_phone: normalizePhoneForStorage(ctx.phone),
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
      appointmentId: inserted.id as string,
      shopName: shop.name as string,
      serviceName: service.name as string,
      startsAt: input.startsAt,
      durationMinutes: service.duration_minutes as number,
      stylistName,
      streetAddress: shop.street_address as string | null,
      city: shop.city as string | null,
      province: shop.province as string | null,
      shopPhone: shop.phone as string | null,
    });
  } catch {
    // Booking already succeeded — a failed confirmation email shouldn't fail the booking itself.
  }

  try {
    const { data: ownerRes } = await admin.auth.admin.getUserById(shop.owner_id as string);
    if (ownerRes?.user?.email) {
      const origin = await getRequestOrigin();
      await sendNewBookingAlertEmail(ownerRes.user.email, {
        clientName: ctx.fullName,
        serviceName: service.name as string,
        startsAt: input.startsAt,
        stylistName,
        dashboardUrl: `${origin}/dashboard/appointments`,
      });
    }
  } catch {
    // Non-fatal — the booking already succeeded.
  }

  return { appointmentId: inserted.id as string };
}

// Card payments are direct charges on the shop's own connected account: the
// shop pays Stripe's fees, Flow takes no application fee, and Stripe carries
// fraud and chargeback losses (see startStripeOnboarding's controller
// settings). Cards are saved on the platform customer so a client can reuse
// them at any shop, then cloned onto the shop's account for each charge.

type PayableAppointment = { id: string; shopId: string; stripeAccountId: string; amount: number; tax: TaxBreakdown | null };

async function loadPayableAppointment(appointmentId: string, customerId: string, depositOnly: boolean): Promise<PayableAppointment | { error: string }> {
  const admin = createAdminClient();
  const { data: appt } = await admin
    .from("appointments")
    .select("id, shop_id, customer_id, price, service_name")
    .eq("id", appointmentId)
    .maybeSingle();
  if (!appt || appt.customer_id !== customerId) return { error: "Booking not found" };

  const { data: shop } = await admin
    .from("shops")
    .select("stripe_account_id, stripe_connected, province, province_code, tax_registered, pst_on_services, tax_inclusive")
    .eq("id", appt.shop_id)
    .maybeSingle();
  if (!shop?.stripe_connected || !shop.stripe_account_id) return { error: "This shop isn't set up for online payments" };

  const price = Number(appt.price);
  if (depositOnly) {
    // Deposits aren't taxed; tax is charged on the final bill.
    return { id: appt.id as string, shopId: appt.shop_id as string, stripeAccountId: shop.stripe_account_id as string, amount: Math.ceil(price * 0.2 * 100) / 100, tax: null };
  }
  const { data: exempt } = await admin.from("services").select("id").eq("shop_id", appt.shop_id).eq("name", appt.service_name).eq("tax_exempt", true).limit(1);
  const tax = computeTax(shopTaxSettings(shop), [{ amount: price, kind: "service", exempt: Boolean(exempt?.length) }]);
  return { id: appt.id as string, shopId: appt.shop_id as string, stripeAccountId: shop.stripe_account_id as string, amount: tax.total, tax };
}

/** What the client will be charged, with tax lines, for the pay step's summary. */
export async function getAmountDue(input: { appointmentId: string; depositOnly: boolean }): Promise<{ amount?: number; tax?: TaxBreakdown | null; error?: string }> {
  const ctx = await getCustomerContext();
  if (!ctx) return { error: "You need to be signed in to pay" };
  const payable = await loadPayableAppointment(input.appointmentId, ctx.customerId, input.depositOnly);
  if ("error" in payable) return { error: payable.error };
  return { amount: payable.amount, tax: payable.tax };
}

/** Starts saving a new card on the client's platform customer; the charge happens in payWithSavedCard once it's saved. */
export async function startNewCardSetup(input: { appointmentId: string }): Promise<{ clientSecret?: string; error?: string }> {
  const ctx = await getCustomerContext();
  if (!ctx) return { error: "You need to be signed in to pay" };
  const payable = await loadPayableAppointment(input.appointmentId, ctx.customerId, false);
  if ("error" in payable) return { error: payable.error };

  const admin = createAdminClient();
  const stripeCustomerId = await ensureStripeCustomerId(admin, ctx.customerId, ctx.email, ctx.fullName);
  try {
    const setup = await stripe().setupIntents.create({
      customer: stripeCustomerId,
      usage: "off_session",
      payment_method_types: ["card"],
      metadata: { appointment_id: payable.id },
    });
    return { clientSecret: setup.client_secret ?? undefined };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Couldn't start payment" };
  }
}

export async function payWithSavedCard(input: {
  appointmentId: string; paymentMethodId: string; depositOnly: boolean;
}): Promise<{ success?: boolean; requiresActionClientSecret?: string; stripeAccount?: string; error?: string }> {
  const ctx = await getCustomerContext();
  if (!ctx) return { error: "You need to be signed in to pay" };

  const payable = await loadPayableAppointment(input.appointmentId, ctx.customerId, input.depositOnly);
  if ("error" in payable) return { error: payable.error };

  const admin = createAdminClient();
  const { data: customerRow } = await admin.from("customers").select("stripe_customer_id").eq("id", ctx.customerId).maybeSingle();
  const stripeCustomerId = customerRow?.stripe_customer_id as string | undefined;
  if (!stripeCustomerId) return { error: "No saved card found" };

  const pm = await stripe().paymentMethods.retrieve(input.paymentMethodId);
  if (pm.customer !== stripeCustomerId) return { error: "This card doesn't belong to you" };

  try {
    const cloned = await stripe().paymentMethods.create(
      { customer: stripeCustomerId, payment_method: input.paymentMethodId },
      { stripeAccount: payable.stripeAccountId },
    );
    const intent = await stripe().paymentIntents.create(
      {
        amount: Math.round(payable.amount * 100),
        currency: "cad",
        payment_method: cloned.id,
        payment_method_types: ["card"],
        confirm: true,
        metadata: {
          appointment_id: payable.id,
          ...(payable.tax ? { tax_amount: payable.tax.tax.toFixed(2) } : {}),
        },
      },
      { stripeAccount: payable.stripeAccountId },
    );
    if (intent.status === "requires_action" && intent.client_secret) {
      return { requiresActionClientSecret: intent.client_secret, stripeAccount: payable.stripeAccountId };
    }
    if (intent.status === "succeeded" || intent.status === "processing") return { success: true };
    return { error: "Payment could not be completed" };
  } catch (e) {
    const stripeErr = e as { payment_intent?: { client_secret?: string | null }; message?: string };
    if (stripeErr.payment_intent?.client_secret) {
      return { requiresActionClientSecret: stripeErr.payment_intent.client_secret, stripeAccount: payable.stripeAccountId };
    }
    return { error: stripeErr.message ?? "Payment failed" };
  }
}

export async function submitReview(input: { shopId: string; rating: number; comment?: string }): Promise<{ error?: string }> {
  const ctx = await getCustomerContext();
  if (!ctx) return { error: "Sign in to leave a review" };
  if (!Number.isInteger(input.rating) || input.rating < 1 || input.rating > 5) {
    return { error: "Pick a rating between 1 and 5 stars" };
  }

  const admin = createAdminClient();
  const { data: completedAppt } = await admin
    .from("appointments")
    .select("id")
    .eq("shop_id", input.shopId)
    .eq("customer_id", ctx.customerId)
    .eq("status", "completed")
    .limit(1)
    .maybeSingle();
  if (!completedAppt) return { error: "You can leave a review after a completed appointment here" };

  const { error } = await admin.from("reviews").upsert(
    {
      shop_id: input.shopId,
      customer_id: ctx.customerId,
      rating: input.rating,
      comment: input.comment?.trim() || null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "shop_id,customer_id" },
  );
  if (error) return { error: error.message };
  return {};
}

export async function deleteReview(shopId: string): Promise<{ error?: string }> {
  const ctx = await getCustomerContext();
  if (!ctx) return { error: "Sign in required" };

  const admin = createAdminClient();
  const { error } = await admin.from("reviews").delete().eq("shop_id", shopId).eq("customer_id", ctx.customerId);
  if (error) return { error: error.message };
  return {};
}
