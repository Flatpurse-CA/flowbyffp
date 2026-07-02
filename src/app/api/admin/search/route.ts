import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isAdmin } from "@/lib/admin-guard";

type SearchResult = {
  id: string;
  type: "user" | "shop" | "waitlist";
  title: string;
  subtitle: string;
  href: string;
};

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!(await isAdmin(authData.user?.email))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const q = (req.nextUrl.searchParams.get("q") ?? "").trim().toLowerCase();
  if (q.length < 2) return NextResponse.json({ results: [] });

  const admin = createAdminClient();

  const [usersRes, shopsRes, waitlistRes] = await Promise.all([
    admin.auth.admin.listUsers({ perPage: 1000 }),
    admin.from("shops").select("id, name, business_type").ilike("name", `%${q}%`).limit(8),
    admin.from("waitlist").select("id, email, name").or(`email.ilike.%${q}%,name.ilike.%${q}%`).limit(8),
  ]);

  const results: SearchResult[] = [];

  for (const u of usersRes.data?.users ?? []) {
    if (u.email?.toLowerCase().includes(q)) {
      results.push({ id: u.id, type: "user", title: u.email, subtitle: "Member", href: "/admin/users" });
    }
  }

  for (const s of shopsRes.data ?? []) {
    results.push({ id: s.id, type: "shop", title: s.name, subtitle: s.business_type ?? "Shop", href: "/admin/shops" });
  }

  for (const w of waitlistRes.data ?? []) {
    results.push({ id: w.id, type: "waitlist", title: w.name ?? w.email, subtitle: "Waitlist", href: "/admin/waitlist" });
  }

  return NextResponse.json({ results: results.slice(0, 15) });
}
