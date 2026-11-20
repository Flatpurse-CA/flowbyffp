import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/admin";
import { POLICY_COLUMNS, amountFor, insideWindow, policyText, type Policy } from "@/lib/booking/policy";
import { ManageBooking } from "./ManageBooking";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Your booking", robots: { index: false, follow: false } };

export default async function ManagePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  if (!/^[a-f0-9]{24}$/.test(token)) notFound();
  const admin = createAdminClient();
  const { data: a } = await admin.from("appointments").select("shop_id, client_name, service_name, stylist_name, starts_at, price, status").eq("manage_token", token).maybeSingle();
  if (!a) notFound();
  const { data: shop } = await admin.from("shops").select(`name, phone, ${POLICY_COLUMNS}`).eq("id", a.shop_id).maybeSingle();
  const p = shop as unknown as Policy & { name: string; phone: string | null };
  const { inside, upcoming } = timing(a.starts_at as string, p.cancel_window_hours);
  return (
    <ManageBooking
      token={token}
      shopName={p.name} shopPhone={p.phone}
      firstName={String(a.client_name).split(" ")[0]}
      service={a.service_name as string} staff={(a.stylist_name as string | null) ?? null}
      startsAt={a.starts_at as string}
      active={["confirmed", "deposit", "pending"].includes(a.status as string) && upcoming}
      cancelled={a.status === "cancelled"}
      inside={inside}
      lateFee={inside ? amountFor(p.late_cancel_fee_mode, p.late_cancel_fee_value, Number(a.price)) : 0}
      policy={policyText(p, Number(a.price))}
    />
  );
}

function timing(startsAt: string, hours: number) {
  return { inside: insideWindow(startsAt, hours), upcoming: new Date(startsAt).getTime() > Date.now() };
}
