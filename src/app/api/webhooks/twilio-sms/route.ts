import { NextRequest, NextResponse } from "next/server";
import { validateTwilioSignature, sendSms } from "@/lib/twilio";
import { resolveShopIdForPhone, handleInboundMessage } from "@/lib/dashboard/frontdesk";
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

  const shopId = await resolveShopIdForPhone(from);
  if (!shopId) {
    // A cold number the platform has no client record for at all — the
    // shared-number model has no way to know which shop they mean.
    await sendSms(from, "Hi! We couldn't find which salon you're texting. Ask them for their booking link, or find them at flow.flatpurse.com.");
    return EMPTY_TWIML;
  }

  const admin = createAdminClient();
  const { data: client } = await admin.from("clients").select("full_name").eq("shop_id", shopId).eq("phone", from).maybeSingle();

  await handleInboundMessage({
    shopId,
    fromPhone: from,
    fromName: (client?.full_name as string | undefined) ?? "there",
    body,
    channel: "sms",
  });

  return EMPTY_TWIML;
}
