"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin, logAdminAction } from "@/lib/admin-guard";

export async function deleteWaitlistEntry(formData: FormData) {
  const { email } = await requireAdmin();
  const id = formData.get("id") as string;
  const admin = createAdminClient();
  await admin.from("waitlist").delete().eq("id", id);
  await logAdminAction(email, "delete_waitlist_entry", "waitlist_entry", id);
  revalidatePath("/admin/waitlist", "page");
}

export async function bulkDeleteWaitlistEntries(ids: string[]) {
  const { email } = await requireAdmin();
  if (!ids.length) return;
  const admin = createAdminClient();
  await admin.from("waitlist").delete().in("id", ids);
  await logAdminAction(email, "bulk_delete_waitlist_entries", "waitlist_entry", null, { ids, count: ids.length });
  revalidatePath("/admin/waitlist", "page");
}
