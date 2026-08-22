import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/admin-guard";
import { enqueueSubscriber } from "@/lib/email-sequence";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!(await isAdmin(authData.user?.email))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { subscriber_id } = await req.json();
  if (!subscriber_id) return NextResponse.json({ error: "subscriber_id required" }, { status: 400 });

  await enqueueSubscriber(subscriber_id);
  return NextResponse.json({ ok: true });
}
