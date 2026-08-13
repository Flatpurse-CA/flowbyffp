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
        .select("handle, frontdesk_enabled, name, business_type, bio, city, province, postal_code, phone")
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

  return (
    <Suspense>
      <SettingsClient
        initialBusinessHours={initialBusinessHours}
        initialStripeConnected={initialStripeConnected}
        initialBookingUrl={initialBookingUrl}
        initialBilling={initialBilling}
        initialFrontdeskEnabled={Boolean(shop?.frontdesk_enabled)}
        initialBusinessProfile={initialBusinessProfile}
      />
    </Suspense>
  );
}
