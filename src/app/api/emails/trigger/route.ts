import { NextRequest, NextResponse } from "next/server";
import { sendSequenceEmail } from "@/lib/email-sequence";

export async function POST(req: NextRequest) {
  const { send_id } = await req.json();
  if (!send_id) return NextResponse.json({ error: "send_id required" }, { status: 400 });

  const { error } = await sendSequenceEmail(send_id);
  if (error) return NextResponse.json({ error }, { status: 500 });

  return NextResponse.json({ ok: true });
}
