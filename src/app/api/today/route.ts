import { NextResponse } from "next/server";
import { getShopContext } from "@/lib/dashboard/shop";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

/** FL-077: today's schedule for the offline copy (staff see only their own). */
export async function GET() {
  const ctx = await getShopContext();
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const date = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Edmonton" }).format(new Date());
  const start = new Date(`${date}T00:00:00-07:00`).getTime() - 3_600_000;
  let q = createAdminClient().from("appointments")
    .select("starts_at, client_name, client_phone, service_name, stylist_name, status")
    .eq("shop_id", ctx.shopId).neq("status", "cancelled")
    .gte("starts_at", new Date(start).toISOString()).lte("starts_at", new Date(start + 26 * 3_600_000).toISOString())
    .order("starts_at");
  if (ctx.role !== "owner" && ctx.staffId) q = q.eq("staff_id", ctx.staffId);
  const { data } = await q;
  return NextResponse.json({
    items: (data ?? []).map((a) => ({ startsAt: a.starts_at, client: a.client_name, phone: a.client_phone, service: a.service_name, staff: a.stylist_name, status: a.status })),
  }, { headers: { "Cache-Control": "no-store" } });
}
