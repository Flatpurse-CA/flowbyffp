import { createClient } from "@/lib/supabase/server";

export type ShopRole = "owner" | "staff";
export type ShopContext = { shopId: string; role: ShopRole; staffId: string | null };

export async function getShopContext(): Promise<ShopContext | null> {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return null;

  const { data: shop } = await supabase
    .from("shops")
    .select("id")
    .eq("owner_id", userData.user.id)
    .maybeSingle();

  if (shop) return { shopId: shop.id as string, role: "owner", staffId: null };

  const { data: staff } = await supabase
    .from("staff")
    .select("id, shop_id")
    .eq("user_id", userData.user.id)
    .maybeSingle();

  if (staff) return { shopId: staff.shop_id as string, role: "staff", staffId: staff.id as string };

  return null;
}

export async function requireShop() {
  const supabase = await createClient();
  const ctx = await getShopContext();
  if (!ctx) throw new Error("No shop set up for this account yet");
  return { supabase, shopId: ctx.shopId };
}

export async function getCurrentShopId(): Promise<string | null> {
  const ctx = await getShopContext();
  return ctx?.shopId ?? null;
}
