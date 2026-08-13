// Shop-timezone conversion utility, used anywhere slot times are computed
// server-side (Vercel runs in UTC, not the shop's local timezone). Split out
// of the now-removed Family Hours feature, which this has no dependency on.

export const SHOP_TZ = "America/Edmonton"; // matches the TZ used for Bookings display

// Resolves the shop's UTC offset for a given calendar date (probed at noon to
// avoid DST-transition-day edge cases at midnight), then converts a "HH:MM"
// wall-clock time on that date into the correct UTC instant.
function shopOffsetMinutes(dateStr: string): number {
  const probe = new Date(`${dateStr}T12:00:00Z`);
  const parts = new Intl.DateTimeFormat("en-US", { timeZone: SHOP_TZ, timeZoneName: "shortOffset" }).formatToParts(probe);
  const offsetPart = parts.find(p => p.type === "timeZoneName")?.value ?? "GMT-7";
  const match = offsetPart.match(/GMT([+-]\d+)/);
  const hours = match ? parseInt(match[1], 10) : -7;
  return hours * 60;
}

export function shopWallTimeToUTC(dateStr: string, hhmm: string): Date {
  const offsetMinutes = shopOffsetMinutes(dateStr);
  const [h, m] = hhmm.split(":").map(Number);
  const utcMs = Date.UTC(
    Number(dateStr.slice(0, 4)), Number(dateStr.slice(5, 7)) - 1, Number(dateStr.slice(8, 10)),
    h, m, 0, 0,
  ) - offsetMinutes * 60000;
  return new Date(utcMs);
}
