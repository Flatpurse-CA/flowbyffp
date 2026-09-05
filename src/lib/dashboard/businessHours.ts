export type BusinessHourRow = { weekday: number; open: boolean; start_time: string; end_time: string };

// A shop that has never visited Settings > Hours has zero rows in business_hours
// for every weekday. Treating that as "closed every day" makes every new shop
// unbookable until the owner happens to find and save the hours screen — this
// mirrors the same Mon-Sat 9-6 (Sun closed) default the settings UI already
// shows when a day has no saved row, so booking availability and the settings
// display never disagree.
export function fillBusinessHoursDefaults(rows: BusinessHourRow[]): BusinessHourRow[] {
  const byWeekday = new Map(rows.map(r => [r.weekday, r]));
  return Array.from({ length: 7 }, (_, weekday) => {
    const existing = byWeekday.get(weekday);
    if (existing) return existing;
    return { weekday, open: weekday !== 0, start_time: "09:00", end_time: "18:00" };
  });
}
