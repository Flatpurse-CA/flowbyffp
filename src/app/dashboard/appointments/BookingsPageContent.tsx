import { createClient } from "@/lib/supabase/server";
import { getShopContext } from "@/lib/dashboard/shop";
import { getRequestOrigin } from "@/lib/requestOrigin";
import { listAppointments } from "./actions";
import { listStaff } from "../team/actions";
import { AppointmentsClient, type BookingsStatusFilter } from "./AppointmentsClient";

export async function BookingsPageContent({ statusFilter }: { statusFilter?: BookingsStatusFilter }) {
  const ctx = await getShopContext();

  if (!ctx) {
    return (
      <div style={{ maxWidth: 460, margin: "100px auto 0", textAlign: "center" }}>
        <h1 style={{ color: "var(--dtext)", fontSize: 19, fontWeight: 800, margin: "0 0 10px", letterSpacing: "-0.02em" }}>
          Finish setting up your shop
        </h1>
        <p style={{ color: "var(--dw45)", fontSize: 13.5, lineHeight: 1.6, margin: 0 }}>
          We couldn&apos;t find a shop linked to your account yet. Complete onboarding to start taking real bookings.
        </p>
      </div>
    );
  }

  const supabase = await createClient();
  const { data: shop } = await supabase.from("shops").select("handle").eq("id", ctx.shopId).maybeSingle();

  const now = new Date();
  const rangeStart = new Date(now);
  rangeStart.setDate(rangeStart.getDate() - 7);
  const rangeEnd = new Date(now);
  rangeEnd.setDate(rangeEnd.getDate() + 45);

  const [appointments, staff, origin] = await Promise.all([
    listAppointments(rangeStart.toISOString(), rangeEnd.toISOString()),
    listStaff(),
    getRequestOrigin(),
  ]);
  const bookingUrl = shop?.handle ? `${origin}/book/${shop.handle}` : null;

  return (
    <AppointmentsClient
      initialAppointments={appointments}
      bookingUrl={bookingUrl}
      staff={staff}
      selfStaffId={ctx.staffId}
      statusFilter={statusFilter}
    />
  );
}
