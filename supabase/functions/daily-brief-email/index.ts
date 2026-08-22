// Nightly Daily Brief email — cron-triggered (see 0 7 * * * schedule note below).
// Deno can't import the Next.js app's lib modules directly, so the metrics
// logic is intentionally re-implemented here in compact form (mirrors
// src/lib/dashboard/{metrics,clients}.ts and
// src/app/dashboard/daily-brief/actions.ts — keep both in sync if the formulas change).

import { createClient } from "jsr:@supabase/supabase-js@2";
import { Resend } from "npm:resend";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

const resend = new Resend(Deno.env.get("RESEND_API_KEY")!);
const FROM = Deno.env.get("RESEND_FROM_EMAIL") ?? "FlatPurse Flow <onboarding@resend.dev>";

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function fmtPrice(n: number) {
  return Number.isInteger(n) ? `C$${n}` : `C$${n.toFixed(2)}`;
}

type Appt = {
  id: string; client_name: string; client_phone: string | null; client_email: string | null;
  starts_at: string; price: number; status: string;
};

function keyFor(a: Appt) {
  return (a.client_phone || a.client_email || a.client_name).trim().toLowerCase();
}

function renderEmail(input: {
  shopName: string;
  ownerFirstName: string;
  summary: string;
  yesterday: { revenue: number; bookings: number; cancellations: number };
  today: { bookingsCount: number; revenueScheduled: number };
  needsYouText: string | null;
  autopilot: { actionsCount: number; revenue: number } | null;
}) {
  const { shopName, ownerFirstName, summary, yesterday, today, needsYouText, autopilot } = input;
  return `
  <div style="font-family: -apple-system, sans-serif; background: #0a0a0c; padding: 32px 20px; color: #f0f0f8;">
    <div style="max-width: 480px; margin: 0 auto;">
      <p style="color: rgba(255,255,255,0.4); font-size: 12px; letter-spacing: 0.06em; text-transform: uppercase; margin: 0 0 8px;">${shopName} · Daily Brief</p>
      <h1 style="font-size: 22px; font-weight: 800; margin: 0 0 12px;">Good morning, ${ownerFirstName}</h1>
      <p style="color: rgba(255,255,255,0.6); font-size: 14px; line-height: 1.6; margin: 0 0 24px;">${summary}</p>

      ${needsYouText ? `
      <div style="background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.2); border-radius: 12px; padding: 14px 16px; margin-bottom: 20px;">
        <p style="color: rgb(248,113,113); font-size: 12px; font-weight: 700; margin: 0 0 4px;">NEEDS YOU</p>
        <p style="color: rgba(255,255,255,0.75); font-size: 13px; margin: 0;">${needsYouText}</p>
      </div>` : ""}

      <table width="100%" style="border-collapse: separate; border-spacing: 8px 0; margin-bottom: 16px;">
        <tr>
          <td style="background: rgba(255,255,255,0.03); border-radius: 10px; padding: 12px 14px; width: 33%;">
            <p style="color: rgba(255,255,255,0.35); font-size: 10px; text-transform: uppercase; margin: 0 0 4px;">Yesterday</p>
            <p style="color: #fff; font-size: 16px; font-weight: 800; margin: 0;">${fmtPrice(yesterday.revenue)}</p>
          </td>
          <td style="background: rgba(255,255,255,0.03); border-radius: 10px; padding: 12px 14px; width: 33%;">
            <p style="color: rgba(255,255,255,0.35); font-size: 10px; text-transform: uppercase; margin: 0 0 4px;">Bookings</p>
            <p style="color: #fff; font-size: 16px; font-weight: 800; margin: 0;">${yesterday.bookings}</p>
          </td>
          <td style="background: rgba(255,255,255,0.03); border-radius: 10px; padding: 12px 14px; width: 33%;">
            <p style="color: rgba(255,255,255,0.35); font-size: 10px; text-transform: uppercase; margin: 0 0 4px;">Cancelled</p>
            <p style="color: #fff; font-size: 16px; font-weight: 800; margin: 0;">${yesterday.cancellations}</p>
          </td>
        </tr>
      </table>

      <table width="100%" style="border-collapse: separate; border-spacing: 8px 0; margin-bottom: 20px;">
        <tr>
          <td style="background: rgba(255,255,255,0.03); border-radius: 10px; padding: 12px 14px; width: 50%;">
            <p style="color: rgba(255,255,255,0.35); font-size: 10px; text-transform: uppercase; margin: 0 0 4px;">Today's bookings</p>
            <p style="color: #fff; font-size: 16px; font-weight: 800; margin: 0;">${today.bookingsCount}</p>
          </td>
          <td style="background: rgba(255,255,255,0.03); border-radius: 10px; padding: 12px 14px; width: 50%;">
            <p style="color: rgba(255,255,255,0.35); font-size: 10px; text-transform: uppercase; margin: 0 0 4px;">Revenue scheduled</p>
            <p style="color: #fff; font-size: 16px; font-weight: 800; margin: 0;">${fmtPrice(today.revenueScheduled)}</p>
          </td>
        </tr>
      </table>

      ${autopilot && autopilot.actionsCount > 0 ? `
      <table width="100%" style="border-collapse: separate; border-spacing: 8px 0; margin-bottom: 4px;">
        <tr>
          <td style="background: rgba(109,40,217,0.08); border-radius: 10px; padding: 12px 14px; width: 50%;">
            <p style="color: rgba(196,181,253,0.6); font-size: 10px; text-transform: uppercase; margin: 0 0 4px;">AutoPilot actions</p>
            <p style="color: #fff; font-size: 16px; font-weight: 800; margin: 0;">${autopilot.actionsCount}</p>
          </td>
          <td style="background: rgba(109,40,217,0.08); border-radius: 10px; padding: 12px 14px; width: 50%;">
            <p style="color: rgba(196,181,253,0.6); font-size: 10px; text-transform: uppercase; margin: 0 0 4px;">Revenue recovered</p>
            <p style="color: #fff; font-size: 16px; font-weight: 800; margin: 0;">${fmtPrice(autopilot.revenue)}</p>
          </td>
        </tr>
      </table>` : ""}
    </div>
  </div>`;
}

Deno.serve(async () => {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayEnd = new Date(todayStart.getTime() + MS_PER_DAY);
  const yesterdayStart = new Date(todayStart.getTime() - MS_PER_DAY);
  const historyStart = new Date(now.getTime() - 120 * MS_PER_DAY);

  const { data: shops, error } = await supabase
    .from("shops")
    .select("id, owner_id, name, daily_brief_email_enabled")
    .eq("daily_brief_email_enabled", true);

  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 });

  let sent = 0;
  let failed = 0;
  const errors: string[] = [];

  for (const shop of shops ?? []) {
    try {
      const { data: apptsRaw } = await supabase
        .from("appointments")
        .select("id, client_name, client_phone, client_email, starts_at, price, status")
        .eq("shop_id", shop.id)
        .gte("starts_at", historyStart.toISOString())
        .lte("starts_at", todayEnd.toISOString());

      const appts = (apptsRaw ?? []) as Appt[];

      const yesterdayAppts = appts.filter(a => {
        const t = new Date(a.starts_at);
        return t >= yesterdayStart && t < todayStart;
      });
      const todayAppts = appts.filter(a => {
        const t = new Date(a.starts_at);
        return t >= todayStart && t < todayEnd;
      });

      const yesterdayRevenue = yesterdayAppts.filter(a => a.status === "completed").reduce((s, a) => s + Number(a.price), 0);
      const yesterdayBookings = yesterdayAppts.filter(a => a.status !== "cancelled").length;
      const yesterdayCancellations = yesterdayAppts.filter(a => a.status === "cancelled").length;

      const activeTodayAppts = todayAppts.filter(a => a.status !== "cancelled");
      const todayBookingsCount = activeTodayAppts.length;
      const todayRevenueScheduled = activeTodayAppts.reduce((s, a) => s + Number(a.price), 0);

      // Overdue/churn-risk win-back candidate: simplified inline version of deriveClients' tagging.
      const groups = new Map<string, Appt[]>();
      for (const a of appts) {
        if (a.status === "cancelled") continue;
        const key = keyFor(a);
        if (!groups.has(key)) groups.set(key, []);
        groups.get(key)!.push(a);
      }
      let needsYouText: string | null = null;
      let maxOverdueDays = 0;
      for (const [, list] of groups) {
        const completed = list.filter(a => a.status === "completed").sort((a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime());
        if (completed.length < 2) continue;
        const gaps: number[] = [];
        for (let i = 1; i < completed.length; i++) {
          gaps.push((new Date(completed[i].starts_at).getTime() - new Date(completed[i - 1].starts_at).getTime()) / MS_PER_DAY);
        }
        const avgInterval = gaps.reduce((s, g) => s + g, 0) / gaps.length;
        const last = completed[completed.length - 1];
        const daysSince = (now.getTime() - new Date(last.starts_at).getTime()) / MS_PER_DAY;
        if (avgInterval > 0 && daysSince > avgInterval * 2.5 && daysSince > maxOverdueDays) {
          maxOverdueDays = daysSince;
          needsYouText = `${last.client_name} hasn't booked in ${Math.round(daysSince)}d — send a win-back offer`;
        }
      }

      const summary = todayBookingsCount === 0 && yesterdayBookings === 0
        ? "Quiet stretch — no bookings yesterday or today yet."
        : `Yesterday you ${yesterdayRevenue > 0 ? `earned ${fmtPrice(yesterdayRevenue)}` : "had no completed revenue"}. Today you have ${todayBookingsCount} booking${todayBookingsCount === 1 ? "" : "s"} scheduled.`;

      const { data: autopilotEventsRaw } = await supabase
        .from("autopilot_events")
        .select("amount")
        .eq("shop_id", shop.id)
        .gte("created_at", yesterdayStart.toISOString())
        .lt("created_at", todayStart.toISOString());
      const autopilotEvents = autopilotEventsRaw ?? [];
      const autopilot = { actionsCount: autopilotEvents.length, revenue: autopilotEvents.reduce((s, e) => s + Number(e.amount ?? 0), 0) };

      const { data: userRes } = await supabase.auth.admin.getUserById(shop.owner_id);
      const email = userRes?.user?.email;
      if (!email) { errors.push(`${shop.name}: owner has no email`); failed++; continue; }
      const ownerFirstName = (email.split("@")[0] || "there").replace(/[^a-zA-Z]/g, "") || "there";

      const html = renderEmail({
        shopName: shop.name,
        ownerFirstName: ownerFirstName.charAt(0).toUpperCase() + ownerFirstName.slice(1),
        summary,
        yesterday: { revenue: yesterdayRevenue, bookings: yesterdayBookings, cancellations: yesterdayCancellations },
        today: { bookingsCount: todayBookingsCount, revenueScheduled: todayRevenueScheduled },
        needsYouText,
        autopilot,
      });

      const { error: sendError } = await resend.emails.send({ from: FROM, to: email, subject: `Your daily brief — ${shop.name}`, html });
      if (sendError) {
        errors.push(`${shop.name}: ${sendError.message}`);
        failed++;
      } else {
        sent++;
      }
    } catch (err) {
      errors.push(`${shop.name}: ${err instanceof Error ? err.message : "Unknown error"}`);
      failed++;
    }
  }

  return new Response(JSON.stringify({ shops: (shops ?? []).length, sent, failed, errors }), {
    headers: { "Content-Type": "application/json" },
  });
});
