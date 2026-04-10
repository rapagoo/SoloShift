"use client";

import { EmptyState } from "@/components/empty-state";
import { FormSubmitButton } from "@/components/ui/form-submit-button";
import { getTaskStatusLabel } from "@/lib/constants";
import { ActionState, Task } from "@/lib/types";
import { formatTimestamp } from "@/lib/time";

interface TaskBoardProps {
  profileTimezone: string;
  tasks: Task[];
  isLocked: boolean;
  statusState: ActionState;
  taskStatusAction: (payload: FormData) => void;
}

export function TaskBoard({
  profileTimezone,
  tasks,
  isLocked,
  statusState,
  taskStatusAction,
}: TaskBoardProps) {
  const completedCount = tasks.filter((task) => task.status === "done").length;

  return (
    <section className="rounded-[2rem] border border-[var(--line)] bg-white/75 p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h3 className="font-['Space_Grotesk'] text-2xl font-semibold text-slate-950">
            오늘 작업 보드
          </h3>
          <p className="mt-2 text-sm text-slate-500">
            총 {tasks.length}개, 완료 {completedCount}개
          </p>
        </div>
        <span className="rounded-full bg-slate-900/5 px-3 py-1 text-sm text-slate-600">
          {isLocked ? "퇴근 완료" : "진행 가능"}
        </span>
      </div>

      {statusState.error ? <p className="mb-4 text-sm text-rose-600">{statusState.error}</p> : null}

      {tasks.length === 0 ? (
        <EmptyState
          description="오늘 해야 할 일을 먼저 한두 개만 적어두면 상태 변경과 회고가 훨씬 쉬워집니다."
          title="아직 등록된 작업이 없습니다."
        />
      ) : (
        <ul className="space-y-3">
          {tasks.map((task) => (
            <li className="rounded-3xl border border-[var(--line)] bg-white/80 p-4" key={task.id}>
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${getTaskToneClassName(task.status)}`}
                    >
                      {getTaskStatusLabel(task.status)}
                    </span>
                    <p className="text-base font-medium text-slate-950">{task.title}</p>
                  </div>
                  {task.detail ? (
                    <p className="text-sm leading-6 text-slate-500">{task.detail}</p>
                  ) : null}
                  <p className="text-xs text-slate-400">
                    생성 {formatTimestamp(task.created_at, profileTimezone)}
                    {task.completed_at
                      ? ` · 완료 ${formatTimestamp(task.completed_at, profileTimezone)}`
                      : ""}
                  </p>
                </div>
                {!isLocked ? (
                  <div className="flex flex-wrap gap-2 md:justify-end">
                    {getTaskActions(task.status).map((action) => (
                      <form action={taskStatusAction} key={action.nextStatus}>
                        <input name="task_id" type="hidden" value={task.id} />
                        <input name="next_status" type="hidden" value={action.nextStatus} />
                        <FormSubmitButton
                          className="min-w-0"
                          idleLabel={action.label}
                          pendingLabel={action.pendingLabel}
                          size="sm"
                          variant={action.variant}
                        />
                      </form>
                    ))}
                  </div>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function getTaskActions(status: Task["status"]) {
  if (status === "todo") {
    return [
      {
        label: "시작",
        pendingLabel: "시작 중...",
        nextStatus: "doing",
        variant: "secondary" as const,
      },
      {
        label: "완료",
        pendingLabel: "완료 중...",
        nextStatus: "done",
        variant: "primary" as const,
      },
    ];
  }

  if (status === "doing") {
    return [
      {
        label: "완료",
        pendingLabel: "완료 중...",
        nextStatus: "done",
        variant: "primary" as const,
      },
      {
        label: "보류",
        pendingLabel: "보류 중...",
        nextStatus: "todo",
        variant: "ghost" as const,
      },
    ];
  }

  return [
    {
      label: "다시 열기",
      pendingLabel: "변경 중...",
      nextStatus: "todo",
      variant: "secondary" as const,
    },
  ];
}

function getTaskToneClassName(status: Task["status"]) {
  switch (status) {
    case "done":
      return "bg-emerald-50 text-emerald-700";
    case "doing":
      return "bg-orange-50 text-orange-700";
    default:
      return "bg-slate-900/5 text-slate-700";
  }
}
