import { format, parseISO, startOfWeek } from "date-fns";

import { getCheckoutStreak } from "@/lib/data/dashboard";
import {
  computeFocusMinutes,
  computeStatusWorkMinutes,
} from "@/lib/domain/workday-machine";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getCurrentLocalDate, getWeekRangeLabel, minutesToClockLabel } from "@/lib/time";
import {
  FocusSession,
  HistoryEntry,
  PointEvent,
  Profile,
  StatusLog,
  WeeklySummary,
  Workday,
} from "@/lib/types";

export async function getWeeklySummary(
  userId: string,
  profile: Profile,
): Promise<WeeklySummary> {
  const supabase = await createSupabaseServerClient();
  const currentLocalDate = getCurrentLocalDate(profile.timezone);
  const weekStart = startOfWeek(parseISO(currentLocalDate), { weekStartsOn: 1 });
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);
  const start = format(weekStart, "yyyy-MM-dd");
  const end = format(weekEnd, "yyyy-MM-dd");

  const { data: workdays } = await supabase
    .from("workdays")
    .select("*")
    .eq("user_id", userId)
    .gte("local_date", start)
    .lte("local_date", end)
    .order("local_date", { ascending: false });

  const typedWorkdays = (workdays as Workday[] | null) ?? [];
  const workdayIds = typedWorkdays.map((workday) => workday.id);

  const [statusLogsResult, focusSessionsResult] = workdayIds.length
    ? await Promise.all([
        supabase.from("status_logs").select("*").in("workday_id", workdayIds),
        supabase
          .from("focus_sessions")
          .select("*")
          .in("workday_id", workdayIds),
      ])
    : [{ data: [] }, { data: [] }];

  const statusByWorkday = groupByWorkday(
    (statusLogsResult.data as StatusLog[] | null) ?? [],
  );
  const focusByWorkday = groupByWorkday(
    (focusSessionsResult.data as FocusSession[] | null) ?? [],
  );

  const checkInMinutes = typedWorkdays
    .map((workday) => wallClockMinutes(workday.check_in_at, profile.timezone))
    .filter((value): value is number => value !== null);
  const checkOutMinutes = typedWorkdays
    .map((workday) => wallClockMinutes(workday.check_out_at, profile.timezone))
    .filter((value): value is number => value !== null);
  const totalWorkMinutes = typedWorkdays.reduce((sum, workday) => {
    return sum + computeStatusWorkMinutes(statusByWorkday[workday.id] ?? []);
  }, 0);
  const totalFocusMinutes = typedWorkdays.reduce((sum, workday) => {
    return sum + computeFocusMinutes(focusByWorkday[workday.id] ?? []);
  }, 0);
  const totalPoints = typedWorkdays.reduce(
    (sum, workday) => sum + workday.total_points,
    0,
  );

  return {
    range_label: getWeekRangeLabel(start),
    days_checked_in: typedWorkdays.filter((workday) => workday.check_in_at).length,
    average_check_in: averageClock(checkInMinutes),
    average_check_out: averageClock(checkOutMinutes),
    total_work_minutes: totalWorkMinutes,
    total_focus_minutes: totalFocusMinutes,
    total_points: totalPoints,
    streak_days: await getCheckoutStreak(userId),
  };
}

export async function getHistoryEntries(userId: string): Promise<HistoryEntry[]> {
  const supabase = await createSupabaseServerClient();
  const { data: workdays } = await supabase
    .from("workdays")
    .select("*")
    .eq("user_id", userId)
    .order("local_date", { ascending: false })
    .limit(12);

  const typedWorkdays = (workdays as Workday[] | null) ?? [];
  const workdayIds = typedWorkdays.map((workday) => workday.id);

  if (workdayIds.length === 0) {
    return [];
  }

  const [statusLogsResult, focusSessionsResult, pointEventsResult] = await Promise.all([
    supabase.from("status_logs").select("*").in("workday_id", workdayIds),
    supabase.from("focus_sessions").select("*").in("workday_id", workdayIds),
    supabase.from("point_events").select("*").in("workday_id", workdayIds),
  ]);

  const statusByWorkday = groupByWorkday(
    (statusLogsResult.data as StatusLog[] | null) ?? [],
  );
  const focusByWorkday = groupByWorkday(
    (focusSessionsResult.data as FocusSession[] | null) ?? [],
  );
  const pointByWorkday = groupByWorkday(
    (pointEventsResult.data as PointEvent[] | null) ?? [],
  );

  return typedWorkdays.map((workday) => ({
    workday,
    status_logs: (statusByWorkday[workday.id] ?? []).sort((a, b) =>
      a.start_at < b.start_at ? 1 : -1,
    ),
    focus_sessions: (focusByWorkday[workday.id] ?? []).sort((a, b) =>
      a.start_at < b.start_at ? 1 : -1,
    ),
    point_events: (pointByWorkday[workday.id] ?? []).sort((a, b) =>
      a.created_at < b.created_at ? 1 : -1,
    ),
  }));
}

function groupByWorkday<T extends { workday_id: string }>(items: T[]) {
  return items.reduce<Record<string, T[]>>((accumulator, item) => {
    const list = accumulator[item.workday_id] ?? [];
    list.push(item);
    accumulator[item.workday_id] = list;
    return accumulator;
  }, {});
}

function wallClockMinutes(timestamp: string | null, timezone: string) {
  if (!timestamp) {
    return null;
  }

  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: timezone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date(timestamp));
  const map = Object.fromEntries(parts.map((part) => [part.type, part.value]));

  return Number(map.hour ?? 0) * 60 + Number(map.minute ?? 0);
}

function averageClock(values: number[]) {
  if (values.length === 0) {
    return null;
  }

  const average = Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
  return minutesToClockLabel(average);
}
