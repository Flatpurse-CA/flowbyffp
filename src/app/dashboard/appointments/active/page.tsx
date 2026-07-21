import { BookingsPageContent } from "../BookingsPageContent";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export default async function ActiveBookingsPage() {
  return <BookingsPageContent statusFilter="active" />;
}
