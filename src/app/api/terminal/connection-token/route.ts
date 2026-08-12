import { NextResponse } from "next/server";
import { getShopContext } from "@/lib/dashboard/shop";
import { createClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe";

// Called by the native iOS app (via the Capacitor Terminal plugin) each time
// the Stripe Terminal SDK needs to connect to a reader. Scoped to the
// logged-in shop's own connected account so a card tap always settles into
// that shop's Stripe balance, same as the existing Connect checkout flow.
export async function POST() {
  const ctx = await getShopContext();
  if (!ctx) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = await createClient();
  const { data: shop } = await supabase
    .from("shops")
    .select("stripe_account_id")
    .eq("id", ctx.shopId)
    .maybeSingle();

  const stripeAccountId = shop?.stripe_account_id as string | undefined;
  if (!stripeAccountId) {
    return NextResponse.json({ error: "This shop hasn't connected Stripe yet" }, { status: 400 });
  }

  const connectionToken = await stripe().terminal.connectionTokens.create(
    {},
    { stripeAccount: stripeAccountId },
  );

  return NextResponse.json({ secret: connectionToken.secret });
}
