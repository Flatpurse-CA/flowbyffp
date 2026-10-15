import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/admin-guard";
import { AdminShell } from "./AdminShell";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) redirect("/admin/login");
  if (!(await isAdmin(data.user.email))) redirect("/admin/login?error=Access+denied");
  const initialDark = (await cookies()).get("admin-theme")?.value !== "light";
  return <AdminShell user={data.user} initialDark={initialDark}>{children}</AdminShell>;
}
