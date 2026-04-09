import { PointEventType } from "@/lib/types";

export function calculateLateMinutes(
  actualTime: string,
  defaultCheckInTime: string,
) {
  const [actualHour, actualMinute] = actualTime.split(":").map(Number);
  const [targetHour, targetMinute] = defaultCheckInTime.split(":").map(Number);

  const actualTotal = actualHour * 60 + actualMinute;
  const targetTotal = targetHour * 60 + targetMinute;

  return Math.max(0, actualTotal - targetTotal);
}

export function resolveCheckInPoints(lateMinutes: number): {
  eventType: PointEventType;
  points: number;
} {
  if (lateMinutes <= 0) {
    return { eventType: "check_in_on_time", points: 10 };
  }

  if (lateMinutes <= 10) {
    return { eventType: "check_in_minor_late", points: 5 };
  }

  return { eventType: "check_in_late", points: 0 };
}

export function resolveStreakBonus(streakDays: number) {
  return streakDays > 0 && streakDays % 5 === 0 ? 20 : 0;
}
