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

export async function deleteWaitlistEntry(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id") as string;
  const admin = createAdminClient();
  await admin.from("waitlist").delete().eq("id", id);
  revalidatePath("/admin/waitlist", "page");
}

export async function bulkDeleteWaitlistEntries(ids: string[]) {
  await requireAdmin();
  if (!ids.length) return;
  const admin = createAdminClient();
  await admin.from("waitlist").delete().in("id", ids);
  revalidatePath("/admin/waitlist", "page");
}
