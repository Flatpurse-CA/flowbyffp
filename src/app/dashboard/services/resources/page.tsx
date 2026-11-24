import { redirect } from "next/navigation";
import { getShopContext } from "@/lib/dashboard/shop";
import { createAdminClient } from "@/lib/supabase/admin";
import { ResourcesClient } from "./ResourcesClient";

export const dynamic = "force-dynamic";

export default async function ResourcesPage() {
  const ctx = await getShopContext();
  if (!ctx || ctx.role !== "owner") redirect("/dashboard");
  const admin = createAdminClient();
  const [{ data: resources }, { data: services }, { data: links }] = await Promise.all([
    admin.from("resources").select("id, name, kind, capacity").eq("shop_id", ctx.shopId).order("name"),
    admin.from("services").select("id, name").eq("shop_id", ctx.shopId).order("name"),
    admin.from("service_resources").select("service_id, resource_id, resources!inner(shop_id)").eq("resources.shop_id", ctx.shopId),
  ]);
  return (
    <ResourcesClient
      resources={(resources ?? []) as { id: string; name: string; kind: "room" | "equipment"; capacity: number }[]}
      services={(services ?? []) as { id: string; name: string }[]}
      links={((links ?? []) as { service_id: string; resource_id: string }[]).map((l) => ({ serviceId: l.service_id, resourceId: l.resource_id }))}
    />
  );
}
