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
        .select("family_hours_enabled, family_hours_start, family_hours_end, handle")
        .eq("owner_id", user.id)
        .maybeSingle()
    : { data: null };

  const initialFamilyHours = {
    enabled: shop?.family_hours_enabled ?? false,
    start: (shop?.family_hours_start as string | undefined)?.slice(0, 5) ?? "18:00",
    end: (shop?.family_hours_end as string | undefined)?.slice(0, 5) ?? "20:00",
  };

  const [initialBusinessHours, { connected: initialStripeConnected }, origin, initialBilling] = await Promise.all([
    getBusinessHours(),
    getStripeStatus(),
    getRequestOrigin(),
    getBillingStatus(),
  ]);
  const initialBookingUrl = shop?.handle ? `${origin}/book/${shop.handle}` : null;

  return (
    <Suspense>
      <SettingsClient
        initialFamilyHours={initialFamilyHours}
        initialBusinessHours={initialBusinessHours}
        initialStripeConnected={initialStripeConnected}
        initialBookingUrl={initialBookingUrl}
        initialBilling={initialBilling}
      />
    </Suspense>
  );
}
