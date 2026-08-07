import { redirect } from "next/navigation";
import { getCustomerContext } from "@/lib/dashboard/customer";
import { listMyBookings, listMyPaymentMethods } from "./actions";
import { AccountClient } from "./AccountClient";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export default async function CustomerAccountPage() {
  const ctx = await getCustomerContext();
  if (!ctx) redirect("/customer/login?next=/customer/account");

  const [bookings, cards] = await Promise.all([listMyBookings(), listMyPaymentMethods()]);

  return <AccountClient customerName={ctx.fullName} bookings={bookings} dateOfBirth={ctx.dateOfBirth} cards={cards} />;
}
