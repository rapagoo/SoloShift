import { format, parseISO, startOfWeek } from "date-fns";
import { ko } from "date-fns/locale";

export function getCurrentLocalDate(timezone: string, now = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

export function getLocalClockParts(timezone: string, value: Date | string) {
  const date = typeof value === "string" ? new Date(value) : value;
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: timezone,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(date);

  const map = Object.fromEntries(parts.map((part) => [part.type, part.value]));

  return {
    hour: Number(map.hour ?? 0),
    minute: Number(map.minute ?? 0),
    second: Number(map.second ?? 0),
  };
}

export function formatTimestamp(value: string | null, timezone: string) {
  if (!value) {
    return null;
  }

  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: timezone,
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(value));
}

export function formatTimeOnly(value: string | null, timezone: string) {
  if (!value) {
    return null;
  }

  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: timezone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(value));
}

export function formatMinutes(minutes: number) {
  if (minutes <= 0) {
    return "0분";
  }

  const hour = Math.floor(minutes / 60);
  const minute = minutes % 60;

  if (hour === 0) {
    return `${minute}분`;
  }

  if (minute === 0) {
    return `${hour}시간`;
  }

  return `${hour}시간 ${minute}분`;
}

export function minutesBetween(start: string | Date, end: string | Date) {
  const startDate = typeof start === "string" ? new Date(start) : start;
  const endDate = typeof end === "string" ? new Date(end) : end;

  return Math.max(
    0,
    Math.round((endDate.getTime() - startDate.getTime()) / 60_000),
  );
}

export function getWeekRangeLabel(localDate: string) {
  const weekStart = startOfWeek(parseISO(localDate), { weekStartsOn: 1 });
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);

  return `${format(weekStart, "M.d", { locale: ko })} - ${format(weekEnd, "M.d", {
    locale: ko,
  })}`;
}

export function formatLocalDateLabel(localDate: string) {
  return format(parseISO(localDate), "M월 d일 (EEE)", { locale: ko });
}

export function minutesToClockLabel(totalMinutes: number | null) {
  if (totalMinutes === null) {
    return null;
  }

  const normalized = ((totalMinutes % (24 * 60)) + 24 * 60) % (24 * 60);
  const hour = Math.floor(normalized / 60)
    .toString()
    .padStart(2, "0");
  const minute = (normalized % 60).toString().padStart(2, "0");

  return `${hour}:${minute}`;
}
