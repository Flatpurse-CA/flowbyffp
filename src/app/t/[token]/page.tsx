import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/admin";
import { TapTimes } from "./TapTimes";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Pick a time", robots: { index: false, follow: false } };

export default async function TimeOfferPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  if (!/^[A-Za-z0-9_-]{8,32}$/.test(token)) notFound();
  const admin = createAdminClient();
  const { data: link } = await admin.from("time_offer_links").select("client_name, booking_id, offer_id").eq("token", token).maybeSingle();
  if (!link) notFound();
  const { data: offer } = await admin.from("time_offers")
    .select("slot_times, expires_at, booked_slot, booking_id, shops(name, handle), services(name), staff(full_name)")
    .eq("id", link.offer_id).maybeSingle();
  if (!offer) notFound();

  const shop = offer.shops as unknown as { name: string; handle: string | null };
  const now = new Date().toISOString();
  const state = link.booking_id ? "mine" : offer.booking_id ? "gone" : offer.expires_at < now ? "expired" : "open";
  return (
    <TapTimes
      token={token}
      firstName={(link.client_name as string).split(" ")[0]}
      shopName={shop?.name ?? ""}
      bookingUrl={shop?.handle ? `/book/${shop.handle}` : null}
      serviceName={(offer.services as unknown as { name: string } | null)?.name ?? ""}
      staffName={(offer.staff as unknown as { full_name: string } | null)?.full_name ?? null}
      slots={(offer.slot_times as string[]).filter((s) => s > now)}
      initial={state}
      bookedSlot={(offer.booked_slot as string | null) ?? null}
    />
  );
}
