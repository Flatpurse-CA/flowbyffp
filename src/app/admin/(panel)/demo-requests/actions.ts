"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin, logAdminAction } from "@/lib/admin-guard";
import { DEMO_STATUSES, type DemoStatus } from "./statuses";

export async function setDemoRequestStatus(id: string, status: DemoStatus): Promise<{ error?: string }> {
  const { email } = await requireAdmin();
  if (!DEMO_STATUSES.includes(status)) return { error: "Invalid status" };

  const admin = createAdminClient();
  const { error } = await admin.from("demo_requests").update({ status }).eq("id", id);
  if (error) return { error: error.message };

  await logAdminAction(email, "set_demo_request_status", "demo_request", id, { status });
  revalidatePath("/admin/demo-requests", "page");
  return {};
}

export async function deleteDemoRequest(formData: FormData) {
  const { email } = await requireAdmin();
  const id = formData.get("id") as string;
  const admin = createAdminClient();
  await admin.from("demo_requests").delete().eq("id", id);
  await logAdminAction(email, "delete_demo_request", "demo_request", id);
  revalidatePath("/admin/demo-requests", "page");
}
