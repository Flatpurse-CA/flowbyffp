import type { SupabaseClient } from "@supabase/supabase-js";
import { stripe } from "@/lib/stripe";

// Lazily creates (and caches on the customers row) the Stripe Customer object
// backing an end-user's saved payment methods — separate from shops.stripe_customer_id,
// which is the shop owner's platform-billing customer.
export async function ensureStripeCustomerId(
  admin: SupabaseClient,
  customerId: string,
  email: string,
  name: string,
): Promise<string> {
  const { data } = await admin.from("customers").select("stripe_customer_id").eq("id", customerId).maybeSingle();
  const existing = data?.stripe_customer_id as string | null | undefined;
  if (existing) return existing;

  const sc = await stripe().customers.create({ email, name, metadata: { customer_id: customerId } });
  await admin.from("customers").update({ stripe_customer_id: sc.id }).eq("id", customerId);
  return sc.id;
}
