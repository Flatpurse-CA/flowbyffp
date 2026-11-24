import { createAdminClient } from "@/lib/supabase/admin";
import { sendLifecycleEmail, type EmailTemplateKey } from "@/lib/resend";
import { signToken } from "@/lib/signedLink";

/**
 * Owner lifecycle emails E0b-E3 (CTO spec 4B) and the staff-invite reminder.
 * Every email has an exit condition and is logged in lifecycle_emails, so a
 * step is sent at most once per owner however often the job runs.
 */
const H = 3600_000;
const site = () => (process.env.NEXT_PUBLIC_SITE_URL || "https://flow.flatpurse.com").replace(/\/$/, "");
type Admin = ReturnType<typeof createAdminClient>;

async function once(admin: Admin, userId: string, code: string, ref: string, go: () => Promise<{ error: unknown }>): Promise<"sent" | "skip" | "failed"> {
  const { error: dup } = await admin.from("lifecycle_emails").insert({ user_id: userId, code, ref });
  if (dup) return "skip"; // already sent (unique) or table missing
  const { error } = await go().catch((e) => ({ error: e }));
  if (error) {
    await admin.from("lifecycle_emails").delete().eq("user_id", userId).eq("code", code).eq("ref", ref);
    return "failed";
  }
  return "sent";
}

/** E1: called right after an owner verifies their email. */
export async function sendOwnerWelcome(to: string, userId: string, firstName: string, businessName: string) {
  const admin = createAdminClient();
  return once(admin, userId, "E1", "", () =>
    sendLifecycleEmail(to, "owner_welcome", { firstName, businessName }, `${site()}/onboarding`));
}

export async function runLifecycleEmails(now = Date.now()) {
  const admin = createAdminClient();
  const tally = { sent: 0, failed: 0 };
  const count = (r: "sent" | "skip" | "failed") => { if (r === "sent") tally.sent++; if (r === "failed") tally.failed++; };

  const { data: shops } = await admin.from("shops")
    .select("id, owner_id, name, handle, business_type, created_at")
    .gte("created_at", new Date(now - 7 * 24 * H).toISOString());

  for (const shop of shops ?? []) {
    const { data: u } = await admin.auth.admin.getUserById(shop.owner_id as string);
    const user = u?.user;
    if (!user?.email) continue;
    const { data: profile } = await admin.from("profiles").select("first_name").eq("id", user.id).maybeSingle();
    const firstName = (profile?.first_name as string | undefined) ?? "there";
    const businessName = (shop.name as string) || "your business";
    const send = (key: EmailTemplateKey, vars: Record<string, string>, url: string) => () =>
      sendLifecycleEmail(user.email!, key, { firstName, businessName, ...vars }, url);

    if (!user.email_confirmed_at) {
      // E0b: +1 hr and +24 hrs, max 2.
      const age = now - new Date(user.created_at).getTime();
      const url = `${site()}/signup/resume?t=${encodeURIComponent(signToken(user.id))}`;
      if (age >= H) count(await once(admin, user.id, "E0b", "1", send("verify_nudge", {}, url)));
      if (age >= 24 * H) count(await once(admin, user.id, "E0b", "2", send("verify_nudge", {}, url)));
      continue;
    }

    const { count: services } = await admin.from("services").select("id", { count: "exact", head: true }).eq("shop_id", shop.id);
    const setupDone = Boolean(shop.handle) && (services ?? 0) > 0;
    const sinceVerify = now - new Date(user.email_confirmed_at).getTime();
    const sinceSignup = now - new Date(shop.created_at as string).getTime();

    // E2: +1 hr after verifying, onboarding not finished. Day 1 hands over to E3a.
    if (!setupDone && sinceVerify >= H && sinceVerify < 24 * H) {
      const [stepNumber, stepName] = !shop.handle ? ["1", "Claim your booking link"] : ["2", "Add your services"];
      count(await once(admin, user.id, "E2", "", send("setup_resume", { stepNumber, totalSteps: "4", stepName }, `${site()}/onboarding`)));
    }

    // E3a / E3b: day 1, one or the other.
    if (sinceSignup >= 24 * H && sinceSignup < 72 * H) {
      if (setupDone) {
        const bookingUrl = `${site()}/book/${shop.handle}`;
        count(await once(admin, user.id, "E3", "", send("booking_link_live", { bookingUrl }, bookingUrl)));
      } else {
        const vertical = String(shop.business_type ?? "salon").replace(/_/g, " ").toLowerCase();
        const url = shop.handle ? `${site()}/dashboard/services` : `${site()}/onboarding`;
        count(await once(admin, user.id, "E3", "", send("booking_page_steps", { vertical }, url)));
      }
    }
  }

  // Staff invite not accepted after 2 days: tell the owner (once per staff member).
  const { data: pending } = await admin.from("staff")
    .select("id, full_name, shop_id, invited_at, shops(name, owner_id)")
    .eq("invite_status", "pending")
    .lte("invited_at", new Date(now - 48 * H).toISOString())
    .gte("invited_at", new Date(now - 9 * 24 * H).toISOString());
  for (const st of pending ?? []) {
    const shop = (Array.isArray(st.shops) ? st.shops[0] : st.shops) as { name: string; owner_id: string } | null;
    if (!shop) continue;
    const { data: u } = await admin.auth.admin.getUserById(shop.owner_id);
    if (!u?.user?.email) continue;
    count(await once(admin, shop.owner_id, "staff_invite_reminder", st.id as string, () =>
      sendLifecycleEmail(u.user!.email!, "staff_invite_reminder", { staffName: (st.full_name as string) || "Your team member", shopName: shop.name }, `${site()}/dashboard/team`)));
  }

  return tally;
}
