import { redirect } from "next/navigation";
import { getShopContext } from "@/lib/dashboard/shop";
import { createAdminClient } from "@/lib/supabase/admin";
import { RouteClient } from "./RouteClient";

export const dynamic = "force-dynamic";

/** FL-059: today's route for mobile visits. */
export default async function RoutePage() {
  const ctx = await getShopContext();
  if (!ctx) redirect("/dashboard");
  const date = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Edmonton" }).format(new Date());
  const start = new Date(`${date}T00:00:00-07:00`).getTime() - 3_600_000;
  let q = createAdminClient().from("appointments")
    .select("id, starts_at, client_name, service_name, location_address, eta_sent_at")
    .eq("shop_id", ctx.shopId).in("status", ["confirmed", "deposit", "pending"]).not("location_address", "is", null)
    .gte("starts_at", new Date(start).toISOString()).lte("starts_at", new Date(start + 26 * 3_600_000).toISOString()).order("starts_at");
  if (ctx.role !== "owner" && ctx.staffId) q = q.eq("staff_id", ctx.staffId);
  const { data } = await q;
  return <RouteClient stops={(data ?? []).map((a) => ({ id: a.id as string, startsAt: a.starts_at as string, client: a.client_name as string, service: a.service_name as string, address: a.location_address as string, etaSent: Boolean(a.eta_sent_at) }))} />;
}
