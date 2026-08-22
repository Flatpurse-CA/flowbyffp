import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/admin-guard";
import { sendSequenceEmail } from "@/lib/email-sequence";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!(await isAdmin(authData.user?.email))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { send_id } = await req.json();
  if (!send_id) return NextResponse.json({ error: "send_id required" }, { status: 400 });

  const { error } = await sendSequenceEmail(send_id);
  if (error) return NextResponse.json({ error }, { status: 500 });

  return NextResponse.json({ ok: true });
}
