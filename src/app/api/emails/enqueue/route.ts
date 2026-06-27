import { NextRequest, NextResponse } from "next/server";
import { enqueueSubscriber } from "@/lib/email-sequence";

export async function POST(req: NextRequest) {
  const { subscriber_id } = await req.json();
  if (!subscriber_id) return NextResponse.json({ error: "subscriber_id required" }, { status: 400 });

  await enqueueSubscriber(subscriber_id);
  return NextResponse.json({ ok: true });
}
