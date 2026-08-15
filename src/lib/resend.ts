import { Resend } from "resend";

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

export async function sendPasswordResetEmail(to: string, input: { resetUrl: string }) {
  return send({
    to,
    subject: "Reset your FlatPurse Flow password",
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h1 style="font-size: 20px;">Reset your password</h1>
        <p style="color: #444; font-size: 14px; line-height: 1.6;">
          We got a request to reset your password. Click below to choose a new one.
        </p>
        <p style="margin: 28px 0;">
          <a href="${input.resetUrl}" style="background: #6d28d9; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">
            Reset password
          </a>
        </p>
        <p style="color: #999; font-size: 12px;">If you didn't request this, you can ignore this email.</p>
      </div>
    `,
  });
}

export async function sendStaffInviteEmail(to: string, input: { shopName: string; inviteUrl: string }) {
  return send({
    to,
    subject: `You've been invited to join ${input.shopName} on FlatPurse Flow`,
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h1 style="font-size: 20px;">You're invited to join ${input.shopName}</h1>
        <p style="color: #444; font-size: 14px; line-height: 1.6;">
          Your shop has added you as a team member on FlatPurse Flow. Set your password to get access to your bookings.
        </p>
        <p style="margin: 28px 0;">
          <a href="${input.inviteUrl}" style="background: #6d28d9; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">
            Set your password
          </a>
        </p>
        <p style="color: #999; font-size: 12px;">If you weren't expecting this, you can ignore this email.</p>
      </div>
    `,
  });
}

export async function sendBookingConfirmationEmail(to: string, input: {
  appointmentId: string; shopName: string; serviceName: string; startsAt: string; durationMinutes: number; stylistName: string | null;
  streetAddress?: string | null; city?: string | null; province?: string | null; shopPhone?: string | null;
}) {
  const when = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Edmonton", weekday: "long", month: "long", day: "numeric", hour: "numeric", minute: "2-digit", timeZoneName: "short",
  }).format(new Date(input.startsAt));

  const addressParts = [input.streetAddress, input.city, input.province].filter(Boolean);
  const address = addressParts.join(", ");
  const mapsUrl = address ? `https://maps.google.com/?q=${encodeURIComponent(address)}` : null;

  const ics = buildBookingIcs({
    appointmentId: input.appointmentId,
    shopName: input.shopName,
    serviceName: input.serviceName,
    startsAt: input.startsAt,
    durationMinutes: input.durationMinutes,
    location: address,
  });

  return send({
    to,
    subject: `Booking request received: ${input.shopName}`,
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h1 style="font-size: 20px;">Your booking request is in</h1>
        <p style="color: #444; font-size: 14px; line-height: 1.6;">
          ${input.serviceName}${input.stylistName ? ` with ${input.stylistName}` : ""} at ${input.shopName}.
        </p>
        <p style="font-size: 16px; font-weight: 700; margin: 20px 0 4px;">${when}</p>
        ${address ? `<p style="color: #666; font-size: 13px; margin: 0 0 20px;">${mapsUrl ? `<a href="${mapsUrl}" style="color: #6d28d9; text-decoration: none;">${address}</a>` : address}</p>` : ""}
        <p style="color: #444; font-size: 14px; line-height: 1.6;">
          The shop will confirm shortly. You can view or cancel this booking anytime from your account.
        </p>
        <p style="color: #999; font-size: 12px; margin-top: 24px;">Booking ID: ${input.appointmentId}</p>
        ${input.shopPhone ? `<p style="color: #999; font-size: 12px; margin: 4px 0 0;">${input.shopName}: ${input.shopPhone}</p>` : ""}
      </div>
    `,
    attachments: [{ filename: "booking.ics", content: Buffer.from(ics).toString("base64"), contentType: "text/calendar" }],
  });
}

export async function sendOtpEmail(email: string, code: string, firstName: string) {
  return send({
    to: email,
    subject: `${code} is your FlatPurse Flow verification code`,
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h1 style="font-size: 20px;">Hi ${firstName},</h1>
        <p>Your verification code is:</p>
        <p style="font-size: 32px; font-weight: 700; letter-spacing: 4px;">${code}</p>
        <p style="color: #666; font-size: 14px;">This code expires shortly. If you didn't request this, you can ignore this email.</p>
      </div>
    `,
  });
}
