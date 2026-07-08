import { Resend } from "resend";

const FROM = process.env.RESEND_FROM_EMAIL ?? "FlatPurse Flow <onboarding@resend.dev>";

function client() {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    throw new Error(
      "RESEND_API_KEY is not set — add it to .env.local before sending email.",
    );
  }
  return new Resend(key);
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
  return client().emails.send({ from: FROM, to, subject, html });
}

export async function sendStaffInviteEmail(to: string, input: { shopName: string; inviteUrl: string }) {
  return client().emails.send({
    from: FROM,
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

export async function sendOtpEmail(email: string, code: string, firstName: string) {
  await client().emails.send({
    from: FROM,
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
