import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getShopContext, getAuthUser } from "@/lib/dashboard/shop";
import { getRequestOrigin } from "@/lib/requestOrigin";
import { getBusinessHours, getStripeStatus, getBillingStatus } from "./actions";
import { SettingsClient } from "./SettingsClient";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export default async function SettingsPage() {
  const ctx = await getShopContext();
  if (ctx && ctx.role !== "owner") redirect("/dashboard");

  const supabase = await createClient();
  const user = await getAuthUser();

  const { data: shop } = user
    ? await supabase
        .from("shops")
        .select("handle, frontdesk_enabled, noshow_recovery_enabled, filler_enabled, winback_enabled, reminders_enabled, birthday_enabled, notification_prefs, tax_rate, tax_inclusive, name, business_type, bio, city, province, postal_code, phone, profile_image_url, cover_image_url")
        .eq("owner_id", user.id)
        .maybeSingle()
    : { data: null };

  const [initialBusinessHours, { connected: initialStripeConnected }, origin, initialBilling] = await Promise.all([
    getBusinessHours(),
    getStripeStatus(),
    getRequestOrigin(),
    getBillingStatus(),
  ]);
  const initialBookingUrl = shop?.handle ? `${origin}/book/${shop.handle}` : null;

  const initialBusinessProfile = {
    name: (shop?.name as string | undefined) ?? "",
    handle: (shop?.handle as string | undefined) ?? "",
    businessType: (shop?.business_type as string | undefined) ?? "",
    bio: (shop?.bio as string | undefined) ?? "",
    city: (shop?.city as string | undefined) ?? "",
    province: (shop?.province as string | undefined) ?? "",
    postalCode: (shop?.postal_code as string | undefined) ?? "",
    phone: (shop?.phone as string | undefined) ?? "",
  };

  const initialFlowFlags = {
    rebooking:  Boolean(shop?.reminders_enabled),
    noshow:     Boolean(shop?.noshow_recovery_enabled),
    winback:    Boolean(shop?.winback_enabled),
    birthday:   Boolean(shop?.birthday_enabled),
    lastminute: Boolean(shop?.filler_enabled),
    frontdesk:  Boolean(shop?.frontdesk_enabled),
  };

  const DEFAULT_NOTIFICATION_PREFS = {
    new_booking: true, cancellation: true, no_show_alert: true, payment_received: false,
    autopilot_win: true, daily_brief: true, weekly_revenue_recap: true, monthly_statement: false,
  };
  const initialNotificationPrefs = { ...DEFAULT_NOTIFICATION_PREFS, ...(shop?.notification_prefs as object ?? {}) };

  return (
    <Suspense>
      <SettingsClient
        shopId={ctx?.shopId ?? null}
        initialBusinessHours={initialBusinessHours}
        initialStripeConnected={initialStripeConnected}
        initialBookingUrl={initialBookingUrl}
        initialBilling={initialBilling}
        initialFlowFlags={initialFlowFlags}
        initialNotificationPrefs={initialNotificationPrefs}
        initialTaxRate={(shop?.tax_rate as number | null | undefined) ?? null}
        initialTaxInclusive={Boolean(shop?.tax_inclusive)}
        initialBusinessProfile={initialBusinessProfile}
        initialProfileImageUrl={(shop?.profile_image_url as string | undefined) ?? null}
        initialCoverImageUrl={(shop?.cover_image_url as string | undefined) ?? null}
      />
    </Suspense>
  );
}
