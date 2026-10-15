import { createAdminClient } from "@/lib/supabase/admin";
import { loadAccounts } from "@/lib/admin/accounts";
import { UsersSectionHeader } from "../UsersSectionHeader";
import { AccountsTable, fmtDate, pill } from "../AccountsTable";

// Team: staff a shop owner invited, who log in with their own account and
// only see that shop. Staff added without an email have no login, so they
// don't appear here (they're on the shop's own Team page).
export default async function AdminTeamPage() {
  const admin = createAdminClient();
  const [accounts, apptsRes] = await Promise.all([
    loadAccounts(),
    admin.from("appointments").select("staff_id").not("staff_id", "is", null),
  ]);
  const team = accounts.filter(a => a.kind === "team");
  const assigned = new Map<string, number>();
  for (const ap of apptsRes.data ?? []) assigned.set(ap.staff_id as string, (assigned.get(ap.staff_id as string) ?? 0) + 1);

  return (
    <div>
      <UsersSectionHeader active="team" accounts={accounts} subtitle={`${team.length} team member${team.length !== 1 ? "s" : ""} with their own login`} />
      {team.length === 0 ? (
        <div style={{ padding: "48px 0", textAlign: "center", color: "var(--aw25)", fontSize: 14 }}>No team members with logins yet.</div>
      ) : (
        <AccountsTable accounts={team} columns={[
          { header: "Shop", nowrap: true, cell: a => a.staffShop?.name ?? "-" },
          { header: "Role", cell: a => a.staff?.role ?? "-" },
          { header: "Invite", nowrap: true, cell: a => a.staff?.invite_status === "active" ? pill("Active", "green") : a.staff?.invite_status === "pending" ? pill("Pending", "amber") : pill(a.staff?.invite_status ?? "Unknown", "slate") },
          { header: "Status", nowrap: true, cell: a => a.staff?.active === false ? pill("Archived", "slate") : pill("Working", "blue") },
          { header: "Appointments", nowrap: true, cell: a => (a.staff && assigned.get(a.staff.id)) ?? 0 },
          { header: "Joined", nowrap: true, cell: a => fmtDate(a.user.created_at) },
        ]} />
      )}
    </div>
  );
}
