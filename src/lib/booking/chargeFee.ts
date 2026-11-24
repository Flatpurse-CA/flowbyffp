import type { SupabaseClient } from "@supabase/supabase-js";
import { stripe } from "@/lib/stripe";
import { applicationFeeParam } from "@/lib/billing/platformFee";

/** Charge a policy fee to the client's saved card on the shop's connected account. */
export async function chargeSavedCard(admin: SupabaseClient, input: {
  appointmentId: string; customerId: string; stripeAccountId: string; amount: number; kind: "late_cancel" | "no_show"; shopId?: string;
}): Promise<{ error?: string; intentId?: string }> {
  const { data: c } = await admin.from("customers").select("stripe_customer_id").eq("id", input.customerId).maybeSingle();
  const cus = c?.stripe_customer_id as string | undefined;
  if (!cus) return { error: "No saved card on file" };
  const pms = await stripe().paymentMethods.list({ customer: cus, type: "card", limit: 1 });
  if (!pms.data[0]) return { error: "No saved card on file" };
  try {
    const cloned = await stripe().paymentMethods.create({ customer: cus, payment_method: pms.data[0].id }, { stripeAccount: input.stripeAccountId });
    const intent = await stripe().paymentIntents.create({
      amount: Math.round(input.amount * 100), currency: "cad", payment_method: cloned.id, payment_method_types: ["card"],
      ...(input.shopId ? await applicationFeeParam(input.shopId, Math.round(input.amount * 100)) : {}),
      confirm: true, off_session: true, metadata: { appointment_id: input.appointmentId, fee_kind: input.kind },
    }, { stripeAccount: input.stripeAccountId, idempotencyKey: `fee:${input.kind}:${input.appointmentId}` });
    if (intent.status !== "succeeded" && intent.status !== "processing") return { error: "The card was declined" };
    await admin.from("appointments").update({ fee_kind: input.kind, fee_amount: input.amount, fee_charged_at: new Date().toISOString(), fee_payment_intent: intent.id }).eq("id", input.appointmentId);
    return { intentId: intent.id };
  } catch (e) {
    return { error: (e as { message?: string }).message ?? "Charge failed" };
  }
}
