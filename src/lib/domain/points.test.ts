import {
  calculateLateMinutes,
  resolveCheckInPoints,
  resolveStreakBonus,
} from "@/lib/domain/points";

describe("points domain", () => {
  it("calculates late minutes from wall clock times", () => {
    expect(calculateLateMinutes("10:00", "10:00")).toBe(0);
    expect(calculateLateMinutes("10:07", "10:00")).toBe(7);
    expect(calculateLateMinutes("09:54", "10:00")).toBe(0);
  });

  it("assigns check-in points based on lateness bands", () => {
    expect(resolveCheckInPoints(0)).toEqual({ eventType: "check_in_on_time", points: 10 });
    expect(resolveCheckInPoints(8)).toEqual({ eventType: "check_in_minor_late", points: 5 });
    expect(resolveCheckInPoints(18)).toEqual({ eventType: "check_in_late", points: 0 });
  });

  it("awards a streak bonus every five days", () => {
    expect(resolveStreakBonus(4)).toBe(0);
    expect(resolveStreakBonus(5)).toBe(20);
    expect(resolveStreakBonus(10)).toBe(20);
  });
});
