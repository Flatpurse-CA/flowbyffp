import { NextRequest, NextResponse } from "next/server";
import { handleInboundMessage } from "@/lib/dashboard/frontdesk";

// Provider-agnostic inbound message webhook — deliberately generic so any
// future channel (Twilio SMS/WhatsApp, Instagram DM, or a real inbound-email
// parsing provider once one is chosen) can post this same shape without a
// rewrite. Nothing calls this yet: Resend (this project's email provider)
// doesn't do inbound parsing, so real inbound email delivery is a follow-up
// infrastructure decision. The engine behind this route is real and directly
// testable today via a manual POST.
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { shopId, fromEmail, fromName, body: messageBody } = body as {
    shopId?: string; fromEmail?: string; fromName?: string; body?: string;
  };

  if (!shopId || !fromEmail || !messageBody) {
    return NextResponse.json({ error: "shopId, fromEmail, and body are required" }, { status: 400 });
  }

  try {
    const result = await handleInboundMessage({ shopId, fromEmail, fromName: fromName ?? fromEmail, body: messageBody, channel: "email" });
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Unknown error" }, { status: 500 });
  }
}
