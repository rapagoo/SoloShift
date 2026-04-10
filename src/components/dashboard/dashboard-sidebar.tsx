import Link from "next/link";

import { EmptyState } from "@/components/empty-state";
import { getTimezoneLabel } from "@/lib/constants";
import { formatTimeOnly } from "@/lib/time";
import { DashboardData, Profile } from "@/lib/types";

interface DashboardSidebarProps {
  profile: Profile;
  dashboard: DashboardData;
  currentStatusLabel: string;
}

export function DashboardSidebar({ profile, dashboard, currentStatusLabel }: DashboardSidebarProps) {
  const workday = dashboard.workday;

  if (!workday) {
    return (
      <aside className="space-y-6">
        <section className="rounded-[2rem] border border-[var(--line)] bg-white/75 p-5 shadow-sm">
          <h3 className="font-['Space_Grotesk'] text-2xl font-semibold text-slate-950">
            시작 전 체크
          </h3>
          <p className="mt-3 text-sm leading-6 text-slate-500">
            설정은 이미 준비되어 있습니다. 이제 출근 버튼을 누르면 오늘 루프를 시작할 수 있습니다.
          </p>
          <div className="mt-4 grid gap-3">
            <MiniRow label="시간대" value={getTimezoneLabel(profile.timezone)} />
            <MiniRow label="기본 출근 시각" value={profile.default_check_in_time} />
            <MiniRow label="다음 단계" value="출근하기 버튼 누르기" />
          </div>
        </section>
        <section className="rounded-[2rem] border border-[var(--line)] bg-white/75 p-5 shadow-sm">
          <h3 className="font-['Space_Grotesk'] text-2xl font-semibold text-slate-950">
            기록 화면
          </h3>
          <p className="mt-3 text-sm leading-6 text-slate-500">
            이전 근무일이나 누적 흐름은 기록 화면에서 언제든 확인할 수 있습니다.
          </p>
          <div className="mt-5">
            <Link className={linkButtonClassName} href="/history">
              기록 화면 열기
            </Link>
          </div>
        </section>
      </aside>
    );
  }

  if (workday.check_out_at) {
    return (
      <aside className="space-y-6">
        <section className="rounded-[2rem] border border-[var(--line)] bg-white/75 p-5 shadow-sm">
          <h3 className="font-['Space_Grotesk'] text-2xl font-semibold text-slate-950">
            오늘 마감 요약
          </h3>
          <p className="mt-3 text-sm leading-6 text-slate-500">
            오늘 근무일은 안전하게 저장되었습니다. 기록 화면에서 상태, 세션, 포인트를 다시 확인할 수 있어요.
          </p>
          <div className="mt-4 grid gap-3">
            <MiniRow label="퇴근 상태" value="완료" />
            <MiniRow label="오늘 목표" value={workday.goal_completed ? "달성" : "미달성"} />
            <MiniRow label="내일 첫 작업" value={workday.tomorrow_first_task ?? "미정"} />
          </div>
          <div className="mt-5">
            <Link className={linkButtonClassName} href="/history">
              기록 화면 열기
            </Link>
          </div>
        </section>
      </aside>
    );
  }

  return (
    <aside className="space-y-6">
      <section className="rounded-[2rem] border border-[var(--line)] bg-white/75 p-5 shadow-sm">
        <h3 className="font-['Space_Grotesk'] text-2xl font-semibold text-slate-950">
          오늘 집중 세션
        </h3>
        <div className="mt-4 space-y-3">
          {dashboard.focus_sessions.length === 0 ? (
            <EmptyState
              description="업무 상태를 고른 뒤 25분 또는 50분 세션으로 시작해보세요."
              title="집중 세션 기록이 없습니다."
            />
          ) : (
            dashboard.focus_sessions.map((session) => (
              <div className="rounded-3xl bg-slate-900/5 px-4 py-3" key={session.id}>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-slate-900">
                      {session.is_completed ? "완료 세션" : session.end_at ? "중단 세션" : "진행 중 세션"}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      {formatTimeOnly(session.start_at, profile.timezone)}
                      {session.end_at
                        ? ` - ${formatTimeOnly(session.end_at, profile.timezone)}`
                        : " - 진행 중"}
                    </p>
                  </div>
                  <span className="rounded-full bg-white px-3 py-1 text-sm text-slate-700">
                    {session.end_at ? `${session.duration_minutes}분` : `목표 ${session.duration_minutes}분`}
                  </span>
                </div>
                {session.memo ? (
                  <p className="mt-3 text-sm leading-6 text-slate-500">{session.memo}</p>
                ) : null}
              </div>
            ))
          )}
        </div>
      </section>

      <section className="rounded-[2rem] border border-[var(--line)] bg-white/75 p-5 shadow-sm">
        <h3 className="font-['Space_Grotesk'] text-2xl font-semibold text-slate-950">
          퇴근 준비
        </h3>
        <p className="mt-3 text-sm leading-6 text-slate-500">
          오늘 막판에 회고와 내일 첫 작업을 남기면 다음 출근 진입이 훨씬 쉬워집니다.
        </p>
        <div className="mt-4 grid gap-3">
          <MiniRow label="현재 작업" value={currentStatusLabel} />
          <MiniRow label="집중 세션" value={dashboard.active_focus_session ? "진행 중" : "대기 중"} />
          <MiniRow label="기록 화면" value="일간/주간 요약 확인 가능" />
        </div>
        <div className="mt-5">
          <Link className={linkButtonClassName} href="/history">
            기록 화면 열기
          </Link>
        </div>
      </section>
    </aside>
  );
}

const linkButtonClassName =
  "inline-flex w-full items-center justify-center rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-sm font-medium text-slate-900 transition hover:bg-slate-50";

function MiniRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl bg-slate-900/5 px-4 py-3 text-sm">
      <span className="text-slate-500">{label}</span>
      <span className="max-w-[60%] text-right font-medium text-slate-900">{value}</span>
    </div>
  );
}
