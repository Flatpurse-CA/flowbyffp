import { NextRequest, NextResponse } from "next/server";
import { runAutopilot } from "@/lib/autopilot/engine";

// AutoPilot runner. Called by the Vercel cron (vercel.json, daily fallback) and
// by .github/workflows/autopilot.yml every 15 minutes. Both send
// `Authorization: Bearer $CRON_SECRET`; anything else is rejected.
export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const ignoreQuietHours = req.nextUrl.searchParams.get("force") === "1";
  return NextResponse.json(await runAutopilot(new Date(), { ignoreQuietHours }));
}
