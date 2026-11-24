import { createAdminClient } from "@/lib/supabase/admin";

/** FL-031: the owner's setup checklist on the dashboard home. Each item is done from real data. */
export type SetupItem = { key: string; title: string; sub: string; cta: string; href: string; done: boolean };

export async function getSetupChecklist(shopId: string, handle: string | null): Promise<SetupItem[]> {
  const admin = createAdminClient();
  const count = (table: string) =>
    admin.from(table).select("id", { count: "exact", head: true }).eq("shop_id", shopId).then((r) => r.count ?? 0);
  const [{ data: shop }, services, hours, staff, clients, appts] = await Promise.all([
    admin.from("shops").select("stripe_connected").eq("id", shopId).maybeSingle(),
    count("services"), count("business_hours"), count("staff"), count("clients"), count("appointments"),
  ]);
  return [
    { key: "services", title: "Add your services", sub: "Names, prices and durations clients can book.", cta: "Add services", href: "/dashboard/services", done: services > 0 },
    { key: "hours", title: "Set your opening hours", sub: "Clients can only book inside these hours.", cta: "Set hours", href: "/dashboard/settings", done: hours > 0 },
    { key: "payouts", title: "Connect payouts", sub: "Take card payments and get paid every Monday.", cta: "Connect", href: "/dashboard/settings", done: Boolean(shop?.stripe_connected) },
    { key: "team", title: "Add your team", sub: "Each staff member gets their own calendar column.", cta: "Add team", href: "/dashboard/team", done: staff > 0 },
    { key: "clients", title: "Bring in your clients", sub: "Import your list so AutoPilot can start rebooking them.", cta: "Import", href: "/dashboard/migrate", done: clients > 0 },
    { key: "booking", title: "Take your first booking", sub: "Share your booking link or add one yourself.", cta: handle ? "Copy link" : "Add booking", href: handle ? `/book/${handle}` : "/dashboard/appointments", done: appts > 0 },
  ];
}
