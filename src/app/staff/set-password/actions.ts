"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { validatePassword } from "@/lib/passwordPolicy";
import { sendStaffActivatedEmail } from "@/lib/resend";

export async function setStaffPassword(formData: FormData) {
  const password = formData.get("password") as string;
  const passwordError = !password ? "Password is required" : validatePassword(password);
  if (passwordError) {
    redirect(`/staff/set-password?error=${encodeURIComponent(passwordError)}`);
  }

  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    redirect(`/login?error=${encodeURIComponent("Your invite link has expired, ask your shop owner to resend it")}`);
  }

  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    redirect(`/staff/set-password?error=${encodeURIComponent(error.message)}`);
  }

  const admin = createAdminClient();
  const { data: staff } = await admin
    .from("staff")
    .update({ invite_status: "accepted", accepted_at: new Date().toISOString() })
    .eq("user_id", userData.user.id)
    .select("full_name, shop_id")
    .maybeSingle();

  if (staff && userData.user.email) {
    const { data: shop } = await admin.from("shops").select("name").eq("id", staff.shop_id).maybeSingle();
    try {
      await sendStaffActivatedEmail(userData.user.email, {
        shopName: (shop?.name as string | undefined) ?? "your shop",
        firstName: (staff.full_name as string).split(" ")[0],
      });
    } catch {
      // Non-fatal — account is already activated.
    }
  }

  redirect("/dashboard");
}
