import { cache } from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { computeAccessStatus, type AccessStatus } from "@/lib/dashboard/accessStatus";

export type ShopRole = "owner" | "staff";
export type ShopContext = {
  shopId: string;
  role: ShopRole;
  staffId: string | null;
  staffName: string | null;
  accessStatus: AccessStatus;
  trialEndsAt: Date;
  graceEndsAt: Date;
};

// `auth.getUser()` is a real network round trip to Supabase's Auth server,
// not a local cookie read — the dashboard layout checks it once for the
// redirect guard, then getShopContext() below checked it again, on every
// single page. Sharing one cached call here dedupes that across a request.
export const getAuthUser = cache(async (): Promise<User | null> => {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  return data.user;
});

// Every dashboard page (and most of the actions it calls) asks "who is this
// user's shop" at least once. Without memoizing, a single page render was
// re-deriving it 8-9 times over (layout, page, and each parallel data fetch
// independently calling getCurrentShopId()/requireShop()), which is what
// made mobile nav taps feel sluggish instead of instant. `cache()` makes
// every call within one request share the same in-flight/resolved promise.
export const getShopContext = cache(async (): Promise<ShopContext | null> => {
  const supabase = await createClient();
  const user = await getAuthUser();
  if (!user) return null;

  const { data: shop } = await supabase
    .from("shops")
    .select("id, created_at, subscription_status")
    .eq("owner_id", user.id)
    .maybeSingle();

  if (shop) {
    const { status, trialEndsAt, graceEndsAt } = computeAccessStatus(shop as { created_at: string; subscription_status: string | null });
    return { shopId: shop.id as string, role: "owner", staffId: null, staffName: null, accessStatus: status, trialEndsAt, graceEndsAt };
  }

  const { data: staff } = await supabase
    .from("staff")
    .select("id, shop_id, full_name, shops(created_at, subscription_status)")
    .eq("user_id", user.id)
    .maybeSingle();

  if (staff) {
    const staffShop = staff.shops as unknown as { created_at: string; subscription_status: string | null } | null;
    const { status, trialEndsAt, graceEndsAt } = staffShop
      ? computeAccessStatus(staffShop)
      : { status: "inactive" as const, trialEndsAt: new Date(0), graceEndsAt: new Date(0) };
    return { shopId: staff.shop_id as string, role: "staff", staffId: staff.id as string, staffName: staff.full_name as string, accessStatus: status, trialEndsAt, graceEndsAt };
  }

  return null;
});

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
