import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isAdmin } from "@/lib/admin-guard";

type NotificationItem = {
  id: string;
  type: "waitlist" | "shop" | "user" | "email_failed";
  title: string;
  subtitle: string;
  createdAt: string;
  href: string;
};

export async function GET() {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!(await isAdmin(authData.user?.email))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();

  const [waitlistRes, shopsRes, usersRes, failedRes] = await Promise.all([
    admin.from("waitlist").select("id, email, created_at").order("created_at", { ascending: false }).limit(10),
    admin.from("shops").select("id, name, created_at").order("created_at", { ascending: false }).limit(10),
    admin.auth.admin.listUsers({ perPage: 1000 }),
    admin.from("email_sends").select("id, sequence_id, created_at, error_message").eq("status", "failed").order("created_at", { ascending: false }).limit(10),
  ]);

  const items: NotificationItem[] = [];

  for (const w of waitlistRes.data ?? []) {
    items.push({
      id: `waitlist-${w.id}`,
      type: "waitlist",
      title: "New waitlist signup",
      subtitle: w.email,
      createdAt: w.created_at,
      href: "/admin/waitlist",
    });
  }

  for (const s of shopsRes.data ?? []) {
    items.push({
      id: `shop-${s.id}`,
      type: "shop",
      title: "New shop registered",
      subtitle: s.name,
      createdAt: s.created_at,
      href: "/admin/shops",
    });
  }

  const recentUsers = [...(usersRes.data?.users ?? [])]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 10);
  for (const u of recentUsers) {
    items.push({
      id: `user-${u.id}`,
      type: "user",
      title: "New member joined",
      subtitle: u.email ?? "Unknown",
      createdAt: u.created_at,
      href: "/admin/users",
    });
  }

  for (const f of failedRes.data ?? []) {
    items.push({
      id: `email-${f.id}`,
      type: "email_failed",
      title: "Email send failed",
      subtitle: f.error_message ?? "Unknown error",
      createdAt: f.created_at,
      href: "/admin/emails/subscribers",
    });
  }

  items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // "Last seen" lives on the admin's own account (not localStorage) so the
  // badge is the same on every device they use.
  const seenAt = (authData.user?.app_metadata?.admin_notifications_seen_at as string | undefined) ?? null;

  return NextResponse.json({ items: items.slice(0, 20), seenAt });
}

export async function POST() {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  const user = authData.user;
  if (!user || !(await isAdmin(user.email))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const seenAt = new Date().toISOString();
  const admin = createAdminClient();
  const { error } = await admin.auth.admin.updateUserById(user.id, {
    app_metadata: { ...user.app_metadata, admin_notifications_seen_at: seenAt },
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ seenAt });
}
