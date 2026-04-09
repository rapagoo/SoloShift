import { getCharacterDialogue } from "@/lib/domain/dialogue";
import {
  computeFocusMinutes,
  computeStatusWorkMinutes,
  getTopLevelState,
} from "@/lib/domain/workday-machine";
import { calculateLateMinutes } from "@/lib/domain/points";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getCurrentLocalDate, getLocalClockParts } from "@/lib/time";
import {
  DashboardData,
  FocusSession,
  PointEvent,
  Profile,
  StatusLog,
  Workday,
} from "@/lib/types";

export async function getTodayDashboard(
  userId: string,
  profile: Profile,
): Promise<DashboardData> {
  const supabase = await createSupabaseServerClient();
  const localDate = getCurrentLocalDate(profile.timezone);
  const { data: workday } = await supabase
    .from("workdays")
    .select("*")
    .eq("user_id", userId)
    .eq("local_date", localDate)
    .maybeSingle();

  const typedWorkday = (workday as Workday | null) ?? null;

  if (!typedWorkday) {
    return {
      workday: null,
      active_status: null,
      active_focus_session: null,
      status_logs: [],
      focus_sessions: [],
      point_events: [],
      top_level_state: "before_check_in",
      work_minutes_live: 0,
      focus_minutes_live: 0,
      streak_days: await getCheckoutStreak(userId),
      late_minutes: null,
      character_message: getCharacterDialogue({ event: "idle" }),
    };
  }

  const [{ data: statusLogs }, { data: focusSessions }, { data: pointEvents }] =
    await Promise.all([
      supabase
        .from("status_logs")
        .select("*")
        .eq("workday_id", typedWorkday.id)
        .order("start_at", { ascending: false }),
      supabase
        .from("focus_sessions")
        .select("*")
        .eq("workday_id", typedWorkday.id)
        .order("start_at", { ascending: false }),
      supabase
        .from("point_events")
        .select("*")
        .eq("workday_id", typedWorkday.id)
        .order("created_at", { ascending: false }),
    ]);

  const typedStatusLogs = (statusLogs as StatusLog[] | null) ?? [];
  const typedFocusSessions = (focusSessions as FocusSession[] | null) ?? [];
  const typedPointEvents = (pointEvents as PointEvent[] | null) ?? [];

  const activeStatus = typedStatusLogs.find((log) => !log.end_at) ?? null;
  const activeFocusSession =
    typedFocusSessions.find((session) => !session.end_at) ?? null;
  const lateMinutes = typedWorkday.check_in_at
    ? calculateLateMinutes(
        (() => {
          const parts = getLocalClockParts(profile.timezone, typedWorkday.check_in_at!);
          return `${parts.hour.toString().padStart(2, "0")}:${parts.minute
            .toString()
            .padStart(2, "0")}`;
        })(),
        profile.default_check_in_time,
      )
    : null;
  const topLevelState = getTopLevelState(typedWorkday, activeStatus);
  const workMinutesLive = computeStatusWorkMinutes([...typedStatusLogs].reverse());
  const focusMinutesLive = computeFocusMinutes([...typedFocusSessions].reverse());
  const streakDays = await getCheckoutStreak(userId);

  const characterMessage = typedWorkday.check_out_at
    ? getCharacterDialogue({
        event: typedWorkday.goal_completed ? "check_out_goal" : "check_out_plain",
      })
    : typedPointEvents.some((event) => event.event_type === "focus_session_complete")
      ? getCharacterDialogue({ event: "focus_complete" })
      : getCharacterDialogue({
          event: "check_in",
          lateMinutes,
        });

  return {
    workday: typedWorkday,
    active_status: activeStatus,
    active_focus_session: activeFocusSession,
    status_logs: typedStatusLogs,
    focus_sessions: typedFocusSessions,
    point_events: typedPointEvents,
    top_level_state: topLevelState,
    work_minutes_live: workMinutesLive,
    focus_minutes_live: focusMinutesLive,
    streak_days: streakDays,
    late_minutes: lateMinutes,
    character_message: characterMessage,
  };
}

export async function getCheckoutStreak(userId: string) {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("workdays")
    .select("local_date")
    .eq("user_id", userId)
    .not("check_out_at", "is", null)
    .order("local_date", { ascending: false })
    .limit(30);

  const dates = ((data as { local_date: string }[] | null) ?? []).map(
    (entry) => entry.local_date,
  );

  if (dates.length === 0) {
    return 0;
  }

  let streak = 1;

  for (let index = 1; index < dates.length; index += 1) {
    const current = new Date(`${dates[index - 1]}T00:00:00Z`);
    const next = new Date(`${dates[index]}T00:00:00Z`);
    const difference = Math.round(
      (current.getTime() - next.getTime()) / (24 * 60 * 60 * 1000),
    );

    if (difference !== 1) {
      break;
    }

    streak += 1;
  }

  return streak;
}
