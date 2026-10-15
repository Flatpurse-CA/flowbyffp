import type { User } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/admin";
import { ROOT_ADMIN_EMAIL } from "@/lib/admin-guard";

// Every login on the platform is one of three kinds, each with its own auth
// flow: shop owners (owner signup, creates a profiles row then a shop),
// clients (customer signup, a customers row, can book at any shop) and team
// members (invited by a shop owner, a staff row with user_id). The admin
// Users section splits on this instead of listing every auth user together.
export type AccountKind = "owner" | "client" | "team";

export type ShopRecord = {
  id: string; owner_id: string; name: string; handle: string | null; business_type: string | null;
  city: string | null; province: string | null; plan: string; subscription_status: string | null;
  trial_started_at: string | null; trial_override: boolean; trial_paused_at: string | null; created_at: string;
};
export type CustomerRecord = { id: string; user_id: string; full_name: string; phone: string | null; email: string; created_at: string };
export type StaffRecord = { id: string; user_id: string | null; shop_id: string; full_name: string; role: string | null; active: boolean; invite_status: string | null; email: string | null; created_at: string };

export type Account = {
  user: User;
  kind: AccountKind;
  name: string | null;
  isAdmin: boolean;
  isRootAdmin: boolean;
  emailConfirmed: boolean;
  isBanned: boolean;
  shop: ShopRecord | null;          // owners
  customer: CustomerRecord | null;  // clients
  staff: StaffRecord | null;        // team
  staffShop: ShopRecord | null;     // team: the shop they work at
  setupReminderSentAt: string | null;
};

export async function loadAccounts(): Promise<Account[]> {
  const admin = createAdminClient();
  const [usersRes, profilesRes, shopsRes, customersRes, staffRes, adminsRes] = await Promise.all([
    admin.auth.admin.listUsers({ perPage: 1000 }),
    admin.from("profiles").select("id, first_name, last_name"),
    admin.from("shops").select("id, owner_id, name, handle, business_type, city, province, plan, subscription_status, trial_started_at, trial_override, trial_paused_at, created_at"),
    admin.from("customers").select("id, user_id, full_name, phone, email, created_at"),
    admin.from("staff").select("id, user_id, shop_id, full_name, role, active, invite_status, email, created_at").not("user_id", "is", null),
    admin.from("admin_users").select("email"),
  ]);

  const profiles = new Map((profilesRes.data ?? []).map(p => [p.id as string, p]));
  const shopsByOwner = new Map(((shopsRes.data ?? []) as ShopRecord[]).map(s => [s.owner_id, s]));
  const shopsById = new Map(((shopsRes.data ?? []) as ShopRecord[]).map(s => [s.id, s]));
  const customers = new Map(((customersRes.data ?? []) as CustomerRecord[]).map(c => [c.user_id, c]));
  const staff = new Map(((staffRes.data ?? []) as StaffRecord[]).map(s => [s.user_id as string, s]));
  const adminEmails = new Set((adminsRes.data ?? []).map(a => (a.email as string).toLowerCase()));
  const now = Date.now();

  return (usersRes.data?.users ?? [])
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .map(user => {
      const shop = shopsByOwner.get(user.id) ?? null;
      const customer = customers.get(user.id) ?? null;
      const staffRow = staff.get(user.id) ?? null;
      const profile = profiles.get(user.id);
      // A shop or an owner profile wins (an owner can also book elsewhere as
      // a client); then team membership; then a client account. Anything
      // else is an owner signup that never got as far as a profile.
      const kind: AccountKind = shop || profile ? "owner" : staffRow ? "team" : customer ? "client" : "owner";
      const name = profile
        ? `${profile.first_name} ${profile.last_name}`.trim()
        : staffRow?.full_name ?? customer?.full_name ?? (user.user_metadata?.full_name as string | undefined) ?? null;
      const email = (user.email ?? "").toLowerCase();
      return {
        user,
        kind,
        name: name || null,
        isRootAdmin: user.email === ROOT_ADMIN_EMAIL,
        isAdmin: user.email === ROOT_ADMIN_EMAIL || adminEmails.has(email),
        emailConfirmed: !!user.email_confirmed_at,
        isBanned: !!(user.banned_until && new Date(user.banned_until).getTime() > now),
        shop,
        customer,
        staff: staffRow,
        staffShop: staffRow ? shopsById.get(staffRow.shop_id) ?? null : null,
        setupReminderSentAt: (user.app_metadata?.setup_reminder_sent_at as string | undefined) ?? null,
      };
    });
}

// Owners who signed up and verified but never created a shop: the audience
// for the "finish setting up your shop" reminder.
export function needsShopSetup(a: Account): boolean {
  return a.kind === "owner" && !a.shop && a.emailConfirmed && !a.isBanned && !!a.user.email;
}

export function initialsOf(name: string | null, email: string): string {
  const src = name?.trim() || email;
  const parts = src.split(/[\s@._-]+/).filter(Boolean);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || "?";
}
