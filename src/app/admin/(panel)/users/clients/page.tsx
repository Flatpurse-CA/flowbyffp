import { createAdminClient } from "@/lib/supabase/admin";
import { loadAccounts } from "@/lib/admin/accounts";
import { formatCAD } from "@/lib/plans";
import { UsersSectionHeader } from "../UsersSectionHeader";
import { AccountsTable, fmtDate } from "../AccountsTable";

// Clients: people who signed up through a shop's booking page to book. One
// client account works at every shop on the platform.
export default async function AdminClientsPage() {
  const admin = createAdminClient();
  const [accounts, apptsRes] = await Promise.all([
    loadAccounts(),
    admin.from("appointments").select("customer_id, shop_id, starts_at, status, price").not("customer_id", "is", null),
  ]);
  const clients = accounts.filter(a => a.kind === "client");
  const shopNames = new Map(accounts.filter(a => a.shop).map(a => [a.shop!.id, a.shop!.name]));

  type Stats = { bookings: number; spent: number; last: string | null; shops: Set<string> };
  const stats = new Map<string, Stats>();
  for (const ap of apptsRes.data ?? []) {
    const s = stats.get(ap.customer_id as string) ?? { bookings: 0, spent: 0, last: null, shops: new Set<string>() };
    s.bookings++;
    if (ap.status === "completed") s.spent += Number(ap.price) || 0;
    if (!s.last || ap.starts_at > s.last) s.last = ap.starts_at as string;
    s.shops.add(ap.shop_id as string);
    stats.set(ap.customer_id as string, s);
  }
  const statFor = (customerId: string | undefined) => (customerId && stats.get(customerId)) || null;

  return (
    <div>
      <UsersSectionHeader active="client" accounts={accounts} subtitle={`${clients.length} client account${clients.length !== 1 ? "s" : ""} · sign up on a shop's booking page`} />
      {clients.length === 0 ? (
        <div style={{ padding: "48px 0", textAlign: "center", color: "var(--aw25)", fontSize: 14 }}>No client accounts yet.</div>
      ) : (
        <AccountsTable accounts={clients} columns={[
          { header: "Phone", nowrap: true, cell: a => a.customer?.phone ?? "-" },
          { header: "Bookings", nowrap: true, cell: a => statFor(a.customer?.id)?.bookings ?? 0 },
          { header: "Shops", cell: a => {
            const s = statFor(a.customer?.id);
            return s ? [...s.shops].map(id => shopNames.get(id) ?? "Unknown shop").join(", ") : "-";
          } },
          { header: "Last booking", nowrap: true, cell: a => fmtDate(statFor(a.customer?.id)?.last) },
          { header: "Spent", nowrap: true, cell: a => formatCAD(statFor(a.customer?.id)?.spent ?? 0) },
          { header: "Joined", nowrap: true, cell: a => fmtDate(a.user.created_at) },
        ]} />
      )}
    </div>
  );
}
