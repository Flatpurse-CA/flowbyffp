"use server";

import { logShopAction } from "@/lib/audit";
import { revalidatePath } from "next/cache";
import { getShopContext, getAuthUser } from "@/lib/dashboard/shop";
import { createAdminClient } from "@/lib/supabase/admin";
import { stripe } from "@/lib/stripe";
import { canRefund } from "@/lib/auth/permissions";

/** FL-038: owner (or staff granted can_refund) refunds a card payment with a required reason; tax reversed in proportion. */
export async function refundPayment(input: { appointmentId: string; amount: number; reason: string }): Promise<{ error?: string }> {
  const ctx = await getShopContext();
  if (!(await canRefund(ctx)) || !ctx) return { error: "Only the owner, or a team member they allow, can issue refunds" };
  const reason = input.reason.trim().slice(0, 300);
  if (reason.length < 3) return { error: "A reason is required" };
  const admin = createAdminClient();
  const { data: a } = await admin.from("appointments").select("id, paid_amount, refunded_amount, stripe_payment_intent, payment_method")
    .eq("id", input.appointmentId).eq("shop_id", ctx.shopId).maybeSingle();
  if (!a) return { error: "Payment not found" };
  const paid = Number(a.paid_amount ?? 0);
  const left = Math.round((paid - Number(a.refunded_amount ?? 0)) * 100) / 100;
  const amount = Math.round(input.amount * 100) / 100;
  if (!(amount > 0) || amount > left) return { error: `You can refund up to $${left.toFixed(2)}` };

  const { data: shop } = await admin.from("shops").select("stripe_account_id").eq("id", ctx.shopId).maybeSingle();
  let refundId: string | null = null;
  let taxShare = 0;
  if (a.stripe_payment_intent && shop?.stripe_account_id) {
    const opts = { stripeAccount: shop.stripe_account_id as string };
    const pi = await stripe().paymentIntents.retrieve(a.stripe_payment_intent as string, {}, opts);
    const tax = Number(pi.metadata?.tax_amount ?? 0);
    taxShare = paid > 0 ? Math.round((tax * amount / paid) * 100) / 100 : 0;
    try {
      const r = await stripe().refunds.create({ payment_intent: pi.id, amount: Math.round(amount * 100), metadata: { reason, tax_reversed: taxShare.toFixed(2) } }, opts);
      refundId = r.id;
    } catch (e) {
      return { error: (e as { message?: string }).message ?? "Refund failed" };
    }
  } else if (a.payment_method === "card") {
    return { error: "This card payment can't be matched in Stripe. Refund it from your Stripe dashboard." };
  }
  const user = await getAuthUser();
  await admin.from("refunds").insert({ shop_id: ctx.shopId, appointment_id: a.id, amount, tax_amount: taxShare, reason, refunded_by: user?.id ?? null, stripe_refund_id: refundId });
  await admin.from("appointments").update({ refunded_amount: Math.round((Number(a.refunded_amount ?? 0) + amount) * 100) / 100 }).eq("id", a.id);
  await logShopAction("refund", { amount: amount.toFixed(2), reason });
  revalidatePath("/dashboard/payments");
  return {};
}
