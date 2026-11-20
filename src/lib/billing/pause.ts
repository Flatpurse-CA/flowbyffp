/** Owner-paused plan (Stripe pause_collection): booking page and AutoPilot stop. */
export function isPausedNow(pausedUntil: string | null | undefined, now = Date.now()): boolean {
  return Boolean(pausedUntil && new Date(pausedUntil).getTime() > now);
}
