import { Resend } from "resend";

const FROM = process.env.RESEND_FROM_EMAIL ?? "FLOWBYFFP <onboarding@resend.dev>";

function client() {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    throw new Error(
      "RESEND_API_KEY is not set — add it to .env.local before sending email.",
    );
  }
  return new Resend(key);
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
