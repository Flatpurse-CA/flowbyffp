import { NextRequest, NextResponse } from "next/server";
import { runLifecycleEmails } from "@/lib/lifecycleEmails";

// Owner lifecycle emails E0b-E3 + staff invite reminder (vercel.json).
// Safe to run at any cadence: every step is logged and sent at most once.
export const dynamic = "force-dynamic";
export const maxDuration = 120;

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json(await runLifecycleEmails());
}
