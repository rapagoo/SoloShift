"use client";

import { useActionState } from "react";

import { createTaskAction, updateTaskStatusAction } from "@/app/actions/tasks";
import { FormPendingNotice } from "@/components/ui/form-pending-notice";
import { FormSubmitButton } from "@/components/ui/form-submit-button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { getTaskStatusLabel } from "@/lib/constants";
import { OfficePresenceMember } from "@/lib/office/types";
import { formatTimestamp } from "@/lib/time";
import { ActionState, OfficeActivityEvent, Profile, Task } from "@/lib/types";

const initialState: ActionState = { ok: false };

interface OfficeSidebarProps {
  activity: OfficeActivityEvent[];
  members: OfficePresenceMember[];
  profile: Profile;
  tasks: Task[];
  statusLabel: string | null;
  workdayGoal: string | null;
  isLocked: boolean;
}

export function OfficeSidebar({
  activity,
  members,
  profile,
  tasks,
  statusLabel,
  workdayGoal,
  isLocked,
}: OfficeSidebarProps) {
  const [taskCreateState, taskCreateAction] = useActionState(createTaskAction, initialState);
  const [taskStatusState, taskStatusAction] = useActionState(updateTaskStatusAction, initialState);

  return (
    <aside className="space-y-4 xl:sticky xl:top-6">
      <SidebarCard eyebrow="Desk Panel" title="내 자리 패널">
        <div className="space-y-3 text-sm leading-6 text-[#5d4b3d]">
          <SidebarRow label="현재 상태" value={statusLabel ?? "출근 전"} />
          <SidebarRow label="오늘 목표" value={workdayGoal ?? "아직 정해지지 않았음"} />
          <SidebarRow label="온라인" value={`${members.length}명`} />
        </div>
      </SidebarCard>

      <SidebarCard eyebrow="Quick Task" title="오피스에서 바로 작업 추가">
        {isLocked ? (
          <p className="text-sm leading-6 text-[#7a6656]">퇴근 후에는 새 작업을 추가할 수 없습니다.</p>
        ) : (
          <form action={taskCreateAction} className="space-y-3">
            <Input name="title" placeholder="예: 알고리즘 1문제 정리" required />
            <Textarea name="detail" placeholder="짧은 메모가 필요하면 적어두세요." rows={3} />
            {taskCreateState.error ? <p className="text-sm text-rose-700">{taskCreateState.error}</p> : null}
            {taskCreateState.message ? <p className="text-sm text-emerald-700">{taskCreateState.message}</p> : null}
            <FormPendingNotice message="작업을 오피스 사이드바에서 추가하는 중입니다." />
            <FormSubmitButton idleLabel="작업 추가" pendingLabel="작업 추가 중..." size="sm" />
          </form>
        )}
      </SidebarCard>

      <SidebarCard eyebrow="Today Tasks" title="오늘 작업 보드">
        {tasks.length === 0 ? (
          <p className="text-sm leading-6 text-[#7a6656]">
            오늘 작업이 아직 없습니다. 사이드바에서 바로 추가해보세요.
          </p>
        ) : (
          <ul className="space-y-3">
            {tasks.slice(0, 5).map((task) => (
              <li className="rounded-[1.25rem] border border-[#dcc8b1] bg-white/75 p-3" key={task.id}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-[#2a1f17]">{task.title}</p>
                    <p className="mt-1 text-xs text-[#7a6656]">{getTaskStatusLabel(task.status)}</p>
                  </div>
                  {!isLocked ? (
                    <div className="flex flex-wrap gap-2">
                      {getTaskActions(task.status).map((action) => (
                        <form action={taskStatusAction} key={action.nextStatus}>
                          <input name="task_id" type="hidden" value={task.id} />
                          <input name="next_status" type="hidden" value={action.nextStatus} />
                          <FormSubmitButton
                            className="min-w-0 rounded-xl"
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
        {taskStatusState.error ? <p className="mt-3 text-sm text-rose-700">{taskStatusState.error}</p> : null}
      </SidebarCard>

      <SidebarCard eyebrow="Office Feed" title="채팅처럼 읽는 오피스 반응">
        {activity.length === 0 ? (
          <p className="text-sm leading-6 text-[#7a6656]">아직 오피스 피드가 조용합니다.</p>
        ) : (
          <div className="space-y-3">
            {activity.slice(0, 8).map((item) => (
              <div className="rounded-[1.4rem] border border-[#dcc8b1] bg-white/80 p-3" key={item.id}>
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium text-[#2a1f17]">{item.actor_nickname}</p>
                  <span className="text-[11px] text-[#7a6656]">
                    {formatTimestamp(item.created_at, profile.timezone)}
                  </span>
                </div>
                <p className="mt-2 text-sm text-[#4f3d31]">{item.title}</p>
                {item.description ? (
                  <p className="mt-1 text-sm leading-6 text-[#7a6656]">{item.description}</p>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </SidebarCard>
    </aside>
  );
}

function SidebarCard({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[1.8rem] border border-[#dcc8b1] bg-[#fff6ea] p-4 shadow-[0_12px_30px_-24px_rgba(90,70,53,0.35)]">
      <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8b5e34]">
        {eyebrow}
      </p>
      <h3 className="mt-2 font-['Space_Grotesk'] text-xl font-semibold text-[#2a1f17]">{title}</h3>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function SidebarRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-[1rem] border border-[#ead8c4] bg-white/70 px-3 py-3">
      <span className="text-[#7a6656]">{label}</span>
      <span className="max-w-[65%] text-right font-medium text-[#2a1f17]">{value}</span>
    </div>
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
