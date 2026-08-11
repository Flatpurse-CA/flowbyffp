import twilio from "twilio";

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_PHONE_NUMBER;

let client: ReturnType<typeof twilio> | null = null;
function getClient() {
  if (!accountSid || !authToken) throw new Error("Twilio is not configured (TWILIO_ACCOUNT_SID / TWILIO_AUTH_TOKEN missing)");
  if (!client) client = twilio(accountSid, authToken);
  return client;
}

export function twilioConfigured(): boolean {
  return Boolean(accountSid && authToken && fromNumber);
}

export async function sendSms(to: string, body: string): Promise<{ error?: string }> {
  if (!fromNumber) return { error: "TWILIO_PHONE_NUMBER is not configured" };
  try {
    await getClient().messages.create({ to, from: fromNumber, body });
    return {};
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to send SMS" };
  }
}

// Twilio signs every webhook request with an HMAC of the full request URL +
// sorted POST params, using the account's auth token — this is the only way
// to confirm an inbound "message received" POST actually came from Twilio
// and not a spoofed request hitting a public, unauthenticated endpoint.
export function validateTwilioSignature(url: string, params: Record<string, string>, signature: string | null): boolean {
  if (!authToken || !signature) return false;
  return twilio.validateRequest(authToken, signature, url, params);
}
