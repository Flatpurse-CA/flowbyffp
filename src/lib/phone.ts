// Normalizes a typed phone number to E.164 ("+17805551234"), the format
// Twilio uses for the From number on inbound SMS. North American numbers
// without a country code are assumed (Flow is a Canadian product). Returns
// null when the input can't be confidently turned into a full number.
export function toE164(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  const digits = trimmed.replace(/\D/g, "");
  if (trimmed.startsWith("+")) return digits.length >= 8 && digits.length <= 15 ? `+${digits}` : null;
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  return null;
}

/** For storing: E.164 when parseable, otherwise the trimmed input (never drop what the client typed). */
export function normalizePhoneForStorage(raw: string | null | undefined): string | null {
  const trimmed = raw?.trim();
  if (!trimmed) return null;
  return toE164(trimmed) ?? trimmed;
}
