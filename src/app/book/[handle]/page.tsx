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
    .select("id, name, city, province, street_address, handle, stripe_connected, profile_image_url, cover_image_url")
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

  const [{ data: services }, { data: staff }, { data: hours }, customer, { data: reviewsRaw }] = await Promise.all([
    admin.from("services").select("id, name, price, duration_minutes, category").eq("shop_id", shop.id).eq("active", true).order("category", { ascending: true }).order("name", { ascending: true }),
    admin.from("staff").select("id, full_name, role, color").eq("shop_id", shop.id).eq("active", true),
    admin.from("business_hours").select("weekday, open, start_time, end_time").eq("shop_id", shop.id),
    getCustomerContext(),
    admin.from("reviews").select("id, rating, comment, created_at, customer_id, customers(full_name)").eq("shop_id", shop.id).order("created_at", { ascending: false }),
  ]);

  const reviews = (reviewsRaw ?? []).map(r => {
    const rel = r.customers as { full_name: string } | { full_name: string }[] | null;
    const reviewerName = Array.isArray(rel) ? rel[0]?.full_name : rel?.full_name;
    return {
      id: r.id as string,
      rating: r.rating as number,
      comment: r.comment as string | null,
      createdAt: r.created_at as string,
      reviewerName: (reviewerName as string | undefined) ?? "Anonymous",
      isMine: customer ? r.customer_id === customer.customerId : false,
    };
  });

  let canReview = false;
  if (customer) {
    const { data: completedAppt } = await admin
      .from("appointments")
      .select("id")
      .eq("shop_id", shop.id)
      .eq("customer_id", customer.customerId)
      .eq("status", "completed")
      .limit(1)
      .maybeSingle();
    canReview = Boolean(completedAppt);
  }

  return (
    <BookingClient
      shop={{
        id: shop.id as string, name: shop.name as string, city: shop.city as string, province: shop.province as string,
        streetAddress: (shop.street_address as string | null) ?? null,
        stripeConnected: Boolean(shop.stripe_connected),
        profileImageUrl: (shop.profile_image_url as string | null) ?? null,
        coverImageUrl: (shop.cover_image_url as string | null) ?? null,
      }}
      services={(services ?? []) as { id: string; name: string; price: number; duration_minutes: number; category: string | null }[]}
      staff={(staff ?? []) as { id: string; full_name: string; role: string | null; color: string }[]}
      businessHours={(hours ?? []) as { weekday: number; open: boolean; start_time: string; end_time: string }[]}
      initialCustomer={customer ? { fullName: customer.fullName, email: customer.email } : null}
      reviews={reviews}
      canReview={canReview}
    />
  );
}
