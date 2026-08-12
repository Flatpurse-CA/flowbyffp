import { NextResponse } from "next/server";
import { getShopContext } from "@/lib/dashboard/shop";
import { createClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe";

// Called after the native app confirms a Tap to Pay PaymentIntent on-device.
// The actual `appointments` row update happens in the existing
// payment_intent.succeeded webhook handler (src/app/api/webhooks/stripe/route.ts),
// same as the online checkout flow — this route's only job is to trigger
// the capture on the shop's connected account.
export async function POST(req: Request) {
  const ctx = await getShopContext();
  if (!ctx) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const paymentIntentId = typeof body?.paymentIntentId === "string" ? body.paymentIntentId : null;
  if (!paymentIntentId) {
    return NextResponse.json({ error: "paymentIntentId is required" }, { status: 400 });
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

  try {
    const captured = await stripe().paymentIntents.capture(paymentIntentId, {}, { stripeAccount: stripeAccountId });
    return NextResponse.json({ status: captured.status });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Capture failed" }, { status: 500 });
  }
}
