"use server";

import { logShopAction } from "@/lib/audit";
import { computeTax, shopTaxSettings, type TaxBreakdown } from "@/lib/tax";

import { normalizePhoneForStorage } from "@/lib/phone";
import { pgrstQuote } from "@/lib/postgrest";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireShop, getCurrentShopId, getShopContext } from "@/lib/dashboard/shop";
import { attributeAutopilotRevenue, unattributeAutopilotRevenue } from "@/lib/dashboard/autopilotAttribution";
import { stripe } from "@/lib/stripe";
import { applicationFeeParam } from "@/lib/billing/platformFee";
import { amountFor, newManageToken, type FeeMode } from "@/lib/booking/policy";
import { chargeSavedCard } from "@/lib/booking/chargeFee";
import { sendSms } from "@/lib/twilio";
import { shopHasFeature } from "@/lib/dashboard/plan";
import { getRequestOrigin } from "@/lib/requestOrigin";
import {
  sendBookingConfirmedEmail,
  sendBookingDeclinedEmail,
  sendBookingCancelledEmail,
  sendBookingRescheduledEmail,
  sendReviewRequestEmail,
  sendNoShowEmail,
} from "@/lib/resend";

type ShopEmailContext = { name: string; street_address: string | null; city: string | null; province: string | null; phone: string | null; handle: string | null };

async function getShopEmailContext(supabase: Awaited<ReturnType<typeof requireShop>>["supabase"], shopId: string): Promise<ShopEmailContext | null> {
  const { data } = await supabase
    .from("shops")
    .select("name, street_address, city, province, phone, handle")
    .eq("id", shopId)
    .maybeSingle();
  return (data as ShopEmailContext | null) ?? null;
}

export type AppointmentStatus = "confirmed" | "pending" | "deposit" | "completed" | "cancelled" | "no_show";

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
  tax_amount?: number | null;
  tax_breakdown?: TaxBreakdown | null;
  /** Set when a client referral discount was applied at booking (price is already net of it). */
  discount_amount?: number | null;
  discount_reason?: string | null;
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
      input.clientEmail ? `email.eq.${pgrstQuote(input.clientEmail)}` : null,
      input.clientPhone ? `phone.eq.${pgrstQuote(input.clientPhone)}` : null,
    ].filter(Boolean).join(",");
    const { data: match } = await admin.from("customers").select("id").or(orFilters).limit(1).maybeSingle();
    customerId = (match?.id as string | undefined) ?? null;
  }

  const { data: insertedAppt, error } = await supabase.from("appointments").insert({
    shop_id: shopId,
    customer_id: customerId,
    client_name: input.clientName,
    client_phone: normalizePhoneForStorage(input.clientPhone),
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
  }).select("id").single();

  if (error) throw new Error(error.message);

  await attributeAutopilotRevenue(supabase, { shopId, clientEmail: input.clientEmail, clientPhone: input.clientPhone, price: input.price, appointmentId: insertedAppt?.id as string | undefined });

  revalidatePath("/dashboard/appointments");
}

export async function rescheduleAppointment(id: string, startsAt: string) {
  const { supabase, shopId } = await requireShop();

  const { data: appt, error } = await supabase
    .from("appointments")
    .update({ starts_at: startsAt, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("shop_id", shopId)
    .select("client_email, service_name, duration_minutes, stylist_name")
    .maybeSingle();

  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/appointments");

  if (appt?.client_email) {
    const shop = await getShopEmailContext(supabase, shopId);
    if (shop) {
      try {
        await sendBookingRescheduledEmail(appt.client_email as string, {
          appointmentId: id,
          shopName: shop.name,
          serviceName: appt.service_name as string,
          startsAt,
          durationMinutes: appt.duration_minutes as number,
          stylistName: appt.stylist_name as string | null,
          streetAddress: shop.street_address,
          city: shop.city,
          province: shop.province,
          shopPhone: shop.phone,
        });
      } catch {
        // Non-fatal — the reschedule already succeeded.
      }
    }
  }
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
      client_phone: normalizePhoneForStorage(input.clientPhone),
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

  const { data: appt, error } = await supabase
    .from("appointments")
    .update({ status: "confirmed", updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("shop_id", shopId)
    .select("client_email, service_name, starts_at, duration_minutes, stylist_name")
    .maybeSingle();

  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/appointments");

  if (appt?.client_email) {
    const shop = await getShopEmailContext(supabase, shopId);
    if (shop) {
      try {
        await sendBookingConfirmedEmail(appt.client_email as string, {
          appointmentId: id,
          shopName: shop.name,
          serviceName: appt.service_name as string,
          startsAt: appt.starts_at as string,
          durationMinutes: appt.duration_minutes as number,
          stylistName: appt.stylist_name as string | null,
          streetAddress: shop.street_address,
          city: shop.city,
          province: shop.province,
          shopPhone: shop.phone,
        });
      } catch {
        // Non-fatal — the confirmation already succeeded.
      }
    }
  }
}

export async function cancelAppointment(id: string) {
  const { supabase, shopId } = await requireShop();

  const { data: before } = await supabase
    .from("appointments")
    .select("status")
    .eq("id", id)
    .eq("shop_id", shopId)
    .maybeSingle();
  const wasPending = before?.status === "pending";

  const { data: appt, error } = await supabase
    .from("appointments")
    .update({ status: "cancelled", updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("shop_id", shopId)
    .select("client_email, service_name, starts_at")
    .maybeSingle();
  if (appt) await unattributeAutopilotRevenue(createAdminClient(), id);

  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/appointments");

  if (appt?.client_email) {
    const shop = await getShopEmailContext(supabase, shopId);
    if (shop) {
      try {
        if (wasPending) {
          await sendBookingDeclinedEmail(appt.client_email as string, {
            shopName: shop.name,
            serviceName: appt.service_name as string,
            startsAt: appt.starts_at as string,
          });
        } else {
          await sendBookingCancelledEmail(appt.client_email as string, {
            shopName: shop.name,
            serviceName: appt.service_name as string,
            startsAt: appt.starts_at as string,
            cancelledBy: "shop",
          });
        }
      } catch {
        // Non-fatal — the cancellation already succeeded.
      }
    }
  }
}

export async function completeAppointment(
  id: string,
  input: { tipAmount: number; paymentMethod: string; paidAmount: number },
) {
  const { supabase, shopId } = await requireShop();

  // Record the tax on the full service price from the shop's own settings,
  // not from whatever the client screen sent.
  const [{ data: shopTax }, { data: current }] = await Promise.all([
    supabase.from("shops").select("province, province_code, tax_registered, pst_on_services, tax_inclusive").eq("id", shopId).maybeSingle(),
    supabase.from("appointments").select("price, service_name").eq("id", id).eq("shop_id", shopId).maybeSingle(),
  ]);
  let taxFields: { tax_amount: number; tax_breakdown: TaxBreakdown } | Record<string, never> = {};
  if (shopTax && current) {
    const { data: exempt } = await supabase.from("services").select("id").eq("shop_id", shopId).eq("name", current.service_name).eq("tax_exempt", true).limit(1);
    const breakdown = computeTax(shopTaxSettings(shopTax), [{ amount: Number(current.price), kind: "service", exempt: Boolean(exempt?.length) }]);
    taxFields = { tax_amount: breakdown.tax, tax_breakdown: breakdown };
  }

  const { data: appt, error } = await supabase
    .from("appointments")
    .update({
      status: "completed",
      ...taxFields,
      tip_amount: input.tipAmount,
      payment_method: input.paymentMethod,
      paid_amount: input.paidAmount,
      completed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("shop_id", shopId)
    .select("client_email")
    .maybeSingle();

  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/appointments");

  if (appt?.client_email) {
    const shop = await getShopEmailContext(supabase, shopId);
    if (shop?.handle) {
      try {
        const origin = await getRequestOrigin();
        await sendReviewRequestEmail(appt.client_email as string, {
          shopName: shop.name,
          reviewUrl: `${origin}/book/${shop.handle}`,
        });
      } catch {
        // Non-fatal — completion already succeeded.
      }
    }
  }
}

export async function markNoShow(id: string) {
  const { supabase, shopId } = await requireShop();

  const { data: appt, error } = await supabase
    .from("appointments")
    .update({ status: "no_show", updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("shop_id", shopId)
    .select("client_email, service_name, starts_at, price, customer_id, fee_charged_at")
    .maybeSingle();

  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/appointments");
  const feeAvailable = appt ? await noShowFeeFor(shopId, Number(appt.price), appt.customer_id as string | null, appt.fee_charged_at as string | null) : 0;

  if (appt?.client_email && !(await shopHasFeature(shopId, "autopilot"))) {
    const shop = await getShopEmailContext(supabase, shopId);
    if (shop) {
      try {
        await sendNoShowEmail(appt.client_email as string, {
          shopName: shop.name,
          serviceName: appt.service_name as string,
          startsAt: appt.starts_at as string,
        });
      } catch {
        // Non-fatal — the no-show mark already succeeded.
      }
    }
  }
  return { feeAvailable };
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
        ...(await applicationFeeParam(shopId, Math.round(input.amount * 100))),
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

export async function sendAppointmentReceipt(input: { clientPhone: string | null; clientName: string; serviceName: string; amount: number; appointmentId?: string }): Promise<{ error?: string }> {
  if (!input.clientPhone) return { error: "This client has no phone number on file to text a receipt to" };
  const fmtMoney = (n: number) => `C$${n.toFixed(2)}`;
  let link = "";
  if (input.appointmentId) {
    const { shopId } = await requireShop();
    const admin = createAdminClient();
    const { data: a } = await admin.from("appointments").select("manage_token").eq("id", input.appointmentId).eq("shop_id", shopId).maybeSingle();
    let token = (a?.manage_token as string | null) ?? null;
    if (a && !token) { token = newManageToken(); await admin.from("appointments").update({ manage_token: token }).eq("id", input.appointmentId); }
    if (token) link = ` Full receipt: ${process.env.NEXT_PUBLIC_SITE_URL ?? "https://flow.flatpurse.com"}/a/${token}/receipt`;
  }
  const { error } = await sendSms(input.clientPhone, `Hi ${input.clientName.split(" ")[0]}, your receipt for ${input.serviceName}: ${fmtMoney(input.amount)} paid.${link} Thanks for booking with us!`);
  if (error) return { error };
  return {};
}

async function noShowFeeFor(shopId: string, price: number, customerId: string | null, chargedAt: string | null): Promise<number> {
  if (!customerId || chargedAt) return 0;
  const { data: shop } = await createAdminClient().from("shops").select("no_show_fee_mode, no_show_fee_value, stripe_connected").eq("id", shopId).maybeSingle();
  if (!shop?.stripe_connected) return 0;
  return amountFor(shop.no_show_fee_mode as FeeMode, Number(shop.no_show_fee_value), price);
}

/** FL-037: no-show fee, charged only after staff confirm, to the client's saved card. */
export async function chargeNoShowFee(id: string): Promise<{ error?: string; amount?: number }> {
  const { shopId } = await requireShop();
  const admin = createAdminClient();
  const { data: a } = await admin.from("appointments").select("id, status, price, customer_id, fee_charged_at, card_consent_at").eq("id", id).eq("shop_id", shopId).maybeSingle();
  if (!a || a.status !== "no_show") return { error: "Mark the booking as a no-show first" };
  if (!a.card_consent_at) return { error: "The client didn't agree to fees when booking" };
  const amount = await noShowFeeFor(shopId, Number(a.price), a.customer_id as string | null, a.fee_charged_at as string | null);
  if (!amount) return { error: "No fee to charge" };
  const { data: shop } = await admin.from("shops").select("stripe_account_id").eq("id", shopId).maybeSingle();
  const r = await chargeSavedCard(admin, { appointmentId: id, customerId: a.customer_id as string, stripeAccountId: shop?.stripe_account_id as string, amount, kind: "no_show", shopId });
  revalidatePath("/dashboard/appointments");
  if (!r.error) await logShopAction("no_show_fee", { amount: amount.toFixed(2) });
  return r.error ? { error: r.error } : { amount };
}
