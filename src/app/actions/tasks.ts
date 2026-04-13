"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireUser } from "@/lib/auth";
import { getProfileByUserId } from "@/lib/data/profile";
import { ensureCanCheckOut } from "@/lib/domain/workday-machine";
import { recordActivityEvent } from "@/lib/server/activity-feed";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getCurrentLocalDate } from "@/lib/time";
import { ActionState, Task, TaskStatus, Workday } from "@/lib/types";

const createTaskSchema = z.object({
  title: z.string().trim().min(1, "작업 제목을 입력해주세요."),
  detail: z.string().trim().optional(),
});

const updateTaskStatusSchema = z.object({
  task_id: z.string().uuid(),
  next_status: z.enum(["todo", "doing", "done"]),
});

export async function createTaskAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();
  const profile = await requireProfile(user.id);
  const parsed = createTaskSchema.safeParse({
    title: formData.get("title"),
    detail: formData.get("detail") || undefined,
  });

  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message };
  }

  try {
    const admin = createSupabaseAdminClient();
    const supabase = await createSupabaseServerClient();
    const workday = await getTodayWorkday(user.id, getCurrentLocalDate(profile.timezone));

    ensureCanCheckOut(workday);

    if (!workday) {
      return { ok: false, error: "오늘 근무일을 찾지 못했습니다." };
    }

    const { data: lastTask } = await supabase
      .from("tasks")
      .select("sort_order")
      .eq("workday_id", workday.id)
      .order("sort_order", { ascending: false })
      .limit(1)
      .maybeSingle();

    const nextSortOrder = ((lastTask as { sort_order: number } | null)?.sort_order ?? -1) + 1;
    const now = new Date().toISOString();

    const { data: createdTask, error } = await admin
      .from("tasks")
      .insert({
        workday_id: workday.id,
        title: parsed.data.title,
        detail: parsed.data.detail || null,
        status: "todo",
        sort_order: nextSortOrder,
        completed_at: null,
        created_at: now,
        updated_at: now,
      })
      .select("*")
      .single();

    throwIfSupabaseError(error, "작업 추가에 실패했습니다.");

    if (!createdTask) {
      throw new Error("작업 추가에 실패했습니다.");
    }

    await recordActivityEvent({
      workdayId: workday.id,
      userId: user.id,
      actorNickname: profile.nickname,
      eventType: "task_created",
      title: "작업 추가",
      description: `"${parsed.data.title}" 작업을 등록했습니다.`,
      meta: { taskId: (createdTask as Task).id },
    });

    revalidateAll();
    return { ok: true, message: "작업을 추가했습니다." };
  } catch (error) {
    return { ok: false, error: getErrorMessage(error) };
  }
}

export async function updateTaskStatusAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();
  const profile = await requireProfile(user.id);
  const parsed = updateTaskStatusSchema.safeParse({
    task_id: formData.get("task_id"),
    next_status: formData.get("next_status"),
  });

  if (!parsed.success) {
    return { ok: false, error: "작업 상태 정보를 확인해주세요." };
  }

  try {
    const admin = createSupabaseAdminClient();
    const supabase = await createSupabaseServerClient();
    const workday = await getTodayWorkday(user.id, getCurrentLocalDate(profile.timezone));

    ensureCanCheckOut(workday);

    if (!workday) {
      return { ok: false, error: "오늘 근무일을 찾지 못했습니다." };
    }

    const { data: taskData, error: taskError } = await supabase
      .from("tasks")
      .select("*")
      .eq("id", parsed.data.task_id)
      .eq("workday_id", workday.id)
      .maybeSingle();

    throwIfSupabaseError(taskError, "작업 정보를 불러오지 못했습니다.");

    const task = (taskData as Task | null) ?? null;

    if (!task) {
      return { ok: false, error: "해당 작업을 찾지 못했습니다." };
    }

    if (task.status === parsed.data.next_status) {
      return { ok: false, error: "이미 같은 상태입니다." };
    }

    const now = new Date().toISOString();
    const completedAt = parsed.data.next_status === "done" ? now : null;

    const { data: updatedTask, error } = await admin
      .from("tasks")
      .update({
        status: parsed.data.next_status,
        completed_at: completedAt,
        updated_at: now,
      })
      .eq("id", task.id)
      .select("id")
      .single();

    throwIfSupabaseError(error, "작업 상태 변경에 실패했습니다.");

    if (!updatedTask) {
      throw new Error("작업 상태 변경에 실패했습니다.");
    }

    const activity = resolveTaskActivity(task.title, parsed.data.next_status);

    await recordActivityEvent({
      workdayId: workday.id,
      userId: user.id,
      actorNickname: profile.nickname,
      eventType: activity.eventType,
      title: activity.title,
      description: activity.description,
      meta: { taskId: task.id, nextStatus: parsed.data.next_status },
    });

    revalidateAll();
    return { ok: true, message: activity.message };
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

function resolveTaskActivity(title: string, nextStatus: TaskStatus) {
  switch (nextStatus) {
    case "doing":
      return {
        eventType: "task_started" as const,
        title: "작업 시작",
        description: `"${title}" 작업을 시작했습니다.`,
        message: "작업을 진행 중으로 바꿨습니다.",
      };
    case "done":
      return {
        eventType: "task_completed" as const,
        title: "작업 완료",
        description: `"${title}" 작업을 완료했습니다.`,
        message: "작업을 완료로 바꿨습니다.",
      };
    default:
      return {
        eventType: "task_reopened" as const,
        title: "작업 다시 열기",
        description: `"${title}" 작업을 다시 진행할 수 있게 열었습니다.`,
        message: "작업을 다시 대기 상태로 돌렸습니다.",
      };
  }
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
  revalidatePath("/office");
  revalidatePath("/dashboard");
  revalidatePath("/history");
}
