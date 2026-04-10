import { z } from "zod";

import { DEFAULT_CHECK_IN_TIME, DEFAULT_TIMEZONE, TIMEZONE_OPTIONS } from "@/lib/constants";

const clockTimePattern = /^(?:[01]\d|2[0-3]):[0-5]\d$/;
const supportedTimezoneSet = new Set<string>(
  TIMEZONE_OPTIONS.map((option) => option.value),
);

export const profileSchema = z.object({
  nickname: z.string().trim().min(1, "닉네임을 입력해주세요."),
  timezone: z
    .string()
    .trim()
    .refine((value) => supportedTimezoneSet.has(value), "지원하지 않는 시간대입니다."),
  default_check_in_time: z
    .string()
    .trim()
    .regex(clockTimePattern, "출근 시각 형식이 올바르지 않습니다."),
});

export function getProfileFormValues(formData: FormData) {
  return {
    nickname: formData.get("nickname"),
    timezone: formData.get("timezone") || DEFAULT_TIMEZONE,
    default_check_in_time:
      formData.get("default_check_in_time") || DEFAULT_CHECK_IN_TIME,
  };
}

export function isSupportedTimezone(timezone: string) {
  return supportedTimezoneSet.has(timezone);
}

export function isValidCheckInTime(value: string) {
  return clockTimePattern.test(value);
}

