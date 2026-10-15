import { createAdminClient } from "@/lib/supabase/admin";
import { ROOT_ADMIN_EMAIL } from "@/lib/admin-guard";
import { RestartAllTrialsButton } from "./RestartAllTrialsButton";
import { UsersTable } from "./UsersTable";
import { sumRevenueByShop } from "@/lib/admin/shopRevenue";
import { computeAccessStatus } from "@/lib/dashboard/accessStatus";

export default async function AdminUsersPage() {
  const admin = createAdminClient();

  const [usersRes, profilesRes, shopsRes, apptsRes, adminsRes, staffRes] = await Promise.all([
    admin.auth.admin.listUsers({ perPage: 1000 }),
    admin.from("profiles").select("id, first_name, last_name"),
    admin.from("shops").select("id, owner_id, name, plan, trial_started_at, subscription_status, trial_override, trial_paused_at"),
    admin.from("appointments").select("shop_id, price").eq("status", "completed"),
    admin.from("admin_users").select("email"),
    admin.from("staff").select("user_id").not("user_id", "is", null),
  ]);
  const staffUserIds = new Set((staffRes.data ?? []).map(s => s.user_id as string));
  const adminEmails = new Set((adminsRes.data ?? []).map(a => (a.email as string).toLowerCase()));

  const users    = usersRes.data?.users ?? [];
  const profiles = Object.fromEntries((profilesRes.data ?? []).map(p => [p.id, p]));
  const shops    = Object.fromEntries((shopsRes.data ?? []).map(s => [s.owner_id, s]));
  const revenueByShop = sumRevenueByShop((apptsRes.data ?? []) as { shop_id: string; price: number }[]);

  const rows = users
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .map(u => {
      const shop = shops[u.id];
      const access = shop?.trial_started_at
        ? computeAccessStatus(shop as { trial_started_at: string; subscription_status: string | null; trial_override: boolean; trial_paused_at: string | null })
        : null;
      return {
        id:        u.id,
        email:     u.email ?? "-",
        name:      profiles[u.id] ? `${profiles[u.id].first_name} ${profiles[u.id].last_name}` : null,
        shopName:  shop?.name ?? null,
        plan:      shop?.plan ?? null,
        revenue:   shop ? revenueByShop[shop.id] ?? 0 : null,
        createdAt: u.created_at,
        isBanned:  !!(u.banned_until && new Date(u.banned_until) > new Date()),
        accessStatus: access?.status ?? null,
        trialOverride: shop?.trial_override ?? false,
        trialPaused: !!shop?.trial_paused_at,
        unlimited: shop ? !!shop.trial_override && shop.plan === "enterprise" : !!u.app_metadata?.unlimited,
        // No shop yet (signup abandoned before the shop step) — Unlimited is
        // stored on the account and applied once they create one. Staff log
        // in under their employer's shop, so Unlimited doesn't apply to them.
        noShop: !shop && !staffUserIds.has(u.id),
        isRootAdmin: u.email === ROOT_ADMIN_EMAIL,
        isAdmin: u.email === ROOT_ADMIN_EMAIL || adminEmails.has((u.email ?? "").toLowerCase()),
      };
    });

  return (
    <div>
      {/* Heading */}
      <div style={{ marginBottom: 24, display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
        <div>
          <h1 style={{ color: "var(--atext2)", fontSize: 22, fontWeight: 800, margin: "0 0 4px", letterSpacing: "-0.03em" }}>Users</h1>
          <p style={{ color: "var(--aw3)", fontSize: 13, margin: 0 }}>{rows.length} total account{rows.length !== 1 ? "s" : ""}</p>
        </div>
        <RestartAllTrialsButton />
      </div>

      {rows.length === 0 ? (
        <div style={{ padding: "48px 0", textAlign: "center", color: "var(--aw25)", fontSize: 14 }}>
          No users yet.
        </div>
      ) : (
        <UsersTable rows={rows} />
      )}
    </div>
  );
}
