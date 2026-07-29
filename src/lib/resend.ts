import { Resend } from "resend";

const FROM = process.env.RESEND_FROM_EMAIL ?? "FlatPurse Flow <onboarding@resend.dev>";

function client(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

// Never throws — callers destructure `{ error }` the same way the Resend SDK
// itself responds, whether the failure is a missing API key or a real send error.
async function send(payload: { to: string; subject: string; html: string }) {
  const c = client();
  if (!c) {
    return {
      data: null,
      error: { name: "config_error", message: "RESEND_API_KEY is not set — add it to .env.local (or the deployment's env vars) before sending email." },
    };
  }
  return c.emails.send({ from: FROM, ...payload });
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
    subject: "Reset your FLOWBYFFP password",
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
    subject: `You've been invited to join ${input.shopName} on FLOWBYFFP`,
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h1 style="font-size: 20px;">You're invited to join ${input.shopName}</h1>
        <p style="color: #444; font-size: 14px; line-height: 1.6;">
          Your shop has added you as a team member on FLOWBYFFP. Set your password to get access to your bookings.
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

export async function sendBookingConfirmationEmail(to: string, input: { shopName: string; serviceName: string; startsAt: string; stylistName: string | null }) {
  const when = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Edmonton", weekday: "long", month: "long", day: "numeric", hour: "numeric", minute: "2-digit",
  }).format(new Date(input.startsAt));

  return send({
    to,
    subject: `Booking request received — ${input.shopName}`,
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h1 style="font-size: 20px;">Your booking request is in</h1>
        <p style="color: #444; font-size: 14px; line-height: 1.6;">
          ${input.serviceName}${input.stylistName ? ` with ${input.stylistName}` : ""} at ${input.shopName}.
        </p>
        <p style="font-size: 16px; font-weight: 700; margin: 20px 0;">${when}</p>
        <p style="color: #444; font-size: 14px; line-height: 1.6;">
          The shop will confirm shortly. You can view or cancel this booking anytime from your account.
        </p>
      </div>
    `,
  });
}

export async function sendOtpEmail(email: string, code: string, firstName: string) {
  return send({
    to: email,
    subject: `${code} is your FLOWBYFFP verification code`,
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
