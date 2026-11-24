import { NextRequest, NextResponse } from "next/server";
import { validateTwilioSignature, sendSms } from "@/lib/twilio";
import { findClientByPhone, handleInboundMessage } from "@/lib/dashboard/frontdesk";
import { toE164 } from "@/lib/phone";
import { createAdminClient } from "@/lib/supabase/admin";

// Twilio signature validation needs Node's crypto — must not run on the Edge runtime.
export const runtime = "nodejs";

const EMPTY_TWIML = new NextResponse("<Response></Response>", { headers: { "Content-Type": "text/xml" } });

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const params: Record<string, string> = {};
  formData.forEach((value, key) => { params[key] = String(value); });

  const signature = req.headers.get("X-Twilio-Signature");
  const url = req.nextUrl.toString();
  if (!validateTwilioSignature(url, params, signature)) {
    return NextResponse.json({ error: "Invalid Twilio signature" }, { status: 403 });
  }

  const from = params.From;
  const body = params.Body;
  if (!from || !body) return EMPTY_TWIML;

  // CASL opt-out keywords (FL-006). Twilio also blocks the number on STOP;
  // we keep our own ledger so the engine never tries and the owner can see it.
  const word = body.trim().toUpperCase();
  const phone = toE164(from) ?? from;
  if (["STOP", "STOPALL", "UNSUBSCRIBE", "CANCEL", "END", "QUIT", "ARRET"].includes(word)) {
    const admin = createAdminClient();
    const shop = await findClientByPhone(from);
    await admin.from("sms_opt_outs").upsert({ phone, source: "sms_stop" }, { onConflict: "phone" });
    await admin.from("consent_events").insert({ shop_id: shop?.shopId ?? null, phone, action: "opt_out", source: `sms:${word}` });
    return EMPTY_TWIML;
  }
  if (["START", "UNSTOP", "YES"].includes(word)) {
    const admin = createAdminClient();
    const shop = await findClientByPhone(from);
    await admin.from("sms_opt_outs").delete().eq("phone", phone);
    await admin.from("consent_events").insert({ shop_id: shop?.shopId ?? null, phone, action: "opt_in", source: `sms:${word}` });
    return EMPTY_TWIML;
  }
  if (["HELP", "INFO", "AIDE"].includes(word)) {
    await sendSms(from, "Flow by FlatPurse: booking messages from your salon. Reply STOP to opt out. Help: flow.flatpurse.com");
    return EMPTY_TWIML;
  }

  const match = await findClientByPhone(from);
  if (!match) {
    // A cold number the platform has no booking for at all — the
    // shared-number model has no way to know which shop they mean.
    await sendSms(from, "Hi! We couldn't find which salon you're texting. Ask them for their booking link, or find them at flow.flatpurse.com.");
    return EMPTY_TWIML;
  }

  await handleInboundMessage({
    shopId: match.shopId,
    fromPhone: toE164(from) ?? from,
    fromName: match.name ?? "there",
    body,
    channel: "sms",
  });

  return EMPTY_TWIML;
}
