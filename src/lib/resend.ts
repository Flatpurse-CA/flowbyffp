import { Resend } from "resend";
import { createAdminClient } from "@/lib/supabase/admin";

const FROM = process.env.RESEND_FROM_EMAIL ?? "FlatPurse Flow <onboarding@resend.dev>";

function client(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

// Never throws — callers destructure `{ error }` the same way the Resend SDK
// itself responds, whether the failure is a missing API key or a real send error.
async function send(payload: { to: string; subject: string; html: string; attachments?: { filename: string; content: string; contentType?: string }[] }) {
  const c = client();
  if (!c) {
    return {
      data: null,
      error: { name: "config_error", message: "RESEND_API_KEY is not set, add it to .env.local (or the deployment's env vars) before sending email." },
    };
  }
  return c.emails.send({ from: FROM, ...payload });
}

function icsEscape(text: string) {
  return text.replace(/\\/g, "\\\\").replace(/,/g, "\\,").replace(/;/g, "\\;").replace(/\n/g, "\\n");
}

function icsDate(date: Date) {
  return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
}

function buildBookingIcs(input: { appointmentId: string; shopName: string; serviceName: string; startsAt: string; durationMinutes: number; location: string }) {
  const start = new Date(input.startsAt);
  const end = new Date(start.getTime() + input.durationMinutes * 60000);
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//FlatPurse Flow//Booking//EN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${input.appointmentId}@flow.flatpurse.com`,
    `DTSTAMP:${icsDate(new Date())}`,
    `DTSTART:${icsDate(start)}`,
    `DTEND:${icsDate(end)}`,
    `SUMMARY:${icsEscape(`${input.serviceName} at ${input.shopName}`)}`,
    ...(input.location ? [`LOCATION:${icsEscape(input.location)}`] : []),
    `DESCRIPTION:${icsEscape(`Booking with ${input.shopName}`)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  return lines.join("\r\n");
}

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  return send({ to, subject, html });
}

// ─── Editable transactional templates ──────────────────────────────────────
//
// Every email below has its subject/heading/body/CTA button text stored in
// the `email_templates` table (migration 0041) and editable from
// /admin/email-templates. The actual data (dates, addresses, codes, links)
// and every CTA's destination URL stay code-driven — those are either
// security-sensitive (password reset/invite links) or computed per-send, not
// something an admin should be able to retype. `{{token}}` placeholders in
// the stored copy are filled in from `vars` at send time.
//
// DEFAULT_TEMPLATES mirrors the migration's seed data exactly, so a missing
// row (fresh DB, or the table temporarily unreachable) falls back to the same
// copy that shipped originally instead of sending a broken/empty email.

export type EmailTemplateKey =
  | "otp" | "password_reset" | "staff_invite" | "booking_request_received"
  | "welcome" | "password_changed" | "booking_confirmed" | "booking_declined"
  | "booking_cancelled" | "booking_rescheduled" | "appointment_reminder"
  | "no_show" | "review_request" | "new_booking_alert" | "staff_activated";

export type EmailTemplateContent = { subject: string; heading: string; body: string; cta_label: string | null };

export const EMAIL_TEMPLATE_INFO: Record<EmailTemplateKey, { label: string; description: string; tokens: string[]; hasCta: boolean }> = {
  otp:                       { label: "Verification code",         description: "Sent during signup with the 6-digit sign-in code.",              tokens: ["firstName", "code"],                              hasCta: false },
  password_reset:            { label: "Forgot / reset password",   description: "Sent when someone requests a password reset link.",              tokens: [],                                                  hasCta: true  },
  staff_invite:              { label: "Staff invite",               description: "Sent to a new team member when the owner invites them.",         tokens: ["shopName"],                                        hasCta: true  },
  booking_request_received:  { label: "Booking request received",  description: "Sent to the client right after they request a booking.",         tokens: ["serviceName", "stylistLine", "shopName"],          hasCta: false },
  welcome:                   { label: "Welcome",                    description: "Sent after signup finishes, to owners and customers alike.",     tokens: ["firstName"],                                       hasCta: false },
  password_changed:          { label: "Password changed",          description: "Sent right after a password change, as a security notice.",      tokens: ["firstName"],                                       hasCta: false },
  booking_confirmed:         { label: "Booking confirmed",         description: "Sent to the client when the shop confirms their booking.",       tokens: ["serviceName", "stylistLine", "shopName"],          hasCta: false },
  booking_declined:          { label: "Booking declined",          description: "Sent when the shop declines a still-pending booking request.",   tokens: ["shopName", "serviceName", "when"],                 hasCta: false },
  booking_cancelled:         { label: "Booking cancelled",         description: "Sent when a confirmed booking is cancelled, by shop or client.", tokens: ["serviceName", "shopName", "when", "cancelledBySuffix"], hasCta: false },
  booking_rescheduled:       { label: "Booking rescheduled",       description: "Sent to the client when the shop moves their appointment.",       tokens: ["serviceName", "stylistLine", "shopName"],          hasCta: false },
  appointment_reminder:      { label: "Appointment reminder",      description: "Sent ~24h before a confirmed appointment.",                       tokens: ["serviceName", "stylistLine", "shopName"],          hasCta: false },
  no_show:                   { label: "No-show notice",            description: "Sent to the client when the shop marks them as a no-show.",       tokens: ["serviceName", "shopName", "when"],                 hasCta: false },
  review_request:            { label: "Review request",            description: "Sent to the client after their appointment is completed.",        tokens: ["shopName"],                                        hasCta: true  },
  new_booking_alert:         { label: "New booking alert",         description: "Sent to the shop owner whenever a client books online.",          tokens: ["clientName", "serviceName", "stylistLine"],        hasCta: true  },
  staff_activated:           { label: "Staff account activated",   description: "Sent to a staff member after they set their password.",           tokens: ["firstName", "shopName"],                           hasCta: false },
};

const DEFAULT_TEMPLATES: Record<EmailTemplateKey, EmailTemplateContent> = {
  otp: {
    subject: "{{code}} is your FlatPurse Flow verification code",
    heading: "Hi {{firstName}},",
    body: "Your verification code is:",
    cta_label: null,
  },
  password_reset: {
    subject: "Reset your FlatPurse Flow password",
    heading: "Reset your password",
    body: "We got a request to reset your password. Click below to choose a new one.",
    cta_label: "Reset password",
  },
  staff_invite: {
    subject: "You've been invited to join {{shopName}} on FlatPurse Flow",
    heading: "You're invited to join {{shopName}}",
    body: "Your shop has added you as a team member on FlatPurse Flow. Set your password to get access to your bookings.",
    cta_label: "Set your password",
  },
  booking_request_received: {
    subject: "Booking request received: {{shopName}}",
    heading: "Your booking request is in",
    body: "{{serviceName}}{{stylistLine}} at {{shopName}}.\n\nThe shop will confirm shortly. You can view or cancel this booking anytime from your account.",
    cta_label: null,
  },
  welcome: {
    subject: "Welcome to FlatPurse Flow",
    heading: "Hi {{firstName}}, you're in",
    body: "Your account is set up and ready to go. Glad to have you on FlatPurse Flow.",
    cta_label: null,
  },
  password_changed: {
    subject: "Your FlatPurse Flow password was changed",
    heading: "Hi {{firstName}},",
    body: "Your password was just changed. If this was you, no action is needed.",
    cta_label: null,
  },
  booking_confirmed: {
    subject: "Booking confirmed: {{shopName}}",
    heading: "Your booking is confirmed",
    body: "{{serviceName}}{{stylistLine}} at {{shopName}}.",
    cta_label: null,
  },
  booking_declined: {
    subject: "Your booking request at {{shopName}} was declined",
    heading: "Booking request declined",
    body: "{{shopName}} wasn't able to take your {{serviceName}} request for {{when}}.\n\nYou can pick another time from their booking page.",
    cta_label: null,
  },
  booking_cancelled: {
    subject: "Your appointment at {{shopName}} was cancelled",
    heading: "Appointment cancelled",
    body: "Your {{serviceName}} appointment at {{shopName}} on {{when}} has been cancelled{{cancelledBySuffix}}.\n\nYou can book a new time anytime from their booking page.",
    cta_label: null,
  },
  booking_rescheduled: {
    subject: "Your booking at {{shopName}} was moved",
    heading: "Your booking was rescheduled",
    body: "{{serviceName}}{{stylistLine}} at {{shopName}} has a new time.",
    cta_label: null,
  },
  appointment_reminder: {
    subject: "Reminder: {{serviceName}} tomorrow at {{shopName}}",
    heading: "See you tomorrow",
    body: "Reminder for your {{serviceName}}{{stylistLine}} at {{shopName}}.",
    cta_label: null,
  },
  no_show: {
    subject: "We missed you at {{shopName}}",
    heading: "Sorry we missed you",
    body: "You were booked in for {{serviceName}} at {{shopName}} on {{when}}, but the shop marked it as a no-show.\n\nIf this was a mistake, reach out to the shop directly. Otherwise, feel free to book again anytime.",
    cta_label: null,
  },
  review_request: {
    subject: "How was your visit to {{shopName}}?",
    heading: "How did it go?",
    body: "Thanks for visiting {{shopName}}. Got a minute to leave a review? It helps the shop a lot.",
    cta_label: "Leave a review",
  },
  new_booking_alert: {
    subject: "New booking: {{clientName}} — {{serviceName}}",
    heading: "New booking request",
    body: "{{clientName}} requested {{serviceName}}{{stylistLine}}.",
    cta_label: "View in dashboard",
  },
  staff_activated: {
    subject: "You're all set at {{shopName}}",
    heading: "Hi {{firstName}}, you're in",
    body: "Your account is active — you can now log in and see your bookings at {{shopName}}.",
    cta_label: null,
  },
};

export async function getEmailTemplate(key: EmailTemplateKey): Promise<EmailTemplateContent> {
  try {
    const admin = createAdminClient();
    const { data } = await admin.from("email_templates").select("subject, heading, body, cta_label").eq("key", key).maybeSingle();
    if (data) return data as EmailTemplateContent;
  } catch {
    // Falls through to the shipped default — e.g. before migration 0041 has been applied.
  }
  return DEFAULT_TEMPLATES[key];
}

export function getDefaultEmailTemplate(key: EmailTemplateKey): EmailTemplateContent {
  return DEFAULT_TEMPLATES[key];
}

function fillText(text: string, vars: Record<string, string>): string {
  return text.replace(/\{\{(\w+)\}\}/g, (_, k: string) => vars[k] ?? "");
}

function escapeHtml(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// Stored template bodies are plain text (escaped on render, never raw HTML) —
// a blank line starts a new paragraph, matching how the copy reads in the
// admin's plain textarea.
function paragraphsHtml(text: string): string {
  return text
    .split(/\n\s*\n/)
    .map(p => p.trim())
    .filter(Boolean)
    .map(p => `<p style="color: #444; font-size: 14px; line-height: 1.6; margin: 0 0 12px;">${escapeHtml(p)}</p>`)
    .join("");
}

function ctaHtml(label: string | null | undefined, url: string | undefined): string {
  if (!label || !url) return "";
  return `
    <p style="margin: 28px 0;">
      <a href="${url}" style="background: #6d28d9; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">
        ${escapeHtml(label)}
      </a>
    </p>`;
}

function renderShell(input: { heading: string; bodyHtml: string; extraHtml?: string; ctaHtml?: string; footerHtml?: string }) {
  return `
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
      <h1 style="font-size: 20px;">${escapeHtml(input.heading)}</h1>
      ${input.bodyHtml}
      ${input.extraHtml ?? ""}
      ${input.ctaHtml ?? ""}
      ${input.footerHtml ?? ""}
    </div>
  `;
}

async function renderTemplate(key: EmailTemplateKey, vars: Record<string, string>, opts: { ctaUrl?: string; extraHtml?: string; footerHtml?: string } = {}) {
  const t = await getEmailTemplate(key);
  const subject = fillText(t.subject, vars);
  const heading = fillText(t.heading, vars);
  const bodyHtml = paragraphsHtml(fillText(t.body, vars));
  const ctaLabel = t.cta_label?.trim() || DEFAULT_TEMPLATES[key].cta_label;
  const html = renderShell({
    heading,
    bodyHtml,
    extraHtml: opts.extraHtml,
    ctaHtml: ctaHtml(ctaLabel, opts.ctaUrl),
    footerHtml: opts.footerHtml,
  });
  return { subject, html };
}

function apptDataBlock(input: {
  when: string; address: string; mapsUrl: string | null; appointmentId?: string; shopPhone?: string | null;
}): string {
  return `
    <p style="font-size: 16px; font-weight: 700; margin: 20px 0 4px;">${input.when}</p>
    ${input.address ? `<p style="color: #666; font-size: 13px; margin: 0 0 20px;">${input.mapsUrl ? `<a href="${input.mapsUrl}" style="color: #6d28d9; text-decoration: none;">${input.address}</a>` : input.address}</p>` : ""}
    ${input.appointmentId ? `<p style="color: #999; font-size: 12px; margin-top: 24px;">Booking ID: ${input.appointmentId}</p>` : ""}
    ${input.shopPhone ? `<p style="color: #999; font-size: 12px; margin: 4px 0 0;">${input.shopPhone}</p>` : ""}
  `;
}

function formatApptWhen(startsAt: string) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Edmonton", weekday: "long", month: "long", day: "numeric", hour: "numeric", minute: "2-digit", timeZoneName: "short",
  }).format(new Date(startsAt));
}

function formatShopAddress(input: { streetAddress?: string | null; city?: string | null; province?: string | null }) {
  const address = [input.streetAddress, input.city, input.province].filter(Boolean).join(", ");
  const mapsUrl = address ? `https://maps.google.com/?q=${encodeURIComponent(address)}` : null;
  return { address, mapsUrl };
}

const stylistLine = (name: string | null) => name ? ` with ${name}` : "";

export async function sendPasswordResetEmail(to: string, input: { resetUrl: string }) {
  const { subject, html } = await renderTemplate("password_reset", {}, {
    ctaUrl: input.resetUrl,
    footerHtml: `<p style="color: #999; font-size: 12px;">If you didn't request this, you can ignore this email.</p>`,
  });
  return send({ to, subject, html });
}

export async function sendStaffInviteEmail(to: string, input: { shopName: string; inviteUrl: string }) {
  const { subject, html } = await renderTemplate("staff_invite", { shopName: input.shopName }, {
    ctaUrl: input.inviteUrl,
    footerHtml: `<p style="color: #999; font-size: 12px;">If you weren't expecting this, you can ignore this email.</p>`,
  });
  return send({ to, subject, html });
}

export async function sendBookingConfirmationEmail(to: string, input: {
  appointmentId: string; shopName: string; serviceName: string; startsAt: string; durationMinutes: number; stylistName: string | null;
  streetAddress?: string | null; city?: string | null; province?: string | null; shopPhone?: string | null;
}) {
  const when = formatApptWhen(input.startsAt);
  const { address, mapsUrl } = formatShopAddress(input);

  const ics = buildBookingIcs({
    appointmentId: input.appointmentId, shopName: input.shopName, serviceName: input.serviceName,
    startsAt: input.startsAt, durationMinutes: input.durationMinutes, location: address,
  });

  const { subject, html } = await renderTemplate("booking_request_received", {
    serviceName: input.serviceName, stylistLine: stylistLine(input.stylistName), shopName: input.shopName,
  }, {
    extraHtml: apptDataBlock({ when, address, mapsUrl, appointmentId: input.appointmentId, shopPhone: input.shopPhone ? `${input.shopName}: ${input.shopPhone}` : null }),
  });

  return send({ to, subject, html, attachments: [{ filename: "booking.ics", content: Buffer.from(ics).toString("base64"), contentType: "text/calendar" }] });
}

export async function sendOtpEmail(email: string, code: string, firstName: string) {
  // The code itself is always rendered the same prominent way — not admin-editable
  // copy — so it's passed as extraHtml, same slot the booking emails use for their data block.
  const { subject, html } = await renderTemplate("otp", { firstName, code }, {
    extraHtml: `<p style="font-size: 32px; font-weight: 700; letter-spacing: 4px;">${escapeHtml(code)}</p>`,
    footerHtml: `<p style="color: #666; font-size: 14px;">This code expires shortly. If you didn't request this, you can ignore this email.</p>`,
  });
  return send({ to: email, subject, html });
}

export async function sendWelcomeEmail(to: string, input: { firstName: string }) {
  const { subject, html } = await renderTemplate("welcome", { firstName: input.firstName });
  return send({ to, subject, html });
}

export async function sendPasswordChangedEmail(to: string, input: { firstName?: string } = {}) {
  const { subject, html } = await renderTemplate("password_changed", { firstName: input.firstName ?? "there" }, {
    footerHtml: `<p style="color: #999; font-size: 12px;">If you didn't make this change, contact us right away.</p>`,
  });
  return send({ to, subject, html });
}

export async function sendBookingConfirmedEmail(to: string, input: {
  appointmentId: string; shopName: string; serviceName: string; startsAt: string; durationMinutes: number; stylistName: string | null;
  streetAddress?: string | null; city?: string | null; province?: string | null; shopPhone?: string | null;
}) {
  const when = formatApptWhen(input.startsAt);
  const { address, mapsUrl } = formatShopAddress(input);

  const ics = buildBookingIcs({
    appointmentId: input.appointmentId, shopName: input.shopName, serviceName: input.serviceName,
    startsAt: input.startsAt, durationMinutes: input.durationMinutes, location: address,
  });

  const { subject, html } = await renderTemplate("booking_confirmed", {
    serviceName: input.serviceName, stylistLine: stylistLine(input.stylistName), shopName: input.shopName,
  }, {
    extraHtml: apptDataBlock({ when, address, mapsUrl, appointmentId: input.appointmentId, shopPhone: input.shopPhone ? `${input.shopName}: ${input.shopPhone}` : null }),
  });

  return send({ to, subject, html, attachments: [{ filename: "booking.ics", content: Buffer.from(ics).toString("base64"), contentType: "text/calendar" }] });
}

export async function sendBookingDeclinedEmail(to: string, input: { shopName: string; serviceName: string; startsAt: string }) {
  const when = formatApptWhen(input.startsAt);
  const { subject, html } = await renderTemplate("booking_declined", { shopName: input.shopName, serviceName: input.serviceName, when });
  return send({ to, subject, html });
}

export async function sendBookingCancelledEmail(to: string, input: { shopName: string; serviceName: string; startsAt: string; cancelledBy: "shop" | "you" }) {
  const when = formatApptWhen(input.startsAt);
  const { subject, html } = await renderTemplate("booking_cancelled", {
    serviceName: input.serviceName, shopName: input.shopName, when,
    cancelledBySuffix: input.cancelledBy === "shop" ? " by the shop" : "",
  });
  return send({ to, subject, html });
}

export async function sendBookingRescheduledEmail(to: string, input: {
  appointmentId: string; shopName: string; serviceName: string; startsAt: string; durationMinutes: number; stylistName: string | null;
  streetAddress?: string | null; city?: string | null; province?: string | null; shopPhone?: string | null;
}) {
  const when = formatApptWhen(input.startsAt);
  const { address, mapsUrl } = formatShopAddress(input);

  const ics = buildBookingIcs({
    appointmentId: input.appointmentId, shopName: input.shopName, serviceName: input.serviceName,
    startsAt: input.startsAt, durationMinutes: input.durationMinutes, location: address,
  });

  const { subject, html } = await renderTemplate("booking_rescheduled", {
    serviceName: input.serviceName, stylistLine: stylistLine(input.stylistName), shopName: input.shopName,
  }, {
    extraHtml: apptDataBlock({ when, address, mapsUrl, appointmentId: input.appointmentId, shopPhone: input.shopPhone ? `${input.shopName}: ${input.shopPhone}` : null }),
  });

  return send({ to, subject, html, attachments: [{ filename: "booking.ics", content: Buffer.from(ics).toString("base64"), contentType: "text/calendar" }] });
}

export async function sendAppointmentReminderEmail(to: string, input: {
  shopName: string; serviceName: string; startsAt: string; stylistName: string | null;
  streetAddress?: string | null; city?: string | null; province?: string | null; shopPhone?: string | null;
}) {
  const when = formatApptWhen(input.startsAt);
  const { address, mapsUrl } = formatShopAddress(input);

  const { subject, html } = await renderTemplate("appointment_reminder", {
    serviceName: input.serviceName, stylistLine: stylistLine(input.stylistName), shopName: input.shopName,
  }, {
    extraHtml: apptDataBlock({ when, address, mapsUrl, shopPhone: input.shopPhone ? `${input.shopName}: ${input.shopPhone}` : null }),
  });

  return send({ to, subject, html });
}

export async function sendNoShowEmail(to: string, input: { shopName: string; serviceName: string; startsAt: string }) {
  const when = formatApptWhen(input.startsAt);
  const { subject, html } = await renderTemplate("no_show", { serviceName: input.serviceName, shopName: input.shopName, when });
  return send({ to, subject, html });
}

export async function sendReviewRequestEmail(to: string, input: { shopName: string; reviewUrl: string }) {
  const { subject, html } = await renderTemplate("review_request", { shopName: input.shopName }, { ctaUrl: input.reviewUrl });
  return send({ to, subject, html });
}

export async function sendNewBookingAlertEmail(to: string, input: {
  clientName: string; serviceName: string; startsAt: string; stylistName: string | null; dashboardUrl: string;
}) {
  const when = formatApptWhen(input.startsAt);
  const { subject, html } = await renderTemplate("new_booking_alert", {
    clientName: input.clientName, serviceName: input.serviceName, stylistLine: stylistLine(input.stylistName),
  }, {
    ctaUrl: input.dashboardUrl,
    extraHtml: `<p style="font-size: 16px; font-weight: 700; margin: 20px 0;">${when}</p>`,
  });
  return send({ to, subject, html });
}

export async function sendStaffActivatedEmail(to: string, input: { shopName: string; firstName: string }) {
  const { subject, html } = await renderTemplate("staff_activated", { firstName: input.firstName, shopName: input.shopName });
  return send({ to, subject, html });
}

// ─── Admin preview / test-send ──────────────────────────────────────────────
//
// Renders a template with realistic made-up data so /admin/email-templates
// can show a live preview and fire a real test send — using whatever copy is
// currently saved (or the default, if unedited), same rendering path as the
// real send functions above. CTA links are dummy URLs (no real reset token,
// invite, etc. exists for a preview), clearly fake but structurally correct.

const SAMPLE_WHEN = formatApptWhen(new Date(Date.now() + 26 * 60 * 60 * 1000).toISOString());
const SAMPLE_ADDRESS_BLOCK = { address: "123 Main St, Edmonton, AB", mapsUrl: "https://maps.google.com/?q=123+Main+St", shopPhone: "Luxe Hair Studio: (780) 555-0142" };

async function buildPreview(key: EmailTemplateKey): Promise<{ subject: string; html: string }> {
  switch (key) {
    case "otp":
      return renderTemplate(key, { firstName: "Jordan", code: "482913" }, {
        extraHtml: `<p style="font-size: 32px; font-weight: 700; letter-spacing: 4px;">482913</p>`,
        footerHtml: `<p style="color: #666; font-size: 14px;">This code expires shortly. If you didn't request this, you can ignore this email.</p>`,
      });
    case "password_reset":
      return renderTemplate(key, {}, {
        ctaUrl: "https://flow.flatpurse.com/reset-password?token=sample",
        footerHtml: `<p style="color: #999; font-size: 12px;">If you didn't request this, you can ignore this email.</p>`,
      });
    case "staff_invite":
      return renderTemplate(key, { shopName: "Luxe Hair Studio" }, {
        ctaUrl: "https://flow.flatpurse.com/staff/set-password?token=sample",
        footerHtml: `<p style="color: #999; font-size: 12px;">If you weren't expecting this, you can ignore this email.</p>`,
      });
    case "booking_request_received":
    case "booking_confirmed":
    case "booking_rescheduled":
      return renderTemplate(key, { serviceName: "Signature Cut", stylistLine: " with Jordan", shopName: "Luxe Hair Studio" }, {
        extraHtml: apptDataBlock({ when: SAMPLE_WHEN, appointmentId: "sample-appt-id", ...SAMPLE_ADDRESS_BLOCK }),
      });
    case "welcome":
      return renderTemplate(key, { firstName: "Jordan" });
    case "password_changed":
      return renderTemplate(key, { firstName: "Jordan" }, {
        footerHtml: `<p style="color: #999; font-size: 12px;">If you didn't make this change, contact us right away.</p>`,
      });
    case "booking_declined":
      return renderTemplate(key, { shopName: "Luxe Hair Studio", serviceName: "Signature Cut", when: SAMPLE_WHEN });
    case "booking_cancelled":
      return renderTemplate(key, { serviceName: "Signature Cut", shopName: "Luxe Hair Studio", when: SAMPLE_WHEN, cancelledBySuffix: " by the shop" });
    case "appointment_reminder":
      return renderTemplate(key, { serviceName: "Signature Cut", stylistLine: " with Jordan", shopName: "Luxe Hair Studio" }, {
        extraHtml: apptDataBlock({ when: SAMPLE_WHEN, ...SAMPLE_ADDRESS_BLOCK }),
      });
    case "no_show":
      return renderTemplate(key, { serviceName: "Signature Cut", shopName: "Luxe Hair Studio", when: SAMPLE_WHEN });
    case "review_request":
      return renderTemplate(key, { shopName: "Luxe Hair Studio" }, { ctaUrl: "https://flow.flatpurse.com/book/luxe-hair-studio" });
    case "new_booking_alert":
      return renderTemplate(key, { clientName: "Alex Morgan", serviceName: "Signature Cut", stylistLine: " with Jordan" }, {
        ctaUrl: "https://flow.flatpurse.com/dashboard/appointments",
        extraHtml: `<p style="font-size: 16px; font-weight: 700; margin: 20px 0;">${SAMPLE_WHEN}</p>`,
      });
    case "staff_activated":
      return renderTemplate(key, { firstName: "Jordan", shopName: "Luxe Hair Studio" });
  }
}

export async function previewEmailTemplate(key: EmailTemplateKey): Promise<{ subject: string; html: string }> {
  return buildPreview(key);
}

export async function sendTestEmailTemplate(key: EmailTemplateKey, to: string) {
  const { subject, html } = await buildPreview(key);
  return send({ to, subject: `[TEST] ${subject}`, html });
}
