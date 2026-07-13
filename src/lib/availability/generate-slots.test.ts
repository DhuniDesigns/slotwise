import { describe, expect, it } from "vitest";
import { generateSlots } from "./generate-slots";

const weekdays = { 1: [{ start: "09:00", end: "11:00" }] };

describe("generateSlots", () => {
  it("subtracts overlapping appointments", () => {
    const slots = generateSlots({ date:"2026-07-06", hostTimezone:"Africa/Lagos", durationMinutes:30, minimumNoticeMinutes:0, weeklyWindows:weekdays, busy:[{startsAt:new Date("2026-07-06T08:30:00Z"),endsAt:new Date("2026-07-06T09:00:00Z")}], now:new Date("2026-07-01T00:00:00Z"), stepMinutes:30 });
    expect(slots.map((s)=>s.startsAt.toISOString())).toEqual(["2026-07-06T08:00:00.000Z","2026-07-06T09:00:00.000Z","2026-07-06T09:30:00.000Z"]);
  });

  it("respects minimum notice and unavailable overrides", () => {
    const base = { date:"2026-07-06", hostTimezone:"Africa/Lagos", durationMinutes:30, weeklyWindows:weekdays, busy:[], now:new Date("2026-07-06T07:30:00Z"), stepMinutes:30 };
    expect(generateSlots({...base,minimumNoticeMinutes:120})).toHaveLength(1);
    expect(generateSlots({...base,minimumNoticeMinutes:0,override:{unavailable:true}})).toEqual([]);
  });

  it("handles quarter-hour offsets", () => {
    const slots = generateSlots({date:"2026-07-06",hostTimezone:"Asia/Kathmandu",durationMinutes:60,minimumNoticeMinutes:0,weeklyWindows:{1:[{start:"09:00",end:"10:00"}]},busy:[],now:new Date("2026-07-01T00:00:00Z")});
    expect(slots[0].startsAt.toISOString()).toBe("2026-07-06T03:15:00.000Z");
  });

  it("does not create slots for nonexistent DST wall times", () => {
    const slots = generateSlots({date:"2026-03-08",hostTimezone:"America/New_York",durationMinutes:30,minimumNoticeMinutes:0,weeklyWindows:{0:[{start:"02:00",end:"03:00"}]},busy:[],now:new Date("2026-01-01T00:00:00Z"),stepMinutes:30});
    expect(slots).toEqual([]);
  });
});
