"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { getCustomerContext } from "@/lib/dashboard/customer";
import { shopWallTimeToUTC } from "@/lib/dashboard/familyHours";
import { sendBookingConfirmationEmail } from "@/lib/resend";

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
    if (clash) return { error: "That slot was just booked by someone else — pick another time" };
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
