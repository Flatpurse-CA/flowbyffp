import { redirect } from "next/navigation";
import { getShopContext } from "@/lib/dashboard/shop";
import { createAdminClient } from "@/lib/supabase/admin";
import { DeleteAccount } from "./DeleteAccount";

export const dynamic = "force-dynamic";

export default async function DeletePage() {
  const ctx = await getShopContext();
  if (!ctx || ctx.role !== "owner") redirect("/dashboard");
  const { data } = await createAdminClient().from("shops").select("name, deletion_scheduled_at").eq("id", ctx.shopId).maybeSingle();
  return <DeleteAccount businessName={data?.name ?? ""} scheduledAt={data?.deletion_scheduled_at ?? null} />;
}
