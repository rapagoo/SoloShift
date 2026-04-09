import { formatLocalDateLabel, formatMinutes, minutesToClockLabel } from "@/lib/time";

describe("history helpers", () => {
  it("formats durations compactly", () => {
    expect(formatMinutes(0)).toBe("0분");
    expect(formatMinutes(45)).toBe("45분");
    expect(formatMinutes(125)).toBe("2시간 5분");
  });

  it("converts average clock minutes back to a label", () => {
    expect(minutesToClockLabel(600)).toBe("10:00");
    expect(minutesToClockLabel(75)).toBe("01:15");
  });

  it("formats local date labels for the history view", () => {
    expect(formatLocalDateLabel("2026-04-09")).toContain("4월 9일");
  });
});
