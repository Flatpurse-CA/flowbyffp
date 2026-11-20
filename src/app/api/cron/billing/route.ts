import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { runBillingJob } from "@/lib/billing/notices";
import { runLifecycleJob } from "@/lib/billing/lifecycle";

// Daily job (vercel.json): dunning follow-ups, Day 11 trial reminder, Founders month-13 notice.
export const dynamic = "force-dynamic";
export const maxDuration = 120;

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const admin = createAdminClient();
  return NextResponse.json({ billing: await runBillingJob(admin), lifecycle: await runLifecycleJob(admin) });
}
