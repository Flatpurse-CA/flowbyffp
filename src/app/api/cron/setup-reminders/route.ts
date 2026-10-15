import { NextRequest, NextResponse } from "next/server";
import { runAutomaticSetupReminders } from "@/lib/admin/setupReminders";
import { logAdminAction } from "@/lib/admin-guard";

// Daily job (vercel.json). Vercel sends `Authorization: Bearer $CRON_SECRET`
// with its cron requests; anything else is rejected, so this can't be
// triggered from outside. Emails owners who verified but never created a
// shop: 1 day after signup, then 3 and 4 days after each reminder, three
// at most, and only for signups from the last 21 days.
export const dynamic = "force-dynamic";
export const maxDuration = 120;

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await runAutomaticSetupReminders();
  if (result.sent || result.failed) {
    await logAdminAction("system:setup-reminders", "auto_setup_reminders", "user", null, result);
  }
  return NextResponse.json(result);
}
