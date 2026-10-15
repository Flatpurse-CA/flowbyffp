import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isAdmin } from "@/lib/admin-guard";

// Header inbox: demo requests from the landing page and /demo walkthrough.
// The badge counts everything still marked "new"; the dropdown shows the
// latest few of those.
export async function GET() {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!(await isAdmin(authData.user?.email))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  const { data, count } = await admin
    .from("demo_requests")
    .select("id, name, business, created_at", { count: "exact" })
    .eq("status", "new")
    .order("created_at", { ascending: false })
    .limit(8);

  return NextResponse.json({
    newCount: count ?? 0,
    items: (data ?? []).map(r => ({ id: r.id, name: r.name, business: r.business, createdAt: r.created_at })),
  });
}
