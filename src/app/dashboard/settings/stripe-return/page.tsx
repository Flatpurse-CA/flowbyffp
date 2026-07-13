import { redirect } from "next/navigation";
import { requireShop, getShopContext } from "@/lib/dashboard/shop";
import { stripe } from "@/lib/stripe";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export default async function StripeReturnPage() {
  const ctx = await getShopContext();
  if (!ctx || ctx.role !== "owner") redirect("/dashboard");

  const { supabase, shopId } = await requireShop();
  const { data: shop } = await supabase.from("shops").select("stripe_account_id").eq("id", shopId).maybeSingle();
  const accountId = shop?.stripe_account_id as string | null;

  if (accountId) {
    try {
      const account = await stripe().accounts.retrieve(accountId);
      await supabase.from("shops").update({ stripe_connected: Boolean(account.charges_enabled) }).eq("id", shopId);
    } catch {
      // Account may not exist yet if Stripe keys aren't configured — leave stripe_connected as-is.
    }
  }

  redirect("/dashboard/settings?tab=Payments");
}
