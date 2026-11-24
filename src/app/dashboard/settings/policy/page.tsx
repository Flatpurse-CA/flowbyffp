import { redirect } from "next/navigation";
import { getShopContext } from "@/lib/dashboard/shop";
import { createAdminClient } from "@/lib/supabase/admin";
import { POLICY_COLUMNS, type Policy } from "@/lib/booking/policy";
import { PolicyForm } from "./PolicyForm";

export const dynamic = "force-dynamic";

export default async function PolicyPage() {
  const ctx = await getShopContext();
  if (!ctx || ctx.role !== "owner") redirect("/dashboard");
  const { data } = await createAdminClient().from("shops").select(POLICY_COLUMNS).eq("id", ctx.shopId).maybeSingle();
  return <PolicyForm initial={data as unknown as Policy} />;
}
