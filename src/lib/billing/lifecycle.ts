import type { SupabaseClient } from "@supabase/supabase-js";
import { sendBillingEmail } from "@/lib/resend";
import { fmtDate, ownerContact } from "@/lib/billing/notices";

const DAY = 24 * 60 * 60 * 1000;
const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://flow.flatpurse.com";
const BILLING_URL = `${SITE}/dashboard/settings?tab=billing`;
const EXPORT_URL = `${SITE}/api/account/export`;
const DELETE_URL = `${SITE}/dashboard/settings/delete`;

/**
 * Purging is irreversible and cascades to almost every table, so it only runs
 * once DATA_DELETION_ENABLED=true (after the legal retention periods for
 * financial records are confirmed). Until then the emails that promise a
 * deletion (C9, D3) are not sent either.
 */
export const deletionEnabled = () => process.env.DATA_DELETION_ENABLED === "true";

type Row = {
  id: string; name: string; owner_id: string; plan: string;
  cancel_at: string | null; plan_ended_at: string | null; paused_until: string | null;
  deletion_scheduled_at: string | null; subscription_status: string | null;
  billing_notices: Record<string, string> | null;
};
const COLS = "id, name, owner_id, plan, cancel_at, plan_ended_at, paused_until, deletion_scheduled_at, subscription_status, billing_notices";

/** Archives tax records (6 years) and signed intake forms (7 years), logs, then deletes the shop. One transaction (migration 0076). */
export async function purgeShop(admin: SupabaseClient, shopId: string, reason: "owner_request" | "post_cancel_90d") {
  const { error } = await admin.rpc("purge_shop", { p_shop: shopId, p_reason: reason });
  if (error) throw new Error(`purge failed: ${error.message}`);
}

/** Owner-requested deletion runs 30 days after the request (George, Nov 21). */
export const DELETION_GRACE_DAYS = 30;
const RETENTION_NOTE = "As the law requires, we keep tax records for 6 years and signed intake forms for 7 years, then delete them too.";

/** Daily: C2-C9 after a cancellation, P2 before a pause ends, D2/D3 for account deletion. */
export async function runLifecycleJob(admin: SupabaseClient) {
  const now = Date.now();
  const out = { sent: 0, purged: 0 };
  const { data } = await admin.from("shops").select(COLS)
    .or("cancel_at.not.is.null,plan_ended_at.not.is.null,paused_until.not.is.null,deletion_scheduled_at.not.is.null");

  for (const shop of (data ?? []) as Row[]) {
    const notices = { ...(shop.billing_notices ?? {}) };
    let contact: Awaited<ReturnType<typeof ownerContact>> | null = null;
    const email = async (key: string, subject: string, body: string, ctaLabel?: string, ctaUrl?: string) => {
      if (notices[key]) return;
      notices[key] = new Date().toISOString();
      await admin.from("shops").update({ billing_notices: notices }).eq("id", shop.id);
      contact ??= await ownerContact(admin, shop.owner_id);
      if (!contact.email) return;
      await sendBillingEmail(contact.email, { subject, heading: subject, body: `Hi ${contact.firstName},\n\n${body}\n\nGeorge`, ctaLabel, ctaUrl });
      out.sent++;
    };

    // Account deletion requested (D2 day 6, D3 + purge day 7).
    if (shop.deletion_scheduled_at) {
      const at = new Date(shop.deletion_scheduled_at).getTime();
      const tag = shop.deletion_scheduled_at.slice(0, 10);
      if (at - now <= DAY && at > now) {
        await email(`d2_${tag}`, "Your Flow account will be deleted tomorrow", `Tomorrow we'll permanently delete ${shop.name}'s account and data. This is your last chance to download a copy or cancel the deletion.`, "Cancel deletion", DELETE_URL);
      } else if (at <= now && deletionEnabled()) {
        contact ??= await ownerContact(admin, shop.owner_id);
        await purgeShop(admin, shop.id, "owner_request");
        if (contact.email) await sendBillingEmail(contact.email, { subject: "Your Flow account has been deleted", heading: "Your account has been deleted", body: `Hi ${contact.firstName},\n\nAs requested, we've deleted ${shop.name}'s Flow account and data. ${RETENTION_NOTE} Thank you for trying Flow.\n\nGeorge` });
        out.purged++;
      }
      continue;
    }

    // Pause ends in 7 days (P2).
    if (shop.paused_until) {
      const left = (new Date(shop.paused_until).getTime() - now) / DAY;
      if (left <= 7 && left > 0) {
        await email(`p2_${shop.paused_until.slice(0, 10)}`, `Flow is back on ${fmtDate(new Date(shop.paused_until))}`, `Your pause ends on ${fmtDate(new Date(shop.paused_until))}. Billing restarts then, and your booking page and AutoPilot switch back on.\n\nWant to come back early, or need more time? Manage it in Settings, Billing.`, "Manage plan", BILLING_URL);
      }
    }

    // Plan ends in 3 days (C2).
    if (shop.cancel_at && !shop.plan_ended_at) {
      const left = (new Date(shop.cancel_at).getTime() - now) / DAY;
      if (left <= 3 && left > 0) {
        const { count } = await admin.from("appointments").select("id", { count: "exact", head: true }).eq("shop_id", shop.id).gte("starts_at", new Date().toISOString()).in("status", ["confirmed", "pending", "deposit"]);
        await email(`c2_${shop.cancel_at.slice(0, 10)}`, "Your Flow plan ends in 3 days", `Quick heads-up: on ${fmtDate(new Date(shop.cancel_at))}, ${shop.name}'s booking page stops taking bookings. You have ${count ?? 0} upcoming appointments in Flow.\n\nDownload your data: ${EXPORT_URL}`, "Keep my plan", BILLING_URL);
      }
    }

    // After the plan ended (C3-C9). Reactivating clears plan_ended_at and stops this.
    if (shop.plan_ended_at && !["active", "trialing", "past_due"].includes(shop.subscription_status ?? "")) {
      const ended = new Date(shop.plan_ended_at);
      const day = Math.floor((now - ended.getTime()) / DAY);
      const tag = shop.plan_ended_at.slice(0, 10);
      const deletion = fmtDate(new Date(ended.getTime() + 90 * DAY));
      if (day >= 90) {
        if (deletionEnabled()) {
          contact ??= await ownerContact(admin, shop.owner_id);
          await purgeShop(admin, shop.id, "post_cancel_90d");
          if (contact.email) await sendBillingEmail(contact.email, { subject: "Your Flow data has been deleted", heading: "Your Flow data has been deleted", body: `Hi ${contact.firstName},\n\nAs promised, we've deleted ${shop.name}'s data from Flow. ${RETENTION_NOTE} If you ever want to come back, you can start fresh anytime. Thank you for trying Flow.\n\nGeorge` });
          out.purged++;
        }
      } else if (day >= 83) {
        const [{ count: clients }, { count: appts }] = await Promise.all([
          admin.from("clients").select("id", { count: "exact", head: true }).eq("shop_id", shop.id),
          admin.from("appointments").select("id", { count: "exact", head: true }).eq("shop_id", shop.id),
        ]);
        if (deletionEnabled()) await email(`c8_${tag}`, "Your Flow data will be deleted in 7 days", `On ${deletion}, we'll permanently delete ${shop.name}'s data from Flow: ${clients ?? 0} clients, ${appts ?? 0} appointments and your settings.\n\nWant to keep a copy? Download it here: ${EXPORT_URL}\nWant to keep everything? Reactivate.`, "Reactivate", BILLING_URL);
      } else if (day >= 59) {
        await email(`c7_${tag}`, "Your comeback offer ends tomorrow", `Last reminder: 50% off your first 2 months back ends tomorrow, ${fmtDate(new Date(ended.getTime() + 60 * DAY))}.`, "Reactivate with 50% off", BILLING_URL);
      } else if (day >= 45) {
        await email(`c6_${tag}`, "Come back to Flow: 50% off your first 2 months", `I'd love another shot at earning ${shop.name}'s business. Come back in the next 14 days and your first 2 months are 50% off. Everything you set up is still there.`, "Reactivate with 50% off", BILLING_URL);
      } else if (day >= 14) {
        await email(`c5_${tag}`, "Your data is still here if you want it", `Your clients, services and booking history are still saved in Flow until ${deletion}.`, "Reactivate my account", BILLING_URL);
      } else if (day >= 1) {
        await email(`c4_${tag}`, "What could we have done better?", "Thank you for giving Flow a try. If you have 30 seconds, reply and tell me one thing we should fix. It goes straight to me and genuinely shapes what we build next.");
      } else {
        await email(`c3_${tag}`, "Your Flow plan has ended", `Your plan ended today. Your data is saved until ${deletion}. You can reactivate anytime and pick up exactly where you left off.\n\nDownload your data: ${EXPORT_URL}`, "Reactivate", BILLING_URL);
      }
    }
  }
  return out;
}

/** Days 45-59 after the plan ended: 50% off the first 2 months back (C6/C7). */
export function inComebackWindow(planEndedAt: string | null, now = Date.now()) {
  if (!planEndedAt) return false;
  const day = (now - new Date(planEndedAt).getTime()) / DAY;
  return day >= 45 && day < 60;
}
