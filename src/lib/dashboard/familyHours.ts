// Pure Family Hours streak evaluation — a real behavioral signal (did any
// appointment land inside the protected window yesterday?), not a login streak.
// Idempotent per day via `lastCreditedDate` so calling this repeatedly in one
// day is a no-op. No Supabase import — reusable from Next.js and the Deno
// daily-brief function alike.

export const SHOP_TZ = "America/Edmonton"; // matches the TZ used for Bookings display

export type FamilyHoursConfig = {
  enabled: boolean;
  start: string; // "HH:MM"
  end: string; // "HH:MM"
  streak: number;
  lastCreditedDate: string | null; // "YYYY-MM-DD"
};

export type FamilyHoursAppointment = { starts_at: string; status: string };

export function localDateKey(d: Date) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: SHOP_TZ, year: "numeric", month: "2-digit", day: "2-digit" }).format(d);
}

function localMinutesOfDay(d: Date) {
  const parts = new Intl.DateTimeFormat("en-US", { timeZone: SHOP_TZ, hour: "2-digit", minute: "2-digit", hour12: false }).formatToParts(d);
  const h = Number(parts.find(p => p.type === "hour")?.value ?? "0");
  const m = Number(parts.find(p => p.type === "minute")?.value ?? "0");
  return h * 60 + m;
}

function toMinutes(hhmm: string) {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

export function evaluateFamilyHoursStreak(
  config: FamilyHoursConfig,
  appointments: FamilyHoursAppointment[],
  now: Date,
): { streak: number; lastCreditedDate: string; changed: boolean } {
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const yesterdayKey = localDateKey(yesterday);

  if (config.lastCreditedDate === yesterdayKey) {
    return { streak: config.streak, lastCreditedDate: config.lastCreditedDate, changed: false };
  }

  if (!config.enabled) {
    const changed = config.streak !== 0 || config.lastCreditedDate !== yesterdayKey;
    return { streak: 0, lastCreditedDate: yesterdayKey, changed };
  }

  const startMin = toMinutes(config.start);
  const endMin = toMinutes(config.end);

  const violated = appointments.some(a => {
    if (a.status === "cancelled") return false;
    const d = new Date(a.starts_at);
    if (localDateKey(d) !== yesterdayKey) return false;
    const mins = localMinutesOfDay(d);
    return mins >= startMin && mins < endMin;
  });

  const nextStreak = violated ? 0 : config.streak + 1;
  return { streak: nextStreak, lastCreditedDate: yesterdayKey, changed: true };
}
