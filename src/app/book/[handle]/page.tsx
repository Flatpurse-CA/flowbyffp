import { notFound, permanentRedirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCustomerContext } from "@/lib/dashboard/customer";
import { BookingClient } from "./BookingClient";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export default async function BookingPage({ params }: { params: Promise<{ handle: string }> }) {
  const { handle: rawHandle } = await params;
  // Handles are always stored lowercase (updateBusinessProfile in
  // dashboard/settings/actions.ts lowercases before saving) — matching
  // case-insensitively here means a link shared with the wrong casing
  // (typed, autocapitalized by a phone keyboard, etc.) still resolves
  // instead of 404ing.
  const handle = rawHandle.toLowerCase();
  const admin = createAdminClient();

  const { data: shop } = await admin
    .from("shops")
    .select("id, name, city, province, handle, stripe_connected")
    .eq("handle", handle)
    .maybeSingle();

  if (!shop) {
    // The handle might be a retired one — a shop can rename its booking
    // link, which records the old handle here so previously shared links
    // keep working instead of 404ing.
    const { data: retired } = await admin
      .from("shop_handle_history")
      .select("shops(handle)")
      .eq("old_handle", handle)
      .maybeSingle();
    const shopsRelation = retired?.shops as { handle: string } | { handle: string }[] | null;
    const currentHandle = Array.isArray(shopsRelation) ? shopsRelation[0]?.handle : shopsRelation?.handle;
    if (currentHandle) permanentRedirect(`/book/${currentHandle}`);
    notFound();
  }

  // Canonicalize the URL casing so links always converge on one URL.
  if (rawHandle !== handle) permanentRedirect(`/book/${handle}`);

  const [{ data: services }, { data: staff }, { data: hours }, customer] = await Promise.all([
    admin.from("services").select("id, name, price, duration_minutes, category").eq("shop_id", shop.id).eq("active", true).order("category", { ascending: true }).order("name", { ascending: true }),
    admin.from("staff").select("id, full_name, role, color").eq("shop_id", shop.id).eq("active", true),
    admin.from("business_hours").select("weekday, open, start_time, end_time").eq("shop_id", shop.id),
    getCustomerContext(),
  ]);

  return (
    <BookingClient
      shop={{ id: shop.id as string, name: shop.name as string, city: shop.city as string, province: shop.province as string, stripeConnected: Boolean(shop.stripe_connected) }}
      services={(services ?? []) as { id: string; name: string; price: number; duration_minutes: number; category: string | null }[]}
      staff={(staff ?? []) as { id: string; full_name: string; role: string | null; color: string }[]}
      businessHours={(hours ?? []) as { weekday: number; open: boolean; start_time: string; end_time: string }[]}
      initialCustomer={customer ? { fullName: customer.fullName, email: customer.email } : null}
    />
  );
}
