import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: Request) {
  const signature = req.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!signature || !secret) {
    return NextResponse.json({ error: "Webhook not configured" }, { status: 400 });
  }

  const body = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe().webhooks.constructEvent(body, signature, secret);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const admin = createAdminClient();

  if (event.type === "account.updated") {
    const account = event.data.object as Stripe.Account;
    await admin
      .from("shops")
      .update({ stripe_connected: Boolean(account.charges_enabled) })
      .eq("stripe_account_id", account.id);
  }

  if (event.type === "payment_intent.succeeded") {
    const pi = event.data.object as Stripe.PaymentIntent;
    const appointmentId = pi.metadata?.appointment_id;
    if (appointmentId) {
      await admin
        .from("appointments")
        .update({
          paid_amount: pi.amount_received / 100,
          payment_method: "card",
          status: "confirmed",
          updated_at: new Date().toISOString(),
        })
        .eq("id", appointmentId);
    }
  }

  return NextResponse.json({ received: true });
}
