import { NextResponse } from "next/server";
import { getShopContext } from "@/lib/dashboard/shop";
import { createClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe";

// Creates a card_present PaymentIntent directly on the shop's own connected
// account (not a platform destination charge — the Tap to Pay reader is
// registered to the connected account's Terminal Location, so the charge
// has to live there). Manual capture so the native app can inspect the
// result before the funds move, same two-step pattern as the online
// checkout flow in src/app/book/[handle]/actions.ts.
export async function POST(req: Request) {
  const ctx = await getShopContext();
  if (!ctx) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const amount = typeof body?.amount === "number" ? body.amount : null;
  const appointmentId = typeof body?.appointmentId === "string" ? body.appointmentId : undefined;
  if (!amount || amount <= 0) {
    return NextResponse.json({ error: "amount (in dollars) is required" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: shop } = await supabase
    .from("shops")
    .select("stripe_account_id, country")
    .eq("id", ctx.shopId)
    .maybeSingle();

  const stripeAccountId = shop?.stripe_account_id as string | undefined;
  if (!stripeAccountId) {
    return NextResponse.json({ error: "This shop hasn't connected Stripe yet" }, { status: 400 });
  }

  const currency = (shop?.country as string | undefined)?.trim().toLowerCase() === "united states" ? "usd" : "cad";

  const paymentIntent = await stripe().paymentIntents.create(
    {
      amount: Math.round(amount * 100),
      currency,
      payment_method_types: ["card_present"],
      capture_method: "manual",
      metadata: appointmentId ? { appointment_id: appointmentId } : undefined,
    },
    { stripeAccount: stripeAccountId },
  );

  return NextResponse.json({ clientSecret: paymentIntent.client_secret, paymentIntentId: paymentIntent.id });
}
