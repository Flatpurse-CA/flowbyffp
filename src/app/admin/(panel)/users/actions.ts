"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/admin-guard";
import { redirect } from "next/navigation";

async function requireAdmin() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!(await isAdmin(data.user?.email))) redirect("/admin/login");
}

export async function banUser(formData: FormData) {
  await requireAdmin();
  const userId = formData.get("userId") as string;
  const admin = createAdminClient();
  await admin.auth.admin.updateUserById(userId, { ban_duration: "876600h" });
  revalidatePath("/admin/users", "page");
}

export async function unbanUser(formData: FormData) {
  await requireAdmin();
  const userId = formData.get("userId") as string;
  const admin = createAdminClient();
  await admin.auth.admin.updateUserById(userId, { ban_duration: "none" });
  revalidatePath("/admin/users", "page");
}

export async function deleteUser(formData: FormData) {
  await requireAdmin();
  const userId = formData.get("userId") as string;
  const admin = createAdminClient();
  await admin.auth.admin.deleteUser(userId);
  revalidatePath("/admin/users", "page");
}

export async function changeUserPlan(formData: FormData) {
  await requireAdmin();
  const userId = formData.get("userId") as string;
  const plan   = formData.get("plan") as string;
  const admin = createAdminClient();
  await admin.from("shops").update({ plan }).eq("owner_id", userId);
  revalidatePath("/admin/users", "page");
}
