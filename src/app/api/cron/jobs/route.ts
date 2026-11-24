import { NextRequest, NextResponse } from "next/server";
import { runDueJobs } from "@/lib/scheduler";
import { JOB_HANDLERS } from "@/lib/jobs";

// Runs due scheduled jobs (FL-004). vercel.json; safe at any cadence.
export const dynamic = "force-dynamic";
export const maxDuration = 120;

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json(await runDueJobs(JOB_HANDLERS));
}
