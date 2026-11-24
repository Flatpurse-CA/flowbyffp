import { NextRequest, NextResponse } from "next/server";
import { runDueJobs } from "@/lib/scheduler";
import { JOB_HANDLERS } from "@/lib/jobs";
import { seedDigestJobs } from "@/lib/digests";
import { createAdminClient } from "@/lib/supabase/admin";

// Runs due scheduled jobs (FL-004). Called every 10 minutes by Supabase pg_cron
// (token in Vault, migration 0074) and daily by Vercel cron as a backstop.
export const dynamic = "force-dynamic";
export const maxDuration = 120;

async function authorized(req: NextRequest): Promise<boolean> {
  const auth = req.headers.get("authorization") ?? "";
  const secret = process.env.CRON_SECRET;
  if (secret && auth === `Bearer ${secret}`) return true;
  if (!auth.startsWith("Bearer jobs:")) return false;
  const { data } = await createAdminClient().rpc("verify_jobs_token", { p_token: auth.slice("Bearer jobs:".length) });
  return data === true;
}

export async function GET(req: NextRequest) {
  if (!(await authorized(req))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  // Queue each shop's next brief/recaps once an hour (idempotent), then run what's due.
  const seeded = new Date().getUTCMinutes() < 10 ? await seedDigestJobs() : null;
  return NextResponse.json({ seeded, ran: await runDueJobs(JOB_HANDLERS) });
}
