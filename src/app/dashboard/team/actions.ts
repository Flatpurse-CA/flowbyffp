"use server";

import { revalidatePath } from "next/cache";
import { requireShop, getCurrentShopId, getShopContext } from "@/lib/dashboard/shop";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendStaffInviteEmail } from "@/lib/resend";
import { getRequestOrigin } from "@/lib/requestOrigin";
import type { AppointmentRow } from "../appointments/actions";

export type InviteStatus = "not_invited" | "pending" | "accepted";

export type StaffRow = {
  id: string;
  full_name: string;
  role: string | null;
  color: string;
  active: boolean;
  email: string | null;
  invite_status: InviteStatus;
};

export async function listStaff(): Promise<StaffRow[]> {
  const shopId = await getCurrentShopId();
  if (!shopId) return [];

  const { supabase } = await requireShop();
  const { data, error } = await supabase
    .from("staff")
    .select("id, full_name, role, color, active, email, invite_status")
    .eq("shop_id", shopId)
    .eq("active", true)
    .order("created_at", { ascending: true });

  if (error) return [];
  return (data ?? []) as StaffRow[];
}

export async function listAppointmentsForMetrics(rangeStart: string, rangeEnd: string): Promise<AppointmentRow[]> {
  const shopId = await getCurrentShopId();
  if (!shopId) return [];

  const { supabase } = await requireShop();
  const { data, error } = await supabase
    .from("appointments")
    .select("*")
    .eq("shop_id", shopId)
    .gte("starts_at", rangeStart)
    .lte("starts_at", rangeEnd)
    .order("starts_at", { ascending: true });

  if (error) return [];
  return (data ?? []) as AppointmentRow[];
}

const PALETTE = [
  "rgb(139,92,246)", "rgb(239,68,68)", "rgb(16,185,129)",
  "rgb(251,191,36)", "rgb(96,165,250)", "rgb(251,146,60)",
];

async function sendInvite(supabase: Awaited<ReturnType<typeof requireShop>>["supabase"], shopId: string, staffId: string, email: string) {
  const { data: shop } = await supabase.from("shops").select("name").eq("id", shopId).maybeSingle();
  const shopName = (shop?.name as string | undefined) ?? "your shop";

  const origin = await getRequestOrigin();
  const admin = createAdminClient();

  const { data: linkData, error: linkError } = await admin.auth.admin.generateLink({
    type: "invite",
    email,
    options: { redirectTo: `${origin}/auth/confirm?next=/staff/set-password` },
  });

  if (linkError || !linkData) {
    throw new Error(linkError?.message ?? "Couldn't generate an invite link");
  }

  const inviteUrl = `${origin}/auth/confirm?token_hash=${linkData.properties.hashed_token}&type=invite&next=${encodeURIComponent("/staff/set-password")}`;

  const { error: staffError } = await supabase
    .from("staff")
    .update({
      user_id: linkData.user.id,
      email,
      invite_status: "pending",
      invited_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", staffId)
    .eq("shop_id", shopId);

  if (staffError) throw new Error(staffError.message);

  const { error: emailError } = await sendStaffInviteEmail(email, { shopName, inviteUrl });
  if (emailError) throw new Error(`Invite created but the email failed to send: ${emailError.message}`);
}

export async function inviteStaff(input: { fullName: string; role?: string; email: string }) {
  const ctx = await getShopContext();
  if (!ctx || ctx.role !== "owner") throw new Error("Only the shop owner can invite team members");

  const { supabase, shopId } = await requireShop();
  const email = input.email.trim();

  // staff.user_id has a unique index, so re-inserting a row for an email that's already
  // linked to a staff record (this shop or another) would crash with a raw Postgres
  // constraint error. Check for an existing row first and handle it explicitly instead.
  const { data: existingRows } = await supabase
    .from("staff")
    .select("id, shop_id, active, invite_status")
    .ilike("email", email);

  const sameShopRow = (existingRows ?? []).find(r => r.shop_id === shopId);
  const otherShopRow = (existingRows ?? []).find(r => r.shop_id !== shopId);

  if (sameShopRow) {
    if (sameShopRow.active) {
      throw new Error(
        sameShopRow.invite_status === "accepted"
          ? `${email} is already an active team member.`
          : `${email} has already been invited. Use "Resend invite" from their profile instead.`,
      );
    }
    // Previously removed — reactivate rather than inserting a duplicate row.
    await supabase
      .from("staff")
      .update({ active: true, full_name: input.fullName, role: input.role || null, updated_at: new Date().toISOString() })
      .eq("id", sameShopRow.id);

    if (sameShopRow.invite_status !== "accepted") {
      await sendInvite(supabase, shopId, sameShopRow.id, email);
    }
    revalidatePath("/dashboard/team");
    revalidatePath("/dashboard/operations");
    return;
  }

  if (otherShopRow) {
    throw new Error(`${email} is already registered as staff at another shop. Each team member can only be linked to one shop.`);
  }

  const { count } = await supabase
    .from("staff")
    .select("id", { count: "exact", head: true })
    .eq("shop_id", shopId);

  const color = PALETTE[(count ?? 0) % PALETTE.length];

  const { data: created, error } = await supabase
    .from("staff")
    .insert({ shop_id: shopId, full_name: input.fullName, role: input.role || null, color })
    .select("id")
    .single();

  if (error || !created) throw new Error(error?.message ?? "Couldn't create staff record");

  try {
    await sendInvite(supabase, shopId, created.id as string, email);
  } catch (err) {
    // If the invite link itself couldn't be generated (e.g. email already has an account),
    // the staff row never got an email/user_id — remove it rather than leaving an orphaned,
    // un-retryable "not invited" row with no way to resend. If it got as far as "pending"
    // (email/link created, only the send failed), keep it so "Resend invite" can retry.
    const { data: check } = await supabase.from("staff").select("invite_status").eq("id", created.id).maybeSingle();
    if (check?.invite_status === "not_invited") {
      await supabase.from("staff").delete().eq("id", created.id);
    }
    revalidatePath("/dashboard/team");
    throw err;
  }

  revalidatePath("/dashboard/team");
  revalidatePath("/dashboard/operations");
}

export async function resendInvite(staffId: string) {
  const ctx = await getShopContext();
  if (!ctx || ctx.role !== "owner") throw new Error("Only the shop owner can resend invites");

  const { supabase, shopId } = await requireShop();

  const { data: staff } = await supabase
    .from("staff")
    .select("email, invite_status")
    .eq("id", staffId)
    .eq("shop_id", shopId)
    .maybeSingle();

  if (!staff?.email) throw new Error("This team member has no email on file");
  if (staff.invite_status === "accepted") throw new Error("This team member has already set up their account");

  await sendInvite(supabase, shopId, staffId, staff.email);
  revalidatePath("/dashboard/team");
}

export async function updateStaff(id: string, input: { fullName?: string; role?: string }) {
  const ctx = await getShopContext();
  if (!ctx || ctx.role !== "owner") throw new Error("Only the shop owner can edit team members");
  const { supabase, shopId } = await requireShop();

  const { error } = await supabase
    .from("staff")
    .update({
      ...(input.fullName !== undefined ? { full_name: input.fullName } : {}),
      ...(input.role !== undefined ? { role: input.role } : {}),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("shop_id", shopId);

  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/team");
}

export async function archiveStaff(id: string) {
  const ctx = await getShopContext();
  if (!ctx || ctx.role !== "owner") throw new Error("Only the shop owner can remove team members");
  const { supabase, shopId } = await requireShop();

  const { error } = await supabase
    .from("staff")
    .update({ active: false, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("shop_id", shopId);

  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/team");
  revalidatePath("/dashboard/operations");
}
