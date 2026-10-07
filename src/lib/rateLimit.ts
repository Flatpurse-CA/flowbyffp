import { headers } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";

// Rate limiting backed by the shared check_rate_limit() Postgres function
// (0043_rate_limits.sql), so a limit holds across every serverless instance.
// If that call fails (DB unreachable, migration not applied yet) it falls back
// to the per-instance in-memory limiter below rather than failing open entirely
// or locking everyone out.
export async function checkRateLimit(key: string, limit: number, windowMs: number): Promise<boolean> {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin.rpc("check_rate_limit", {
      p_key: key,
      p_limit: limit,
      p_window_seconds: Math.ceil(windowMs / 1000),
    });
    if (!error && typeof data === "boolean") return data;
  } catch {
    // Fall through to the in-memory limiter.
  }
  return checkMemoryRateLimit(key, limit, windowMs);
}

// Caller's IP as seen by Vercel's edge. Used alongside per-email keys so one
// client can't spray login attempts across many different emails.
export async function getClientIp(): Promise<string> {
  const h = await headers();
  return h.get("x-real-ip") ?? h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
}

// In-memory sliding-window fallback. Per-instance only.
const hits = new Map<string, number[]>();

// Prevents unbounded growth of `hits` from one-off keys (e.g. per-IP) that
// are never checked again.
const MAX_TRACKED_KEYS = 5000;

function checkMemoryRateLimit(key: string, limit: number, windowMs: number): boolean {
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
