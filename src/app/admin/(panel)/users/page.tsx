import { createAdminClient } from "@/lib/supabase/admin";
import { loadAccounts, needsShopSetup } from "@/lib/admin/accounts";
import { sumRevenueByShop } from "@/lib/admin/shopRevenue";
import { computeAccessStatus } from "@/lib/dashboard/accessStatus";
import { RestartAllTrialsButton } from "./RestartAllTrialsButton";
import { SetupRemindersButton } from "./SetupRemindersButton";
import { UsersSectionHeader } from "./UsersSectionHeader";
import { UsersTable } from "./UsersTable";

// Owners: everyone who signed up to run a shop, including those who never
// got as far as creating one. Clients and team members have their own pages.
export default async function AdminOwnersPage() {
  const admin = createAdminClient();
  const [accounts, apptsRes] = await Promise.all([
    loadAccounts(),
    admin.from("appointments").select("shop_id, price").eq("status", "completed"),
  ]);
  const revenueByShop = sumRevenueByShop((apptsRes.data ?? []) as { shop_id: string; price: number }[]);

  const owners = accounts.filter(a => a.kind === "owner");
  const rows = owners.map(a => {
    const shop = a.shop;
    const access = shop?.trial_started_at
      ? computeAccessStatus({ trial_started_at: shop.trial_started_at, subscription_status: shop.subscription_status, trial_override: shop.trial_override, trial_paused_at: shop.trial_paused_at })
      : null;
    return {
      id: a.user.id,
      email: a.user.email ?? "-",
      name: a.name,
      shopName: shop?.name ?? null,
      plan: shop?.plan ?? null,
      revenue: shop ? revenueByShop[shop.id] ?? 0 : null,
      createdAt: a.user.created_at,
      isBanned: a.isBanned,
      accessStatus: access?.status ?? null,
      trialOverride: shop?.trial_override ?? false,
      trialPaused: !!shop?.trial_paused_at,
      // No shop yet: Unlimited is stored on the account and applied once they create one.
      unlimited: shop ? !!shop.trial_override && shop.plan === "enterprise" : !!a.user.app_metadata?.unlimited,
      noShop: !shop,
      isRootAdmin: a.isRootAdmin,
      isAdmin: a.isAdmin,
      emailConfirmed: a.emailConfirmed,
      needsSetup: needsShopSetup(a),
      setupReminderSentAt: a.setupReminderSentAt,
    };
  });
  const withoutShop = owners.filter(a => !a.shop).length;

  return (
    <div>
      <UsersSectionHeader
        active="owner"
        accounts={accounts}
        subtitle={`${owners.length} shop owner${owners.length !== 1 ? "s" : ""}${withoutShop ? ` · ${withoutShop} haven't set up a shop yet` : ""}`}
        actions={<><SetupRemindersButton eligible={owners.filter(needsShopSetup).length} /><RestartAllTrialsButton /></>}
      />
      {rows.length === 0 ? (
        <div style={{ padding: "48px 0", textAlign: "center", color: "var(--aw25)", fontSize: 14 }}>No owners yet.</div>
      ) : (
        <UsersTable rows={rows} />
      )}
    </div>
  );
}
