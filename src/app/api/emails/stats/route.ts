import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  const admin = createAdminClient();

  const { data } = await admin
    .from("email_sends")
    .select("status");

  const counts = { total: 0, sent: 0, pending: 0, failed: 0 };
  for (const row of data ?? []) {
    counts.total++;
    if (row.status === "sent")    counts.sent++;
    if (row.status === "pending") counts.pending++;
    if (row.status === "failed")  counts.failed++;
  }

  return NextResponse.json(counts);
}
