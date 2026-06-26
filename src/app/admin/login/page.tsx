import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/admin-guard";
import { AdminLoginForm } from "./AdminLoginForm";

export default async function AdminLoginPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (data.user && isAdmin(data.user.email)) redirect("/admin");

  return <AdminLoginForm />;
}
