import { redirect } from "next/navigation";
import { getCustomerContext } from "@/lib/dashboard/customer";
import { listMyBookings } from "./actions";
import { AccountClient } from "./AccountClient";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export default async function CustomerAccountPage() {
  const ctx = await getCustomerContext();
  if (!ctx) redirect("/customer/login?next=/customer/account");

  const bookings = await listMyBookings();

  return <AccountClient customerName={ctx.fullName} bookings={bookings} />;
}
