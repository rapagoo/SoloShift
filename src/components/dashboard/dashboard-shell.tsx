"use client";

import Link from "next/link";
import { useActionState, useEffect, useMemo, useState } from "react";

import {
  changeStatusAction,
  checkInAction,
  checkOutAction,
  finishFocusSessionAction,
  startFocusSessionAction,
} from "@/app/actions/workday";
import { DashboardOverview } from "@/components/dashboard/dashboard-overview";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { EmptyState } from "@/components/empty-state";
import { ProfileForm } from "@/components/onboarding/profile-form";
import { Button } from "@/components/ui/button";
import { FormSubmitButton } from "@/components/ui/form-submit-button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { FOCUS_PRESETS, STATUS_OPTIONS } from "@/lib/constants";
import { formatMinutes, formatTimeOnly, formatTimestamp } from "@/lib/time";
import { ActionState, DashboardData, Profile } from "@/lib/types";

const initialState: ActionState = { ok: false };
const statusLabelMap = Object.fromEntries(
  STATUS_OPTIONS.map((option) => [option.value, option.label]),
);

type ModalKey = "checkin" | "status" | "focus" | "finish" | "checkout" | "profile" | null;

interface DashboardShellProps {
  profile: Profile;
  dashboard: DashboardData;
}

export function DashboardShell({ profile, dashboard }: DashboardShellProps) {
  const [openModal, setOpenModal] = useState<ModalKey>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [checkInState, checkInFormAction] = useActionState(checkInAction, initialState);
  const [statusState, statusFormAction] = useActionState(changeStatusAction, initialState);
  const [focusState, focusFormAction] = useActionState(startFocusSessionAction, initialState);
  const [finishState, finishFormAction] = useActionState(finishFocusSessionAction, initialState);
  const [checkoutState, checkoutFormAction] = useActionState(checkOutAction, initialState);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const shouldCloseModal =
    checkInState.ok ||
    statusState.ok ||
    focusState.ok ||
    finishState.ok ||
    checkoutState.ok;

  useEffect(() => {
    if (!shouldCloseModal) {
      return undefined;
    }

    const timer = window.setTimeout(() => setOpenModal(null), 0);
    return () => window.clearTimeout(timer);
  }, [shouldCloseModal]);

  const activeSession = dashboard.active_focus_session;
  const sessionElapsedMinutes = activeSession
    ? Math.max(
        0,
        Math.floor((now - new Date(activeSession.start_at).getTime()) / 60_000),
      )
    : 0;
  const sessionRemainingMinutes = activeSession
    ? Math.max(activeSession.duration_minutes - sessionElapsedMinutes, 0)
    : 0;
  const pointTotal = dashboard.workday?.total_points ?? 0;
  const workday = dashboard.workday;
  const currentStatusLabel = dashboard.active_status
    ? statusLabelMap[dashboard.active_status.status_type] ?? dashboard.active_status.status_type
    : "선택 안 됨";
  const latestFeedback =
    checkInState.error ||
    statusState.error ||
    focusState.error ||
    finishState.error ||
    checkoutState.error;
  const latestMessage =
    checkInState.message ||
    statusState.message ||
    focusState.message ||
    finishState.message ||
    checkoutState.message ||
    notice;

  const statusOptions = useMemo(
    () => STATUS_OPTIONS.map((option) => ({ value: option.value, label: option.label })),
    [],
  );

  return (
    <div className="space-y-6">
      <section className="grain overflow-hidden rounded-[2rem] border border-[var(--line)] bg-[var(--card-strong)] p-6 shadow-[var(--shadow-lg)]">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-2xl">
            <p className="font-['Space_Grotesk'] text-sm font-semibold uppercase tracking-[0.28em] text-[var(--accent)]">
              Workday Flow
            </p>
            <h1 className="mt-3 font-['Space_Grotesk'] text-4xl font-bold leading-tight text-slate-950">
              혼자 하는 하루를
              <br className="hidden md:block" />
              근무처럼 구조화합니다.
            </h1>
            <p className="mt-4 rounded-[1.5rem] bg-slate-950 px-5 py-4 text-sm leading-7 text-slate-100">
              {dashboard.character_message}
            </p>
            {latestFeedback ? (
              <p className="mt-4 text-sm text-rose-600">{latestFeedback}</p>
            ) : latestMessage ? (
              <p className="mt-4 text-sm text-emerald-700">{latestMessage}</p>
            ) : null}
          </div>
          <div className="grid w-full gap-3 sm:grid-cols-2 lg:max-w-md">
            <StatCard label="현재 상태" value={stateLabel(dashboard.top_level_state)} />
            <StatCard label="누적 포인트" value={`${pointTotal}P`} />
            <StatCard label="근무 시간" value={formatMinutes(dashboard.work_minutes_live)} />
            <StatCard label="집중 시간" value={formatMinutes(dashboard.focus_minutes_live)} />
          </div>
        </div>
      </section>

      <DashboardOverview
        activeStatus={dashboard.active_status}
        hasFocusSession={dashboard.focus_sessions.length > 0}
        isCheckedOut={Boolean(workday?.check_out_at)}
        onOpenProfile={() => setOpenModal("profile")}
        profile={profile}
        workday={workday}
      />

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <div className="rounded-[2rem] border border-[var(--line)] bg-white/75 p-6 shadow-sm">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Today
                </p>
                <h2 className="mt-2 font-['Space_Grotesk'] text-3xl font-semibold text-slate-950">
                  {workday ? workday.today_goal : "오늘 목표를 먼저 적고 출근하세요."}
                </h2>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  첫 작업: {workday?.today_first_task ?? "아직 없음"}
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  기준 출근 시각 {profile.default_check_in_time} · 연속 기록 {dashboard.streak_days}일
                </p>
              </div>
              <div className="flex flex-wrap gap-2 md:max-w-72 md:justify-end">
                {!workday ? (
                  <Button onClick={() => setOpenModal("checkin")} size="lg" type="button">
                    출근하기
                  </Button>
                ) : workday.check_out_at ? (
                  <Link
                    className="inline-flex h-12 items-center justify-center rounded-2xl border border-[var(--line)] bg-white/70 px-5 text-base font-medium text-slate-900 transition hover:bg-white"
                    href="/history"
                  >
                    기록 보기
                  </Link>
                ) : (
                  <>
                    <Button onClick={() => setOpenModal("status")} type="button" variant="secondary">
                      상태 변경
                    </Button>
                    <Button onClick={() => setOpenModal("focus")} type="button" variant="secondary">
                      집중 세션 시작
                    </Button>
                    {activeSession ? (
                      <Button onClick={() => setOpenModal("finish")} type="button">
                        세션 종료
                      </Button>
                    ) : null}
                    <Button onClick={() => setOpenModal("checkout")} type="button" variant="danger">
                      퇴근하기
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>

          {workday ? (
            <div className="grid gap-4 md:grid-cols-3">
              <InfoCard label="출근 시각" value={formatTimeOnly(workday.check_in_at, profile.timezone) ?? "-"} />
              <InfoCard label="현재 작업" value={currentStatusLabel} />
              <InfoCard
                label="출근 판정"
                value={
                  dashboard.late_minutes === null
                    ? "-"
                    : dashboard.late_minutes <= 0
                      ? "정시"
                      : `${dashboard.late_minutes}분 지각`
                }
              />
            </div>
          ) : null}

          {activeSession ? (
            <div className="rounded-[2rem] border border-[var(--line)] bg-slate-950 p-6 text-white shadow-sm">
              <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="font-['Space_Grotesk'] text-sm uppercase tracking-[0.22em] text-orange-200">
                    Active Focus Session
                  </p>
                  <h3 className="mt-2 text-3xl font-semibold">
                    {sessionRemainingMinutes > 0
                      ? `${sessionRemainingMinutes}분 남음`
                      : `${sessionElapsedMinutes}분 진행 중`}
                  </h3>
                  <p className="mt-3 text-sm text-slate-300">
                    시작 {formatTimestamp(activeSession.start_at, profile.timezone)} · 목표 {activeSession.duration_minutes}분
                  </p>
                </div>
                <Button onClick={() => setOpenModal("finish")} type="button" variant="secondary">
                  세션 종료 기록
                </Button>
              </div>
            </div>
          ) : null}

          <div className="grid gap-6 lg:grid-cols-[1fr_0.92fr]">
            <section className="rounded-[2rem] border border-[var(--line)] bg-white/75 p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-['Space_Grotesk'] text-2xl font-semibold text-slate-950">
                  오늘 상태 로그
                </h3>
                <span className="text-sm text-slate-500">{dashboard.status_logs.length}건</span>
              </div>
              {dashboard.status_logs.length === 0 ? (
                <EmptyState
                  description="출근 후 현재 작업 상태를 바꾸면 흐름이 여기에 쌓입니다."
                  title="아직 상태 로그가 없습니다."
                />
              ) : (
                <ul className="space-y-3">
                  {dashboard.status_logs.map((log) => (
                    <li className="rounded-3xl bg-slate-900/5 px-4 py-3" key={log.id}>
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="font-medium text-slate-900">
                            {statusLabelMap[log.status_type] ?? log.status_type}
                          </p>
                          <p className="mt-1 text-sm text-slate-500">
                            {formatTimeOnly(log.start_at, profile.timezone)}
                            {log.end_at
                              ? ` - ${formatTimeOnly(log.end_at, profile.timezone)}`
                              : " - 진행 중"}
                          </p>
                        </div>
                        {log.memo ? (
                          <span className="max-w-44 rounded-full bg-white px-3 py-1 text-xs text-slate-500">
                            {log.memo}
                          </span>
                        ) : null}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="rounded-[2rem] border border-[var(--line)] bg-white/75 p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-['Space_Grotesk'] text-2xl font-semibold text-slate-950">
                  오늘 포인트
                </h3>
                <span className="text-sm text-slate-500">{dashboard.point_events.length}건</span>
              </div>
              {dashboard.point_events.length === 0 ? (
                <EmptyState
                  description="출근, 세션 완료, 퇴근 회고를 기록하면 포인트가 쌓입니다."
                  title="아직 포인트 이벤트가 없습니다."
                />
              ) : (
                <ul className="space-y-3">
                  {dashboard.point_events.map((event) => (
                    <li className="flex items-center justify-between rounded-3xl bg-slate-900/5 px-4 py-3" key={event.id}>
                      <div>
                        <p className="font-medium text-slate-900">{pointLabel(event.event_type)}</p>
                        <p className="mt-1 text-sm text-slate-500">
                          {formatTimestamp(event.created_at, profile.timezone)}
                        </p>
                      </div>
                      <span className="rounded-full bg-white px-3 py-1 text-sm font-semibold text-slate-900">
                        {event.points}P
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        </div>

        <DashboardSidebar
          currentStatusLabel={currentStatusLabel}
          dashboard={dashboard}
          profile={profile}
        />
      </section>

      <Modal
        description="닉네임, 시간대, 출근 기준 시각을 바꾸면 이후 기록과 요약이 같은 기준으로 다시 계산됩니다."
        onClose={() => setOpenModal(null)}
        open={openModal === "profile"}
        title="프로필 수정"
      >
        <ProfileForm
          helperText="시간대와 기본 출근 시각은 이후 출근 판정과 기록 요약의 기준으로 사용됩니다."
          onSaved={() => {
            setNotice("프로필 설정을 저장했습니다.");
            setOpenModal(null);
          }}
          pendingLabel="프로필 저장 중..."
          profile={profile}
          submitLabel="프로필 저장"
          successRedirectTo={null}
        />
      </Modal>

      <Modal
        description="오늘 목표와 첫 작업을 적고 하루를 명시적으로 시작합니다."
        onClose={() => setOpenModal(null)}
        open={openModal === "checkin"}
        title="출근 시작"
      >
        <form action={checkInFormAction} className="space-y-4">
          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-700">오늘 목표</span>
            <Textarea name="today_goal" placeholder="예: 알고리즘 2문제 + 포트폴리오 수정" required />
          </label>
          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-700">오늘 첫 작업</span>
            <Input name="today_first_task" placeholder="예: BFS 복습" required />
          </label>
          {checkInState.error ? <p className="text-sm text-rose-600">{checkInState.error}</p> : null}
          <div className="flex justify-end gap-2">
            <Button onClick={() => setOpenModal(null)} type="button" variant="ghost">
              취소
            </Button>
            <FormSubmitButton idleLabel="출근 기록" pendingLabel="출근 저장 중..." />
          </div>
        </form>
      </Modal>

      <Modal
        description="지금 무엇을 하고 있는지 남겨두면 하루 흐름이 훨씬 선명해집니다."
        onClose={() => setOpenModal(null)}
        open={openModal === "status"}
        title="상태 변경"
      >
        <form action={statusFormAction} className="space-y-4">
          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-700">현재 상태</span>
            <Select defaultValue={dashboard.active_status?.status_type} name="status_type" required>
              <option value="">상태를 선택하세요</option>
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </label>
          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-700">메모</span>
            <Input name="memo" placeholder="선택 입력" />
          </label>
          {statusState.error ? <p className="text-sm text-rose-600">{statusState.error}</p> : null}
          <div className="flex justify-end gap-2">
            <Button onClick={() => setOpenModal(null)} type="button" variant="ghost">
              취소
            </Button>
            <FormSubmitButton idleLabel="상태 저장" pendingLabel="저장 중..." />
          </div>
        </form>
      </Modal>

      <Modal
        description="집중 시간을 분리해서 기록하면 포인트와 회고가 훨씬 또렷해집니다."
        onClose={() => setOpenModal(null)}
        open={openModal === "focus"}
        title="집중 세션 시작"
      >
        <form action={focusFormAction} className="space-y-4">
          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-700">세션 길이</span>
            <Select defaultValue="25" name="duration_minutes" required>
              {FOCUS_PRESETS.map((preset) => (
                <option key={preset} value={preset}>
                  {preset}분
                </option>
              ))}
              <option value="90">90분</option>
            </Select>
          </label>
          {focusState.error ? <p className="text-sm text-rose-600">{focusState.error}</p> : null}
          <div className="flex justify-end gap-2">
            <Button onClick={() => setOpenModal(null)} type="button" variant="ghost">
              취소
            </Button>
            <FormSubmitButton idleLabel="세션 시작" pendingLabel="시작 중..." />
          </div>
        </form>
      </Modal>

      <Modal
        description="세션을 마친 뒤 짧은 메모를 남기면 나중에 흐름을 복기하기 쉽습니다."
        onClose={() => setOpenModal(null)}
        open={openModal === "finish"}
        title="집중 세션 종료"
      >
        <form action={finishFormAction} className="space-y-4">
          <input name="focus_session_id" type="hidden" value={activeSession?.id ?? ""} />
          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-700">세션 결과</span>
            <Select defaultValue="true" name="is_completed">
              <option value="true">계획대로 완료</option>
              <option value="false">중간 종료</option>
            </Select>
          </label>
          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-700">짧은 메모</span>
            <Textarea name="memo" placeholder="예: 2문제 풀이 완료, 한 문제는 다시 봐야 함" />
          </label>
          {finishState.error ? <p className="text-sm text-rose-600">{finishState.error}</p> : null}
          <div className="flex justify-end gap-2">
            <Button onClick={() => setOpenModal(null)} type="button" variant="ghost">
              취소
            </Button>
            <FormSubmitButton idleLabel="세션 종료 저장" pendingLabel="저장 중..." />
          </div>
        </form>
      </Modal>

      <Modal
        description="하루를 닫고, 내일의 시작 장벽을 낮춰두세요."
        onClose={() => setOpenModal(null)}
        open={openModal === "checkout"}
        title="퇴근 정리"
      >
        <form action={checkoutFormAction} className="space-y-4">
          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-700">오늘 회고</span>
            <Textarea
              name="daily_review"
              placeholder="오늘 한 일, 잘된 점, 막힌 점을 짧게 남겨주세요."
              required
            />
          </label>
          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-700">내일 첫 작업</span>
            <Input name="tomorrow_first_task" placeholder="예: 포트폴리오 소개 섹션 수정" required />
          </label>
          <label className="flex items-center gap-3 rounded-2xl bg-slate-900/5 px-4 py-3 text-sm text-slate-700">
            <input name="goal_completed" type="checkbox" value="true" />
            오늘 목표를 달성했습니다.
          </label>
          {checkoutState.error ? <p className="text-sm text-rose-600">{checkoutState.error}</p> : null}
          <div className="flex justify-end gap-2">
            <Button onClick={() => setOpenModal(null)} type="button" variant="ghost">
              취소
            </Button>
            <FormSubmitButton idleLabel="퇴근 완료" pendingLabel="퇴근 저장 중..." variant="danger" />
          </div>
        </form>
      </Modal>
    </div>
  );
}

function stateLabel(state: DashboardData["top_level_state"]) {
  switch (state) {
    case "before_check_in":
      return "출근 전";
    case "working":
      return "근무 중";
    case "resting":
      return "휴식 중";
    case "away":
      return "자리 비움";
    case "checked_out":
      return "퇴근 완료";
  }
}

function pointLabel(value: DashboardData["point_events"][number]["event_type"]) {
  switch (value) {
    case "check_in_on_time":
      return "정시 출근";
    case "check_in_minor_late":
      return "10분 이내 지각 출근";
    case "check_in_late":
      return "지각 출근";
    case "focus_session_complete":
      return "집중 세션 완료";
    case "goal_completed":
      return "오늘 목표 달성";
    case "daily_review_submitted":
      return "퇴근 회고 작성";
    case "five_day_streak_bonus":
      return "5일 연속 퇴근";
  }
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.5rem] bg-white/80 px-4 py-4">
      <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-slate-950">{value}</p>
    </div>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.5rem] border border-[var(--line)] bg-white/75 px-4 py-4 shadow-sm">
      <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{label}</p>
      <p className="mt-2 text-lg font-semibold text-slate-950">{value}</p>
    </div>
  );
}

function MiniRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-2xl bg-slate-900/5 px-4 py-3 text-sm">
      <span className="text-slate-500">{label}</span>
      <span className="font-medium text-slate-900">{value}</span>
    </div>
  );
}




