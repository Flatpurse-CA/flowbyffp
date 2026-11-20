import { redirect } from "next/navigation";
import { getShopContext } from "@/lib/dashboard/shop";
import { createAdminClient } from "@/lib/supabase/admin";
import { SendTimesClient } from "./SendTimesClient";

export const dynamic = "force-dynamic";

export default async function SendTimesPage({ searchParams }: { searchParams: Promise<{ client?: string }> }) {
  const ctx = await getShopContext();
  if (!ctx) redirect("/dashboard");
  const admin = createAdminClient();
  const [{ data: clients }, { data: services }, { data: staff }, { data: shop }] = await Promise.all([
    admin.from("clients").select("id, full_name, phone, email").eq("shop_id", ctx.shopId).order("full_name").limit(2000),
    admin.from("services").select("id, name").eq("shop_id", ctx.shopId).eq("active", true).order("name"),
    admin.from("staff").select("id, full_name").eq("shop_id", ctx.shopId).eq("active", true).order("full_name"),
    admin.from("shops").select("name").eq("id", ctx.shopId).maybeSingle(),
  ]);
  const { client } = await searchParams;
  return (
    <SendTimesClient
      clients={(clients ?? []).map((c) => ({ id: c.id as string, name: c.full_name as string, phone: (c.phone as string | null) ?? null, email: (c.email as string | null) ?? null }))}
      services={(services ?? []) as { id: string; name: string }[]}
      staff={(staff ?? []) as { id: string; full_name: string }[]}
      shopName={(shop?.name as string) ?? ""}
      defaultStaffId={ctx.staffId}
      preselectClientId={client ?? null}
    />
  );
}
