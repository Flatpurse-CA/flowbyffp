// 24h appointment reminder — cron-triggered, same pattern as daily-brief-email.
// Meant to run hourly; the reminder_sent_at flag (migration 0039) stops a
// confirmed appointment from getting reminded more than once as the cron
// sweeps forward. Deno can't import the Next.js app's lib modules, so the
// email HTML mirrors src/lib/resend.ts's sendAppointmentReminderEmail —
// keep both in sync if the copy changes.

import { createClient } from "jsr:@supabase/supabase-js@2";
import { Resend } from "npm:resend";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

const resend = new Resend(Deno.env.get("RESEND_API_KEY")!);
const FROM = Deno.env.get("RESEND_FROM_EMAIL") ?? "FlatPurse Flow <onboarding@resend.dev>";

const MS_PER_HOUR = 60 * 60 * 1000;

function formatWhen(startsAt: string) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Edmonton", weekday: "long", month: "long", day: "numeric", hour: "numeric", minute: "2-digit", timeZoneName: "short",
  }).format(new Date(startsAt));
}

function renderEmail(input: {
  shopName: string; serviceName: string; stylistName: string | null; when: string;
  address: string; mapsUrl: string | null; shopPhone: string | null;
}) {
  return `
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
      <h1 style="font-size: 20px;">See you tomorrow</h1>
      <p style="color: #444; font-size: 14px; line-height: 1.6;">
        Reminder for your ${input.serviceName}${input.stylistName ? ` with ${input.stylistName}` : ""} at ${input.shopName}.
      </p>
      <p style="font-size: 16px; font-weight: 700; margin: 20px 0 4px;">${input.when}</p>
      ${input.address ? `<p style="color: #666; font-size: 13px; margin: 0 0 20px;">${input.mapsUrl ? `<a href="${input.mapsUrl}" style="color: #6d28d9; text-decoration: none;">${input.address}</a>` : input.address}</p>` : ""}
      ${input.shopPhone ? `<p style="color: #999; font-size: 12px; margin: 4px 0 0;">${input.shopName}: ${input.shopPhone}</p>` : ""}
    </div>
  `;
}

Deno.serve(async () => {
  const now = new Date();
  const windowStart = new Date(now.getTime() + 23 * MS_PER_HOUR);
  const windowEnd = new Date(now.getTime() + 25 * MS_PER_HOUR);

  const { data: appts, error } = await supabase
    .from("appointments")
    .select("id, shop_id, client_email, service_name, starts_at, stylist_name")
    .eq("status", "confirmed")
    .is("reminder_sent_at", null)
    .not("client_email", "is", null)
    .gte("starts_at", windowStart.toISOString())
    .lte("starts_at", windowEnd.toISOString());

  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 });

  let sent = 0;
  let failed = 0;
  const errors: string[] = [];

  for (const appt of appts ?? []) {
    try {
      const { data: shop } = await supabase
        .from("shops")
        .select("name, street_address, city, province, phone")
        .eq("id", appt.shop_id)
        .maybeSingle();
      if (!shop) continue;

      const address = [shop.street_address, shop.city, shop.province].filter(Boolean).join(", ");
      const mapsUrl = address ? `https://maps.google.com/?q=${encodeURIComponent(address)}` : null;

      const html = renderEmail({
        shopName: shop.name,
        serviceName: appt.service_name,
        stylistName: appt.stylist_name,
        when: formatWhen(appt.starts_at),
        address,
        mapsUrl,
        shopPhone: shop.phone,
      });

      const { error: sendError } = await resend.emails.send({
        from: FROM,
        to: appt.client_email,
        subject: `Reminder: ${appt.service_name} tomorrow at ${shop.name}`,
        html,
      });

      if (sendError) {
        errors.push(`${appt.id}: ${sendError.message}`);
        failed++;
        continue;
      }

      await supabase.from("appointments").update({ reminder_sent_at: new Date().toISOString() }).eq("id", appt.id);
      sent++;
    } catch (err) {
      errors.push(`${appt.id}: ${err instanceof Error ? err.message : "Unknown error"}`);
      failed++;
    }
  }

  return new Response(JSON.stringify({ candidates: (appts ?? []).length, sent, failed, errors }), {
    headers: { "Content-Type": "application/json" },
  });
});
