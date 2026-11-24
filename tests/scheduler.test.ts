import { describe, expect, it } from "vitest";
import { inQuietHours, nextSendWindow, nextWeekdayAt, localParts, zonedTime } from "@/lib/scheduler";

const TO = "America/Toronto";
const ED = "America/Edmonton";

describe("scheduler local time", () => {
  it("zonedTime round-trips across DST", () => {
    const summer = zonedTime(TO, 2026, 7, 6, 7);
    expect(summer.toISOString()).toBe("2026-07-06T11:00:00.000Z");
    const winter = zonedTime(TO, 2026, 12, 7, 7);
    expect(winter.toISOString()).toBe("2026-12-07T12:00:00.000Z");
  });

  it("next Monday 7am is in the shop's own timezone", () => {
    const from = zonedTime(ED, 2026, 11, 25, 11, 0); // Wednesday
    const t = nextWeekdayAt(ED, 1, 7, from);
    expect(localParts(t, ED)).toMatchObject({ wd: 1, h: 7, mi: 0, d: 30, m: 11 });
    expect(nextWeekdayAt(TO, 1, 7, from).getTime()).toBeLessThan(t.getTime());
  });

  // Times are built in local wall-clock time so the tests hold whatever offset
  // the tz database gives a zone (Alberta's rules changed in newer tzdata).
  it("quiet hours are 9pm to 8am local", () => {
    expect(inQuietHours(ED, zonedTime(ED, 2026, 11, 24, 21, 30))).toBe(true);
    expect(inQuietHours(ED, zonedTime(ED, 2026, 11, 25, 11, 0))).toBe(false);
    expect(inQuietHours(ED, zonedTime(ED, 2026, 11, 25, 7, 30))).toBe(true);
    expect(inQuietHours(ED, zonedTime(ED, 2026, 11, 25, 8, 0))).toBe(false);
  });

  it("held texts go out at 8am local", () => {
    const late = nextSendWindow(ED, zonedTime(ED, 2026, 11, 24, 22, 0));
    expect(localParts(late, ED)).toMatchObject({ d: 25, h: 8, mi: 0 });
    const early = nextSendWindow(ED, zonedTime(ED, 2026, 11, 25, 5, 0));
    expect(localParts(early, ED)).toMatchObject({ d: 25, h: 8 });
    const day = zonedTime(ED, 2026, 11, 25, 11, 0);
    expect(nextSendWindow(ED, day)).toBe(day);
  });
});

import { insideAttributionWindow } from "@/lib/dashboard/autopilotAttribution";

describe("attribution windows (Spec 2)", () => {
  const now = new Date("2026-11-25T12:00:00Z").getTime();
  const daysAgo = (d: number) => new Date(now - d * 86400000).toISOString();
  it("uses each flow's own window", () => {
    expect(insideAttributionWindow("noshow", daysAgo(6), now)).toBe(true);
    expect(insideAttributionWindow("noshow", daysAgo(8), now)).toBe(false);
    expect(insideAttributionWindow("filler", daysAgo(3), now)).toBe(false);
    expect(insideAttributionWindow("winback", daysAgo(13), now)).toBe(true);
    expect(insideAttributionWindow("birthday", daysAgo(29), now)).toBe(true);
    expect(insideAttributionWindow("birthday", daysAgo(31), now)).toBe(false);
  });
});
