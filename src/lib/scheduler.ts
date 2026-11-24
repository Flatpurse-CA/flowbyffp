import { createAdminClient } from "@/lib/supabase/admin";

/**
 * FL-004: local-time scheduler. Jobs are rows in scheduled_jobs with a UTC run_at
 * worked out from the shop's timezone; runDueJobs() claims and runs them.
 */
export const DEFAULT_TZ = "America/Edmonton";
export const QUIET_START_HOUR = 21; // no automated texts from 9pm
export const QUIET_END_HOUR = 8;    // until 8am, client's (shop's) local time

type Parts = { y: number; m: number; d: number; h: number; mi: number; wd: number };
const WD: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

export function localParts(date: Date, tz: string): Parts {
  const f = new Intl.DateTimeFormat("en-US", { timeZone: tz, year: "numeric", month: "numeric", day: "numeric", hour: "numeric", minute: "numeric", weekday: "short", hour12: false });
  const p = Object.fromEntries(f.formatToParts(date).map(x => [x.type, x.value]));
  return { y: +p.year, m: +p.month, d: +p.day, h: +p.hour % 24, mi: +p.minute, wd: WD[p.weekday] };
}

/** The UTC instant for a wall-clock time in `tz` (DST-safe to the minute). */
export function zonedTime(tz: string, y: number, m: number, d: number, h: number, mi = 0): Date {
  let guess = Date.UTC(y, m - 1, d, h, mi);
  for (let i = 0; i < 3; i++) {
    const p = localParts(new Date(guess), tz);
    const diff = Date.UTC(y, m - 1, d, h, mi) - Date.UTC(p.y, p.m - 1, p.d, p.h, p.mi);
    if (diff === 0) break;
    guess += diff;
  }
  return new Date(guess);
}

/** Next `weekday` (0=Sun) at `hour`:00 local time, strictly after `from`. E.g. Monday 7am recaps. */
export function nextWeekdayAt(tz: string, weekday: number, hour: number, from = new Date()): Date {
  const p = localParts(from, tz);
  for (let add = 0; add <= 7; add++) {
    const day = new Date(Date.UTC(p.y, p.m - 1, p.d + add));
    if (day.getUTCDay() !== weekday) continue;
    const t = zonedTime(tz, day.getUTCFullYear(), day.getUTCMonth() + 1, day.getUTCDate(), hour);
    if (t.getTime() > from.getTime()) return t;
  }
  const day = new Date(Date.UTC(p.y, p.m - 1, p.d + 7));
  return zonedTime(tz, day.getUTCFullYear(), day.getUTCMonth() + 1, day.getUTCDate(), hour);
}

export function inQuietHours(tz: string, at = new Date()): boolean {
  const h = localParts(at, tz).h;
  return h >= QUIET_START_HOUR || h < QUIET_END_HOUR;
}

/** Now if outside quiet hours, otherwise the next 8:00 am local time. */
export function nextSendWindow(tz: string, at = new Date()): Date {
  if (!inQuietHours(tz, at)) return at;
  const p = localParts(at, tz);
  const addDay = p.h >= QUIET_START_HOUR ? 1 : 0;
  const day = new Date(Date.UTC(p.y, p.m - 1, p.d + addDay));
  return zonedTime(tz, day.getUTCFullYear(), day.getUTCMonth() + 1, day.getUTCDate(), QUIET_END_HOUR);
}

export async function shopTimezone(shopId: string): Promise<string> {
  const { data } = await createAdminClient().from("shops").select("timezone").eq("id", shopId).maybeSingle();
  return (data?.timezone as string | null) ?? DEFAULT_TZ;
}

export async function enqueueJob(kind: string, runAt: Date, payload: Record<string, unknown>, opts: { shopId?: string | null; dedupeKey?: string } = {}) {
  const row = { kind, run_at: runAt.toISOString(), payload, shop_id: opts.shopId ?? null, dedupe_key: opts.dedupeKey ?? null };
  const q = createAdminClient().from("scheduled_jobs");
  const { error } = opts.dedupeKey ? await q.upsert(row, { onConflict: "dedupe_key", ignoreDuplicates: true }) : await q.insert(row);
  return { error: error?.message };
}

export type JobHandler = (payload: Record<string, unknown>, job: { id: string; shop_id: string | null }) => Promise<void>;
const MAX_ATTEMPTS = 3;

/** Claims due jobs and runs them. Failed jobs retry in 15 minutes, up to 3 tries. */
export async function runDueJobs(handlers: Record<string, JobHandler>, limit = 50) {
  const admin = createAdminClient();
  const { data: jobs } = await admin.rpc("claim_due_jobs", { p_limit: limit });
  const tally = { done: 0, failed: 0 };
  for (const job of (jobs ?? []) as { id: string; kind: string; payload: Record<string, unknown>; shop_id: string | null; attempts: number }[]) {
    const h = handlers[job.kind];
    try {
      if (!h) throw new Error(`No handler for ${job.kind}`);
      await h(job.payload, job);
      await admin.from("scheduled_jobs").update({ status: "done", finished_at: new Date().toISOString() }).eq("id", job.id);
      tally.done++;
    } catch (e) {
      const last = job.attempts >= MAX_ATTEMPTS;
      await admin.from("scheduled_jobs").update({
        status: last ? "failed" : "pending", last_error: e instanceof Error ? e.message : String(e),
        run_at: new Date(Date.now() + 15 * 60_000).toISOString(), ...(last ? { finished_at: new Date().toISOString() } : {}),
      }).eq("id", job.id);
      tally.failed++;
    }
  }
  return tally;
}
