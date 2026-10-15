import { createAdminClient } from "@/lib/supabase/admin";
import { sendShopSetupReminderEmail } from "@/lib/resend";
import { loadAccounts, needsShopSetup, type Account } from "@/lib/admin/accounts";

// "Finish setting up your shop" reminders, for owners who verified their
// email but never created a shop. State lives on the auth user's
// app_metadata so no schema change is needed:
//   setup_reminder_count    emails sent so far (manual and automatic)
//   setup_reminder_sent_at  when the last one went out

export const AUTO_MAX_REMINDERS = 3;
// Automatic mode only looks at recent signups, so turning it on never
// surprise-emails accounts that have been dormant for months. Older ones can
// still be reminded from the admin Users page.
export const AUTO_WINDOW_DAYS = 21;
// Minimum wait before the Nth automatic reminder: after signup (#1), then
// after the previous reminder (#2, #3).
const AUTO_WAIT_DAYS = [1, 3, 4] as const;

const DAY = 24 * 60 * 60 * 1000;

export function reminderCount(a: Account): number {
  const meta = a.user.app_metadata?.setup_reminder_count;
  if (typeof meta === "number") return meta;
  // Accounts reminded before the counter existed (manual sends): one so far.
  return a.setupReminderSentAt ? 1 : 0;
}

export function siteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL || "https://flow.flatpurse.com").replace(/\/$/, "");
}

/** Sends one reminder and records it. Returns false if the email didn't go. */
export async function sendReminder(a: Account, loginUrl: string): Promise<boolean> {
  const firstName = a.name?.split(" ")[0] || "there";
  try {
    const { error } = await sendShopSetupReminderEmail(a.user.email!, { firstName, loginUrl });
    if (error) return false;
  } catch {
    return false;
  }
  const admin = createAdminClient();
  await admin.auth.admin.updateUserById(a.user.id, {
    app_metadata: {
      ...a.user.app_metadata,
      setup_reminder_sent_at: new Date().toISOString(),
      setup_reminder_count: reminderCount(a) + 1,
    },
  });
  return true;
}

/** Whether the automatic schedule says this owner is due a reminder right now. */
export function isDueForAutoReminder(a: Account, now = Date.now()): boolean {
  if (!needsShopSetup(a)) return false;
  const count = reminderCount(a);
  if (count >= AUTO_MAX_REMINDERS) return false;
  const signedUp = new Date(a.user.created_at).getTime();
  if (now - signedUp > AUTO_WINDOW_DAYS * DAY) return false;
  // Wait is measured from signup for the first reminder, then from the last one.
  const since = count === 0 ? signedUp : new Date(a.setupReminderSentAt ?? a.user.created_at).getTime();
  return now - since >= AUTO_WAIT_DAYS[count] * DAY;
}

export async function runAutomaticSetupReminders(): Promise<{ checked: number; sent: number; failed: number }> {
  const accounts = await loadAccounts();
  const url = `${siteUrl()}/login`;
  let sent = 0, failed = 0;
  const due = accounts.filter(a => isDueForAutoReminder(a));
  for (const a of due) {
    if (await sendReminder(a, url)) sent++; else failed++;
  }
  return { checked: accounts.length, sent, failed };
}
