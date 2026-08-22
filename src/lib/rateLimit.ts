// In-memory sliding-window rate limiter. Good enough as a first layer against
// casual abuse (OTP spam, booking-form hammering) on a single long-running
// instance; it does NOT share state across serverless instances/regions, so
// under real multi-instance load a client could get up to N*instanceCount
// requests through. Upgrade to a shared store (Upstash Redis, Supabase table)
// if this ever needs to hold under distributed abuse.
const hits = new Map<string, number[]>();

// Prevents unbounded growth of `hits` from one-off keys (e.g. per-IP) that
// are never checked again.
const MAX_TRACKED_KEYS = 5000;

export function checkRateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const windowStart = now - windowMs;

  const timestamps = (hits.get(key) ?? []).filter(t => t > windowStart);

  if (timestamps.length >= limit) {
    hits.set(key, timestamps);
    return false;
  }

  timestamps.push(now);
  hits.set(key, timestamps);

  if (hits.size > MAX_TRACKED_KEYS) {
    const oldestAllowedKey = hits.keys().next().value;
    if (oldestAllowedKey !== undefined) hits.delete(oldestAllowedKey);
  }

  return true;
}
