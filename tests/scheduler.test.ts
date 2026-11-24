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
    const from = new Date("2026-11-25T18:00:00Z"); // Wednesday
    const t = nextWeekdayAt(ED, 1, 7, from);
    expect(localParts(t, ED)).toMatchObject({ wd: 1, h: 7, mi: 0, d: 30, m: 11 });
    expect(nextWeekdayAt(TO, 1, 7, from).getTime()).toBeLessThan(t.getTime());
  });

  it("quiet hours are 9pm to 8am local", () => {
    expect(inQuietHours(ED, new Date("2026-11-25T04:30:00Z"))).toBe(true);  // 9:30pm MST
    expect(inQuietHours(ED, new Date("2026-11-25T18:00:00Z"))).toBe(false); // 11am MST
    expect(inQuietHours(ED, new Date("2026-11-25T14:30:00Z"))).toBe(true);  // 7:30am MST
  });

  it("held texts go out at 8am local", () => {
    const late = nextSendWindow(ED, new Date("2026-11-25T05:00:00Z")); // 10pm Nov 24 MST
    expect(localParts(late, ED)).toMatchObject({ d: 25, h: 8, mi: 0 });
    const early = nextSendWindow(ED, new Date("2026-11-25T12:00:00Z")); // 5am Nov 25 MST
    expect(localParts(early, ED)).toMatchObject({ d: 25, h: 8 });
    const day = new Date("2026-11-25T18:00:00Z");
    expect(nextSendWindow(ED, day)).toBe(day);
  });
});
