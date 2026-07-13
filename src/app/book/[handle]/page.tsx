import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCustomerContext } from "@/lib/dashboard/customer";
import { BookingClient } from "./BookingClient";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export default async function BookingPage({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  const admin = createAdminClient();

  const { data: shop } = await admin
    .from("shops")
    .select("id, name, city, province, handle, stripe_connected")
    .eq("handle", handle)
    .maybeSingle();

  if (!shop) notFound();

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
