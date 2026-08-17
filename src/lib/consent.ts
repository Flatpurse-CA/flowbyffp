export const CONSENT_STORAGE_KEY = "ffp-cookie-consent";
export const CONSENT_CHANGE_EVENT = "ffp-cookie-consent-changed";

export function hasMarketingConsent(): boolean {
  try {
    return localStorage.getItem(CONSENT_STORAGE_KEY) === "accepted";
  } catch {
    return false;
  }
}
