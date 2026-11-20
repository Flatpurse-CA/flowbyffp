"use server";

import { createHash, randomInt } from "node:crypto";
import { revalidatePath } from "next/cache";
import { stripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import { getShopContext } from "@/lib/dashboard/shop";
import { sendBillingEmail } from "@/lib/resend";
import { fmtDate, ownerContact } from "@/lib/billing/notices";

const DAY = 24 * 60 * 60 * 1000;
const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://flow.flatpurse.com";
const hash = (code: string) => createHash("sha256").update(code).digest("hex");

async function owner() {
  const ctx = await getShopContext();
  if (!ctx || ctx.role !== "owner") return null;
  const admin = createAdminClient();
  const { data: shop } = await admin.from("shops")
    .select("id, name, owner_id, subscription_id, deletion_code_hash, deletion_code_expires_at, deletion_scheduled_at")
    .eq("id", ctx.shopId).maybeSingle();
  return shop ? { admin, shop } : null;
}

/** Step 1: email a 6-digit code to the owner. */
export async function sendDeletionCode(): Promise<{ error?: string }> {
  const o = await owner();
  if (!o) return { error: "Only the owner can delete the account" };
  const code = String(randomInt(100000, 1000000));
  await o.admin.from("shops").update({ deletion_code_hash: hash(code), deletion_code_expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString() }).eq("id", o.shop.id);
  const { email, firstName } = await ownerContact(o.admin, o.shop.owner_id);
  if (!email) return { error: "No email on file" };
  await sendBillingEmail(email, {
    subject: "Your Flow account deletion code",
    heading: "Confirm account deletion",
    body: `Hi ${firstName},\n\nYour code to delete ${o.shop.name}'s Flow account is ${code}. It expires in 15 minutes.\n\nIf you didn't ask for this, ignore this email and nothing will happen.`,
  });
  return {};
}

/** Step 2: business name + code. Cancels billing now, deletes in 7 days. */
export async function scheduleDeletion(input: { businessName: string; code: string }): Promise<{ date?: string; error?: string }> {
  const o = await owner();
  if (!o) return { error: "Only the owner can delete the account" };
  const { admin, shop } = o;
  if (input.businessName.trim().toLowerCase() !== String(shop.name).trim().toLowerCase()) return { error: "The business name doesn't match" };
  if (!shop.deletion_code_hash || !shop.deletion_code_expires_at || new Date(shop.deletion_code_expires_at).getTime() < Date.now() || hash(input.code.trim()) !== shop.deletion_code_hash) {
    return { error: "That code is wrong or has expired" };
  }

  // Stop billing immediately. Founders shops store a schedule id.
  if (shop.subscription_id) {
    try {
      if (String(shop.subscription_id).startsWith("sub_sched_")) await stripe().subscriptionSchedules.cancel(shop.subscription_id);
      else await stripe().subscriptions.cancel(shop.subscription_id);
    } catch (e) {
      console.error("deletion: cancel subscription failed", e);
    }
  }

  const at = new Date(Date.now() + 7 * DAY);
  // paused_until switches the booking page and AutoPilot off during the grace period.
  await admin.from("shops").update({
    deletion_scheduled_at: at.toISOString(), paused_until: at.toISOString(),
    deletion_code_hash: null, deletion_code_expires_at: null,
  }).eq("id", shop.id);

  const { email, firstName } = await ownerContact(admin, shop.owner_id);
  if (email) {
    await sendBillingEmail(email, {
      subject: `Your Flow account will be deleted on ${fmtDate(at)}`,
      heading: `Deletion scheduled for ${fmtDate(at)}`,
      body: `Hi ${firstName},\n\nYour booking page and AutoPilot are now off, and your subscription is cancelled. On ${fmtDate(at)} we'll permanently delete ${shop.name}'s clients, appointments, staff, messages, AutoPilot and AI logs, and settings.\n\nDownload a copy first: ${SITE}/api/account/export\n\nChanged your mind? Cancel the deletion any time before then.\n\nGeorge`,
      ctaLabel: "Cancel deletion",
      ctaUrl: `${SITE}/dashboard/settings/delete`,
    });
  }
  revalidatePath("/dashboard", "layout");
  return { date: fmtDate(at) };
}

export async function cancelDeletion(): Promise<{ error?: string }> {
  const o = await owner();
  if (!o) return { error: "Only the owner can do this" };
  await o.admin.from("shops").update({ deletion_scheduled_at: null, paused_until: null }).eq("id", o.shop.id);
  revalidatePath("/dashboard", "layout");
  return {};
}
