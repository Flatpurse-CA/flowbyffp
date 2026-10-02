import { NextRequest, NextResponse } from "next/server";
import { validateTwilioSignature, sendSms } from "@/lib/twilio";
import { findClientByPhone, handleInboundMessage } from "@/lib/dashboard/frontdesk";
import { toE164 } from "@/lib/phone";

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
