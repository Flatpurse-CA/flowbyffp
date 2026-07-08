import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getShopContext } from "@/lib/dashboard/shop";
import { SettingsClient } from "./SettingsClient";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export default async function SettingsPage() {
  const ctx = await getShopContext();
  if (ctx && ctx.role !== "owner") redirect("/dashboard");

  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();

  const { data: shop } = userData.user
    ? await supabase
        .from("shops")
        .select("family_hours_enabled, family_hours_start, family_hours_end")
        .eq("owner_id", userData.user.id)
        .maybeSingle()
    : { data: null };

  const initialFamilyHours = {
    enabled: shop?.family_hours_enabled ?? false,
    start: (shop?.family_hours_start as string | undefined)?.slice(0, 5) ?? "18:00",
    end: (shop?.family_hours_end as string | undefined)?.slice(0, 5) ?? "20:00",
  };

  return <SettingsClient initialFamilyHours={initialFamilyHours} />;
}
