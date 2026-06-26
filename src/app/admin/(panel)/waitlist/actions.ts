"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/admin-guard";
import { redirect } from "next/navigation";

async function requireAdmin() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!isAdmin(data.user?.email)) redirect("/dashboard");
}

export async function inviteWaitlistEntry(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id") as string;
  const admin = createAdminClient();
  await admin
    .from("waitlist")
    .update({ status: "invited", approved_at: new Date().toISOString() })
    .eq("id", id);
  revalidatePath("/admin/waitlist", "page");
}

export async function resetWaitlistEntry(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id") as string;
  const admin = createAdminClient();
  await admin
    .from("waitlist")
    .update({ status: "pending", approved_at: null })
    .eq("id", id);
  revalidatePath("/admin/waitlist", "page");
}

export async function deleteWaitlistEntry(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id") as string;
  const admin = createAdminClient();
  await admin.from("waitlist").delete().eq("id", id);
  revalidatePath("/admin/waitlist", "page");
}
