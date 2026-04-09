"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireUser } from "@/lib/auth";
import { getCheckoutStreak } from "@/lib/data/dashboard";
import { getProfileByUserId } from "@/lib/data/profile";
import {
  closeCurrentStatus,
  computeFocusMinutes,
  computeStatusWorkMinutes,
  ensureCanChangeStatus,
  ensureCanCheckIn,
  ensureCanCheckOut,
  ensureCanFinishFocusSession,
  ensureCanStartFocusSession,
  finishCurrentSession,
} from "@/lib/domain/workday-machine";
import {
  calculateLateMinutes,
  resolveCheckInPoints,
  resolveStreakBonus,
} from "@/lib/domain/points";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getCurrentLocalDate, getLocalClockParts } from "@/lib/time";
import { ActionState, FocusSession, PointEventType, StatusLog, Workday } from "@/lib/types";

const checkInSchema = z.object({
  today_goal: z.string().trim().min(1, "오늘 목표를 입력해주세요."),
  today_first_task: z.string().trim().min(1, "오늘 첫 작업을 입력해주세요."),
});

const changeStatusSchema = z.object({
  status_type: z.enum([
    "study_algorithm",
    "portfolio",
    "resume",
    "break",
    "meal",
    "away",
  ]),
  memo: z.string().trim().optional(),
});

const focusStartSchema = z.object({
  duration_minutes: z.coerce.number().int().min(1).max(180),
});

const focusFinishSchema = z.object({
  focus_session_id: z.string().uuid(),
  memo: z.string().trim().optional(),
});

const checkOutSchema = z.object({
  daily_review: z.string().trim().min(1, "퇴근 회고를 입력해주세요."),
  tomorrow_first_task: z.string().trim().min(1, "내일 첫 작업을 입력해주세요."),
});

export async function checkInAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();
  const profile = await requireProfile(user.id);
  const parsed = checkInSchema.safeParse({
    today_goal: formData.get("today_goal"),
    today_first_task: formData.get("today_first_task"),
  });

  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message };
  }

  const supabase = await createSupabaseServerClient();
  const localDate = getCurrentLocalDate(profile.timezone);
  const todayWorkday = await getTodayWorkday(user.id, localDate);

  try {
    ensureCanCheckIn(todayWorkday);
  } catch (error) {
    return { ok: false, error: getErrorMessage(error) };
  }

  const now = new Date();
  const localParts = getLocalClockParts(profile.timezone, now);
  const lateMinutes = calculateLateMinutes(
    `${localParts.hour.toString().padStart(2, "0")}:${localParts.minute
      .toString()
      .padStart(2, "0")}`,
    profile.default_check_in_time,
  );
  const pointOutcome = resolveCheckInPoints(lateMinutes);

  const { data: createdWorkday, error } = await supabase
    .from("workdays")
    .insert({
      user_id: user.id,
      local_date: localDate,
      check_in_at: now.toISOString(),
      today_goal: parsed.data.today_goal,
      today_first_task: parsed.data.today_first_task,
      goal_completed: false,
      total_work_minutes: 0,
      total_focus_minutes: 0,
      total_points: pointOutcome.points,
    })
    .select("*")
    .single();

  if (error || !createdWorkday) {
    return { ok: false, error: error?.message ?? "출근 저장에 실패했습니다." };
  }

  await recordPointEvent({
    workdayId: (createdWorkday as Workday).id,
    eventType: pointOutcome.eventType,
    points: pointOutcome.points,
    meta: { lateMinutes },
  });

  revalidateAll();
  return { ok: true, message: "출근이 기록되었습니다." };
}

export async function changeStatusAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();
  const profile = await requireProfile(user.id);
  const parsed = changeStatusSchema.safeParse({
    status_type: formData.get("status_type"),
    memo: formData.get("memo") || undefined,
  });

  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message };
  }

  const workdayBundle = await getOpenWorkdayBundle(
    user.id,
    getCurrentLocalDate(profile.timezone),
  );

  try {
    ensureCanChangeStatus(workdayBundle.workday);
  } catch (error) {
    return { ok: false, error: getErrorMessage(error) };
  }

  if (!workdayBundle.workday) {
    return { ok: false, error: "출근 기록을 찾지 못했습니다." };
  }

  if (workdayBundle.active_focus_session) {
    return {
      ok: false,
      error: "집중 세션이 진행 중일 때는 상태를 바꿀 수 없습니다. 세션을 먼저 종료해주세요.",
    };
  }

  const supabase = await createSupabaseServerClient();

  if (workdayBundle.active_status?.status_type === parsed.data.status_type) {
    return { ok: false, error: "이미 같은 상태가 진행 중입니다." };
  }

  const statusClosure = closeCurrentStatus(workdayBundle.active_status);
  if (statusClosure && workdayBundle.active_status) {
    await supabase
      .from("status_logs")
      .update(statusClosure)
      .eq("id", workdayBundle.active_status.id);
  }

  const { error } = await supabase.from("status_logs").insert({
    workday_id: workdayBundle.workday.id,
    status_type: parsed.data.status_type,
    start_at: new Date().toISOString(),
    memo: parsed.data.memo || null,
  });

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidateAll();
  return { ok: true, message: "현재 상태를 변경했습니다." };
}

export async function startFocusSessionAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();
  const profile = await requireProfile(user.id);
  const parsed = focusStartSchema.safeParse({
    duration_minutes: formData.get("duration_minutes"),
  });

  if (!parsed.success) {
    return { ok: false, error: "집중 시간을 확인해주세요." };
  }

  const workdayBundle = await getOpenWorkdayBundle(
    user.id,
    getCurrentLocalDate(profile.timezone),
  );

  try {
    ensureCanStartFocusSession({
      workday: workdayBundle.workday,
      activeStatus: workdayBundle.active_status,
      activeSession: workdayBundle.active_focus_session,
    });
  } catch (error) {
    return { ok: false, error: getErrorMessage(error) };
  }

  if (!workdayBundle.workday || !workdayBundle.active_status) {
    return { ok: false, error: "집중 세션을 시작할 상태를 찾지 못했습니다." };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("focus_sessions").insert({
    workday_id: workdayBundle.workday.id,
    status_log_id: workdayBundle.active_status.id,
    start_at: new Date().toISOString(),
    duration_minutes: parsed.data.duration_minutes,
    memo: null,
    is_completed: false,
  });

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidateAll();
  return { ok: true, message: "집중 세션을 시작했습니다." };
}

export async function finishFocusSessionAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();
  const profile = await requireProfile(user.id);
  const parsed = focusFinishSchema.safeParse({
    focus_session_id: formData.get("focus_session_id"),
    memo: formData.get("memo") || undefined,
  });
  const isCompleted = String(formData.get("is_completed") ?? "true") === "true";

  if (!parsed.success) {
    return { ok: false, error: "세션 종료 정보를 확인해주세요." };
  }

  const workdayBundle = await getOpenWorkdayBundle(
    user.id,
    getCurrentLocalDate(profile.timezone),
  );

  try {
    ensureCanFinishFocusSession(workdayBundle.active_focus_session);
  } catch (error) {
    return { ok: false, error: getErrorMessage(error) };
  }

  if (!workdayBundle.workday || !workdayBundle.active_focus_session) {
    return { ok: false, error: "종료할 세션을 찾지 못했습니다." };
  }

  if (workdayBundle.active_focus_session.id !== parsed.data.focus_session_id) {
    return { ok: false, error: "현재 진행 중인 세션과 일치하지 않습니다." };
  }

  const supabase = await createSupabaseServerClient();
  const sessionPatch = finishCurrentSession(
    workdayBundle.active_focus_session,
    new Date(),
    isCompleted,
    parsed.data.memo,
  );

  if (!sessionPatch) {
    return { ok: false, error: "종료할 세션 정보를 찾지 못했습니다." };
  }

  const { error } = await supabase
    .from("focus_sessions")
    .update(sessionPatch)
    .eq("id", parsed.data.focus_session_id);

  if (error) {
    return { ok: false, error: error.message };
  }

  if (isCompleted) {
    await recordPointEvent({
      workdayId: workdayBundle.workday.id,
      eventType: "focus_session_complete",
      points: 5,
      meta: { duration: sessionPatch.duration_minutes },
    });
  }

  await refreshWorkdayTotals(workdayBundle.workday.id);
  revalidateAll();
  return { ok: true, message: "집중 세션을 종료했습니다." };
}

export async function checkOutAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();
  const profile = await requireProfile(user.id);
  const parsed = checkOutSchema.safeParse({
    daily_review: formData.get("daily_review"),
    tomorrow_first_task: formData.get("tomorrow_first_task"),
  });
  const goalCompleted = String(formData.get("goal_completed") ?? "false") === "true";

  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message };
  }

  const localDate = getCurrentLocalDate(profile.timezone);
  const workdayBundle = await getOpenWorkdayBundle(user.id, localDate);

  try {
    ensureCanCheckOut(workdayBundle.workday);
  } catch (error) {
    return { ok: false, error: getErrorMessage(error) };
  }

  if (!workdayBundle.workday) {
    return { ok: false, error: "퇴근할 근무일을 찾지 못했습니다." };
  }

  const supabase = await createSupabaseServerClient();
  const now = new Date();

  if (workdayBundle.active_focus_session) {
    const sessionPatch = finishCurrentSession(
      workdayBundle.active_focus_session,
      now,
      false,
      workdayBundle.active_focus_session.memo ?? "퇴근 시 자동 종료",
    );

    if (sessionPatch) {
      await supabase
        .from("focus_sessions")
        .update(sessionPatch)
        .eq("id", workdayBundle.active_focus_session.id);
    }
  }

  if (workdayBundle.active_status) {
    const statusPatch = closeCurrentStatus(workdayBundle.active_status, now);

    if (statusPatch) {
      await supabase
        .from("status_logs")
        .update(statusPatch)
        .eq("id", workdayBundle.active_status.id);
    }
  }

  const totalsBeforePoints = await refreshWorkdayTotals(workdayBundle.workday.id);
  let totalPoints = totalsBeforePoints.total_points;

  if (goalCompleted) {
    await recordPointEvent({
      workdayId: workdayBundle.workday.id,
      eventType: "goal_completed",
      points: 15,
      meta: {},
    });
    totalPoints += 15;
  }

  await recordPointEvent({
    workdayId: workdayBundle.workday.id,
    eventType: "daily_review_submitted",
    points: 5,
    meta: {},
  });
  totalPoints += 5;

  const streakDays = await getCheckoutStreak(user.id);
  const streakBonus = resolveStreakBonus(streakDays + 1);

  if (streakBonus > 0) {
    await recordPointEvent({
      workdayId: workdayBundle.workday.id,
      eventType: "five_day_streak_bonus",
      points: streakBonus,
      meta: { streakDays: streakDays + 1 },
    });
    totalPoints += streakBonus;
  }

  const { error } = await supabase
    .from("workdays")
    .update({
      check_out_at: now.toISOString(),
      daily_review: parsed.data.daily_review,
      tomorrow_first_task: parsed.data.tomorrow_first_task,
      goal_completed: goalCompleted,
      total_points: totalPoints,
    })
    .eq("id", workdayBundle.workday.id);

  if (error) {
    return { ok: false, error: error.message };
  }

  await refreshWorkdayTotals(workdayBundle.workday.id);
  revalidateAll();
  return { ok: true, message: "퇴근을 완료했습니다." };
}

async function requireProfile(userId: string) {
  const profile = await getProfileByUserId(userId);

  if (!profile) {
    throw new Error("온보딩을 먼저 완료해주세요.");
  }

  return profile;
}

async function getTodayWorkday(userId: string, localDate: string) {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("workdays")
    .select("*")
    .eq("user_id", userId)
    .eq("local_date", localDate)
    .maybeSingle();

  return (data as Workday | null) ?? null;
}

async function getOpenWorkdayBundle(userId: string, localDate: string) {
  const supabase = await createSupabaseServerClient();
  const workday = await getTodayWorkday(userId, localDate);

  const [statusData, focusData] = workday
    ? await Promise.all([
        supabase
          .from("status_logs")
          .select("*")
          .eq("workday_id", workday.id)
          .is("end_at", null)
          .maybeSingle(),
        supabase
          .from("focus_sessions")
          .select("*")
          .eq("workday_id", workday.id)
          .is("end_at", null)
          .maybeSingle(),
      ])
    : [{ data: null }, { data: null }];

  return {
    workday,
    active_status: (statusData.data as StatusLog | null) ?? null,
    active_focus_session: (focusData.data as FocusSession | null) ?? null,
  };
}

async function recordPointEvent(params: {
  workdayId: string;
  eventType: PointEventType;
  points: number;
  meta: Record<string, unknown>;
}) {
  const supabase = await createSupabaseServerClient();

  await supabase.from("point_events").insert({
    workday_id: params.workdayId,
    event_type: params.eventType,
    points: params.points,
    meta: params.meta,
  });
}

async function refreshWorkdayTotals(workdayId: string) {
  const supabase = await createSupabaseServerClient();
  const [{ data: statusLogs }, { data: focusSessions }, { data: pointEvents }] =
    await Promise.all([
      supabase.from("status_logs").select("*").eq("workday_id", workdayId),
      supabase.from("focus_sessions").select("*").eq("workday_id", workdayId),
      supabase.from("point_events").select("points").eq("workday_id", workdayId),
    ]);

  const totalWorkMinutes = computeStatusWorkMinutes(
    (statusLogs as StatusLog[] | null) ?? [],
  );
  const totalFocusMinutes = computeFocusMinutes(
    (focusSessions as FocusSession[] | null) ?? [],
  );
  const totalPoints = ((pointEvents as { points: number }[] | null) ?? []).reduce(
    (sum, event) => sum + event.points,
    0,
  );

  await supabase
    .from("workdays")
    .update({
      total_work_minutes: totalWorkMinutes,
      total_focus_minutes: totalFocusMinutes,
      total_points: totalPoints,
    })
    .eq("id", workdayId);

  return {
    total_work_minutes: totalWorkMinutes,
    total_focus_minutes: totalFocusMinutes,
    total_points: totalPoints,
  };
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.";
}

function revalidateAll() {
  revalidatePath("/");
  revalidatePath("/history");
}
