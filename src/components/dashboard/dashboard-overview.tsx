"use client";

import { Button } from "@/components/ui/button";
import { getStatusLabel, getTimezoneLabel } from "@/lib/constants";
import { Profile, StatusLog, Workday } from "@/lib/types";

interface DashboardOverviewProps {
  profile: Profile;
  workday: Workday | null;
  activeStatus: StatusLog | null;
  hasFocusSession: boolean;
  isCheckedOut: boolean;
  onOpenProfile: () => void;
}

type FlowStepState = "complete" | "next" | "waiting";

export function DashboardOverview({
  profile,
  workday,
  activeStatus,
  hasFocusSession,
  isCheckedOut,
  onOpenProfile,
}: DashboardOverviewProps) {
  const flowSteps = buildFlowSteps({
    workday,
    activeStatus,
    hasFocusSession,
    isCheckedOut,
  });
  const nextAction = getNextActionHint({
    workday,
    activeStatus,
    hasFocusSession,
    isCheckedOut,
  });

  return (
    <section className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
      <section className="rounded-[2rem] border border-[var(--line)] bg-white/75 p-5 shadow-sm">
        <p className="font-['Space_Grotesk'] text-sm font-semibold uppercase tracking-[0.22em] text-slate-400">
          Flow Snapshot
        </p>
        <h2 className="mt-2 font-['Space_Grotesk'] text-2xl font-semibold text-slate-950">
          오늘 흐름 체크
        </h2>
        <p className="mt-3 text-sm leading-6 text-slate-500">
          다음 추천 액션: {nextAction}
        </p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {flowSteps.map((step) => (
            <FlowStepCard key={step.label} {...step} />
          ))}
        </div>
      </section>

      <section className="rounded-[2rem] border border-[var(--line)] bg-white/75 p-5 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="font-['Space_Grotesk'] text-sm font-semibold uppercase tracking-[0.22em] text-slate-400">
              Work Profile
            </p>
            <h2 className="mt-2 font-['Space_Grotesk'] text-2xl font-semibold text-slate-950">
              {profile.nickname}님의 기준 설정
            </h2>
          </div>
          <Button onClick={onOpenProfile} type="button" variant="secondary">
            프로필 수정
          </Button>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <CompactInfoCard label="닉네임" value={profile.nickname} />
          <CompactInfoCard label="시간대" value={getTimezoneLabel(profile.timezone)} />
          <CompactInfoCard label="기본 출근 시각" value={profile.default_check_in_time} />
        </div>
      </section>
    </section>
  );
}

function buildFlowSteps(params: {
  workday: Workday | null;
  activeStatus: StatusLog | null;
  hasFocusSession: boolean;
  isCheckedOut: boolean;
}) {
  return [
    {
      label: "출근",
      description: params.workday ? "오늘 근무일이 시작되었습니다." : "오늘 목표와 첫 작업을 적고 출근하세요.",
      state: params.workday ? "complete" : "next",
    },
    {
      label: "상태 선택",
      description: params.activeStatus
        ? `${getStatusLabel(params.activeStatus.status_type)} 상태가 기록 중입니다.`
        : params.workday && !params.isCheckedOut
          ? "지금 하고 있는 작업 상태를 선택해보세요."
          : "출근 후 현재 작업 상태를 기록할 수 있습니다.",
      state: params.activeStatus ? "complete" : params.workday && !params.isCheckedOut ? "next" : "waiting",
    },
    {
      label: "집중 세션",
      description: params.hasFocusSession
        ? "오늘 집중 세션 기록이 남아 있습니다."
        : params.workday && !params.isCheckedOut
          ? "업무 상태에서 25분 또는 50분 세션을 시작할 수 있습니다."
          : "출근 후 집중 세션을 시작할 수 있습니다.",
      state: params.hasFocusSession ? "complete" : params.workday && !params.isCheckedOut ? "next" : "waiting",
    },
    {
      label: "퇴근 정리",
      description: params.isCheckedOut
        ? "회고와 내일 첫 작업이 저장되었습니다."
        : params.workday
          ? "회고와 내일 첫 작업을 남기면 오늘 흐름이 완성됩니다."
          : "하루를 마감할 때 회고를 남길 수 있습니다.",
      state: params.isCheckedOut ? "complete" : params.workday ? "next" : "waiting",
    },
  ] as Array<{
    label: string;
    description: string;
    state: FlowStepState;
  }>;
}

function getNextActionHint(params: {
  workday: Workday | null;
  activeStatus: StatusLog | null;
  hasFocusSession: boolean;
  isCheckedOut: boolean;
}) {
  if (!params.workday) {
    return "출근하기 버튼으로 오늘 근무일을 시작하세요.";
  }

  if (params.isCheckedOut) {
    return "기록 화면에서 오늘 상태, 세션, 포인트를 다시 확인해보세요.";
  }

  if (!params.activeStatus) {
    return "현재 무엇을 하는지 상태를 먼저 선택해보세요.";
  }

  if (!params.hasFocusSession) {
    return "업무 상태라면 바로 집중 세션을 시작할 수 있습니다.";
  }

  return "진행 중인 흐름을 이어가고, 마무리 전에는 퇴근 정리를 남겨보세요.";
}

function CompactInfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.5rem] border border-[var(--line)] bg-white/80 px-4 py-4 shadow-sm">
      <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{label}</p>
      <p className="mt-2 text-sm font-medium leading-6 text-slate-900">{value}</p>
    </div>
  );
}

function FlowStepCard({
  label,
  description,
  state,
}: {
  label: string;
  description: string;
  state: FlowStepState;
}) {
  const toneClassName =
    state === "complete"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : state === "next"
        ? "border-orange-200 bg-orange-50 text-[var(--accent-strong)]"
        : "border-[var(--line)] bg-white text-slate-500";
  const badgeText = state === "complete" ? "완료" : state === "next" ? "다음" : "대기";

  return (
    <div className="rounded-[1.5rem] border border-[var(--line)] bg-white/80 p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <p className="font-medium text-slate-900">{label}</p>
        <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${toneClassName}`}>
          {badgeText}
        </span>
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-500">{description}</p>
    </div>
  );
}
