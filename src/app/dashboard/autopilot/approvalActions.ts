"use server";

import { sendShopSms } from "@/lib/sms/allowance";
import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { getShopContext } from "@/lib/dashboard/shop";
import { twilioConfigured } from "@/lib/twilio";
import { sendAutopilotEmail } from "@/lib/resend";
import { SITE_URL } from "@/lib/seo/facts";
import { smsText } from "@/lib/autopilot/engine";

const COMMERCIAL = new Set(["filler", "reminders", "winback", "birthday"]);
const DAY = 24 * 60 * 60 * 1000;

export type PendingMessage = { id: string; flow_key: string; client_name: string | null; message_body: string | null; channel: string | null; created_at: string };
export type ApprovalState = { askFirst: boolean; until: string; pending: PendingMessage[] };

async function owner() {
  const ctx = await getShopContext();
  if (!ctx || ctx.role !== "owner") return null;
  return ctx;
}

export async function getApprovalState(): Promise<ApprovalState | null> {
  const ctx = await owner();
  if (!ctx) return null;
  const admin = createAdminClient();
  const { data: shop } = await admin.from("shops").select("created_at, autopilot_approval_until").eq("id", ctx.shopId).maybeSingle();
  if (!shop) return null;
  const until = (shop.autopilot_approval_until as string | null) ?? new Date(new Date(shop.created_at as string).getTime() + 14 * DAY).toISOString();
  const { data } = await admin.from("autopilot_events")
    .select("id, flow_key, client_name, message_body, channel, created_at")
    .eq("shop_id", ctx.shopId).eq("outcome", "pending")
    .gte("created_at", new Date(Date.now() - 3 * DAY).toISOString())
    .order("created_at", { ascending: false }).limit(50);
  return { askFirst: Date.now() < new Date(until).getTime(), until, pending: (data ?? []) as PendingMessage[] };
}

/** Approve: send the queued message now. Skip: drop it. */
export async function decideMessage(id: string, approve: boolean): Promise<{ error?: string }> {
  const ctx = await owner();
  if (!ctx) return { error: "Only the owner can do this" };
  const admin = createAdminClient();
  const { data: ev } = await admin.from("autopilot_events")
    .select("id, flow_key, client_email, client_phone, message_body, event_text, outcome, link")
    .eq("id", id).eq("shop_id", ctx.shopId).maybeSingle();
  if (!ev || ev.outcome !== "pending") return { error: "This message was already handled" };

  // Claim the decision first so a double tap can't send twice.
  const { data: claimed } = await admin.from("autopilot_events")
    .update({ outcome: approve ? "sent" : "skipped" }).eq("id", id).eq("outcome", "pending").select("id").maybeSingle();
  if (!claimed) return { error: "This message was already handled" };
  if (!approve) { revalidatePath("/dashboard/autopilot"); return {}; }

  const { data: shop } = await admin.from("shops").select("name, handle").eq("id", ctx.shopId).maybeSingle();
  const bookingUrl = (ev.link as string | null) ?? `${SITE_URL}/book/${shop?.handle ?? ""}`;
  const text = (ev.message_body as string) ?? "";
  const subject = ((ev.event_text as string) ?? "").replace(/ \(.*\)$/, "");
  let ok = false;
  if (ev.client_phone && twilioConfigured()) {
    const { data: out } = await admin.from("sms_opt_outs").select("phone").eq("phone", ev.client_phone).maybeSingle();
    if (!out) ok = !(await sendShopSms(ctx.shopId, ev.client_phone as string, smsText(shop?.name ?? "", text, bookingUrl, COMMERCIAL.has(ev.flow_key as string)), { marketing: COMMERCIAL.has(ev.flow_key as string), automated: true, kind: `autopilot.${ev.flow_key as string}` })).error;
  }
  if (ev.client_email) {
    const r = await sendAutopilotEmail(ev.client_email as string, { shopName: shop?.name ?? "", subject, text, ctaLabel: "Book now", ctaUrl: bookingUrl });
    ok = ok || !r.error;
  }
  if (!ok) await admin.from("autopilot_events").update({ outcome: "failed" }).eq("id", id);
  revalidatePath("/dashboard/autopilot");
  return ok ? {} : { error: "Couldn't deliver this message" };
}

export async function switchToAutomatic(): Promise<{ error?: string }> {
  const ctx = await owner();
  if (!ctx) return { error: "Only the owner can do this" };
  await createAdminClient().from("shops").update({ autopilot_approval_until: new Date().toISOString() }).eq("id", ctx.shopId);
  revalidatePath("/dashboard/autopilot");
  return {};
}
