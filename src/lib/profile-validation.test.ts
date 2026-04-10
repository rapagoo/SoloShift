import {
  isSupportedTimezone,
  isValidCheckInTime,
  profileSchema,
} from "@/lib/profile-validation";

describe("profile validation", () => {
  it("accepts supported timezones only", () => {
    expect(isSupportedTimezone("Asia/Seoul")).toBe(true);
    expect(isSupportedTimezone("Not/A_Zone")).toBe(false);
  });

  it("accepts real 24-hour clock values only", () => {
    expect(isValidCheckInTime("00:00")).toBe(true);
    expect(isValidCheckInTime("23:59")).toBe(true);
    expect(isValidCheckInTime("24:00")).toBe(false);
    expect(isValidCheckInTime("09:60")).toBe(false);
  });

  it("rejects unsupported timezone values from profile input", () => {
    const result = profileSchema.safeParse({
      nickname: "Rapagoo",
      timezone: "Not/A_Zone",
      default_check_in_time: "10:00",
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe("지원하지 않는 시간대입니다.");
  });

  it("rejects malformed check-in times from profile input", () => {
    const result = profileSchema.safeParse({
      nickname: "Rapagoo",
      timezone: "Asia/Seoul",
      default_check_in_time: "28:99",
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe("출근 시각 형식이 올바르지 않습니다.");
  });
});

