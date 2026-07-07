import { createClient } from "@/lib/supabase/server";

export async function requireShop() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) throw new Error("Not authenticated");

  const { data: shop } = await supabase
    .from("shops")
    .select("id")
    .eq("owner_id", userData.user.id)
    .maybeSingle();

  if (!shop) throw new Error("No shop set up for this account yet");
  return { supabase, shopId: shop.id as string };
}

export async function getCurrentShopId(): Promise<string | null> {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return null;

  const { data: shop } = await supabase
    .from("shops")
    .select("id")
    .eq("owner_id", userData.user.id)
    .maybeSingle();

  return (shop?.id as string) ?? null;
}
