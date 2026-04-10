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
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
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

  try {
    const admin = createSupabaseAdminClient();
    const localDate = getCurrentLocalDate(profile.timezone);
    const todayWorkday = await getTodayWorkday(user.id, localDate);

    ensureCanCheckIn(todayWorkday);

    const now = new Date();
    const localParts = getLocalClockParts(profile.timezone, now);
    const lateMinutes = calculateLateMinutes(
      `${localParts.hour.toString().padStart(2, "0")}:${localParts.minute
        .toString()
        .padStart(2, "0")}`,
      profile.default_check_in_time,
    );
    const pointOutcome = resolveCheckInPoints(lateMinutes);

    const { data: createdWorkday, error } = await admin
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
        total_points: 0,
      })
      .select("*")
      .single();

    throwIfSupabaseError(error, "출근 저장에 실패했습니다.");

    if (!createdWorkday) {
      throw new Error("출근 저장에 실패했습니다.");
    }

    await recordPointEvent({
      workdayId: (createdWorkday as Workday).id,
      eventType: pointOutcome.eventType,
      points: pointOutcome.points,
      meta: { lateMinutes },
    });
    await refreshWorkdayTotals((createdWorkday as Workday).id);

    revalidateAll();
    return { ok: true, message: "출근이 기록되었습니다." };
  } catch (error) {
    return { ok: false, error: getErrorMessage(error) };
  }
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

  try {
    const admin = createSupabaseAdminClient();
    const workdayBundle = await getOpenWorkdayBundle(
      user.id,
      getCurrentLocalDate(profile.timezone),
    );

    ensureCanChangeStatus(workdayBundle.workday);

    if (!workdayBundle.workday) {
      return { ok: false, error: "출근 기록을 찾지 못했습니다." };
    }

    if (workdayBundle.active_focus_session) {
      return {
        ok: false,
        error: "집중 세션이 진행 중일 때는 상태를 바꿀 수 없습니다. 세션을 먼저 종료해주세요.",
      };
    }

    if (workdayBundle.active_status?.status_type === parsed.data.status_type) {
      return { ok: false, error: "이미 같은 상태가 진행 중입니다." };
    }

    const statusClosure = closeCurrentStatus(workdayBundle.active_status);
    if (statusClosure && workdayBundle.active_status) {
      const { data: closedStatus, error: closeError } = await admin
        .from("status_logs")
        .update(statusClosure)
        .eq("id", workdayBundle.active_status.id)
        .select("id")
        .single();

      throwIfSupabaseError(closeError, "이전 상태 종료에 실패했습니다.");

      if (!closedStatus) {
        throw new Error("이전 상태 종료에 실패했습니다.");
      }
    }

    const { data: createdStatus, error } = await admin
      .from("status_logs")
      .insert({
        workday_id: workdayBundle.workday.id,
        status_type: parsed.data.status_type,
        start_at: new Date().toISOString(),
        memo: parsed.data.memo || null,
      })
      .select("id")
      .single();

    throwIfSupabaseError(error, "상태 저장에 실패했습니다.");

    if (!createdStatus) {
      throw new Error("상태 저장에 실패했습니다.");
    }

    revalidateAll();
    return { ok: true, message: "현재 상태를 변경했습니다." };
  } catch (error) {
    return { ok: false, error: getErrorMessage(error) };
  }
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

  try {
    const admin = createSupabaseAdminClient();
    const workdayBundle = await getOpenWorkdayBundle(
      user.id,
      getCurrentLocalDate(profile.timezone),
    );

    ensureCanStartFocusSession({
      workday: workdayBundle.workday,
      activeStatus: workdayBundle.active_status,
      activeSession: workdayBundle.active_focus_session,
    });

    if (!workdayBundle.workday || !workdayBundle.active_status) {
      return { ok: false, error: "집중 세션을 시작할 상태를 찾지 못했습니다." };
    }

    const { data: createdSession, error } = await admin
      .from("focus_sessions")
      .insert({
        workday_id: workdayBundle.workday.id,
        status_log_id: workdayBundle.active_status.id,
        start_at: new Date().toISOString(),
        duration_minutes: parsed.data.duration_minutes,
        memo: null,
        is_completed: false,
      })
      .select("id")
      .single();

    throwIfSupabaseError(error, "집중 세션 시작에 실패했습니다.");

    if (!createdSession) {
      throw new Error("집중 세션 시작에 실패했습니다.");
    }

    revalidateAll();
    return { ok: true, message: "집중 세션을 시작했습니다." };
  } catch (error) {
    return { ok: false, error: getErrorMessage(error) };
  }
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

  try {
    const admin = createSupabaseAdminClient();
    const workdayBundle = await getOpenWorkdayBundle(
      user.id,
      getCurrentLocalDate(profile.timezone),
    );

    ensureCanFinishFocusSession(workdayBundle.active_focus_session);

    if (!workdayBundle.workday || !workdayBundle.active_focus_session) {
      return { ok: false, error: "종료할 세션을 찾지 못했습니다." };
    }

    if (workdayBundle.active_focus_session.id !== parsed.data.focus_session_id) {
      return { ok: false, error: "현재 진행 중인 세션과 일치하지 않습니다." };
    }

    const sessionPatch = finishCurrentSession(
      workdayBundle.active_focus_session,
      new Date(),
      isCompleted,
      parsed.data.memo,
    );

    if (!sessionPatch) {
      return { ok: false, error: "종료할 세션 정보를 찾지 못했습니다." };
    }

    const { data: updatedSession, error } = await admin
      .from("focus_sessions")
      .update(sessionPatch)
      .eq("id", parsed.data.focus_session_id)
      .select("id")
      .single();

    throwIfSupabaseError(error, "집중 세션 종료에 실패했습니다.");

    if (!updatedSession) {
      throw new Error("집중 세션 종료에 실패했습니다.");
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
  } catch (error) {
    return { ok: false, error: getErrorMessage(error) };
  }
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

  try {
    const admin = createSupabaseAdminClient();
    const localDate = getCurrentLocalDate(profile.timezone);
    const workdayBundle = await getOpenWorkdayBundle(user.id, localDate);

    ensureCanCheckOut(workdayBundle.workday);

    if (!workdayBundle.workday) {
      return { ok: false, error: "퇴근할 근무일을 찾지 못했습니다." };
    }

    const now = new Date();

    if (workdayBundle.active_focus_session) {
      const sessionPatch = finishCurrentSession(
        workdayBundle.active_focus_session,
        now,
        false,
        workdayBundle.active_focus_session.memo ?? "퇴근 시 자동 종료",
      );

      if (sessionPatch) {
        const { data: closedSession, error: sessionError } = await admin
          .from("focus_sessions")
          .update(sessionPatch)
          .eq("id", workdayBundle.active_focus_session.id)
          .select("id")
          .single();

        throwIfSupabaseError(sessionError, "집중 세션 자동 종료에 실패했습니다.");

        if (!closedSession) {
          throw new Error("집중 세션 자동 종료에 실패했습니다.");
        }
      }
    }

    if (workdayBundle.active_status) {
      const statusPatch = closeCurrentStatus(workdayBundle.active_status, now);

      if (statusPatch) {
        const { data: closedStatus, error: statusError } = await admin
          .from("status_logs")
          .update(statusPatch)
          .eq("id", workdayBundle.active_status.id)
          .select("id")
          .single();

        throwIfSupabaseError(statusError, "현재 상태 종료에 실패했습니다.");

        if (!closedStatus) {
          throw new Error("현재 상태 종료에 실패했습니다.");
        }
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

    const { data: checkedOutWorkday, error } = await admin
      .from("workdays")
      .update({
        check_out_at: now.toISOString(),
        daily_review: parsed.data.daily_review,
        tomorrow_first_task: parsed.data.tomorrow_first_task,
        goal_completed: goalCompleted,
        total_points: totalPoints,
      })
      .eq("id", workdayBundle.workday.id)
      .select("id")
      .single();

    throwIfSupabaseError(error, "퇴근 저장에 실패했습니다.");

    if (!checkedOutWorkday) {
      throw new Error("퇴근 저장에 실패했습니다.");
    }

    await refreshWorkdayTotals(workdayBundle.workday.id);
    revalidateAll();
    return { ok: true, message: "퇴근을 완료했습니다." };
  } catch (error) {
    return { ok: false, error: getErrorMessage(error) };
  }
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
  const { data, error } = await supabase
    .from("workdays")
    .select("*")
    .eq("user_id", userId)
    .eq("local_date", localDate)
    .maybeSingle();

  throwIfSupabaseError(error, "오늘 근무일을 불러오지 못했습니다.");

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
          .order("start_at", { ascending: false })
          .limit(2),
        supabase
          .from("focus_sessions")
          .select("*")
          .eq("workday_id", workday.id)
          .is("end_at", null)
          .order("start_at", { ascending: false })
          .limit(2),
      ])
    : [
        { data: null, error: null },
        { data: null, error: null },
      ];

  throwIfSupabaseError(statusData.error, "현재 상태를 불러오지 못했습니다.");
  throwIfSupabaseError(focusData.error, "현재 집중 세션을 불러오지 못했습니다.");

  const activeStatuses = (statusData.data as StatusLog[] | null) ?? [];
  const activeFocusSessions = (focusData.data as FocusSession[] | null) ?? [];

  if (activeStatuses.length > 1) {
    throw new Error("열린 상태 로그가 중복되어 있어 계속 진행할 수 없습니다.");
  }

  if (activeFocusSessions.length > 1) {
    throw new Error("열린 집중 세션이 중복되어 있어 계속 진행할 수 없습니다.");
  }

  return {
    workday,
    active_status: activeStatuses[0] ?? null,
    active_focus_session: activeFocusSessions[0] ?? null,
  };
}

async function recordPointEvent(params: {
  workdayId: string;
  eventType: PointEventType;
  points: number;
  meta: Record<string, unknown>;
}) {
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("point_events")
    .insert({
      workday_id: params.workdayId,
      event_type: params.eventType,
      points: params.points,
      meta: params.meta,
    })
    .select("id")
    .single();

  throwIfSupabaseError(error, "포인트 기록 저장에 실패했습니다.");

  if (!data) {
    throw new Error("포인트 기록 저장에 실패했습니다.");
  }
}

async function refreshWorkdayTotals(workdayId: string) {
  const supabase = await createSupabaseServerClient();
  const admin = createSupabaseAdminClient();
  const [statusLogsResult, focusSessionsResult, pointEventsResult] = await Promise.all([
    supabase.from("status_logs").select("*").eq("workday_id", workdayId),
    supabase.from("focus_sessions").select("*").eq("workday_id", workdayId),
    supabase.from("point_events").select("points").eq("workday_id", workdayId),
  ]);

  throwIfSupabaseError(statusLogsResult.error, "상태 로그를 다시 계산하지 못했습니다.");
  throwIfSupabaseError(focusSessionsResult.error, "집중 세션을 다시 계산하지 못했습니다.");
  throwIfSupabaseError(pointEventsResult.error, "포인트를 다시 계산하지 못했습니다.");

  const totalWorkMinutes = computeStatusWorkMinutes(
    (statusLogsResult.data as StatusLog[] | null) ?? [],
  );
  const totalFocusMinutes = computeFocusMinutes(
    (focusSessionsResult.data as FocusSession[] | null) ?? [],
  );
  const totalPoints = ((pointEventsResult.data as { points: number }[] | null) ?? []).reduce(
    (sum, event) => sum + event.points,
    0,
  );

  const { data, error } = await admin
    .from("workdays")
    .update({
      total_work_minutes: totalWorkMinutes,
      total_focus_minutes: totalFocusMinutes,
      total_points: totalPoints,
    })
    .eq("id", workdayId)
    .select("id")
    .single();

  throwIfSupabaseError(error, "근무일 합계 갱신에 실패했습니다.");

  if (!data) {
    throw new Error("근무일 합계 갱신에 실패했습니다.");
  }

  return {
    total_work_minutes: totalWorkMinutes,
    total_focus_minutes: totalFocusMinutes,
    total_points: totalPoints,
  };
}

function throwIfSupabaseError(
  error: { message: string } | null | undefined,
  fallbackMessage: string,
) {
  if (error) {
    throw new Error(error.message || fallbackMessage);
  }
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.";
}

function revalidateAll() {
  revalidatePath("/");
  revalidatePath("/history");
}

