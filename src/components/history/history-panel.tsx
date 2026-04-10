import { EmptyState } from "@/components/empty-state";
import { getStatusLabel } from "@/lib/constants";
import { getPointEventLabel } from "@/lib/domain/dialogue";
import {
  formatLocalDateLabel,
  formatMinutes,
  formatTimeOnly,
  formatTimestamp,
} from "@/lib/time";
import { HistoryEntry, Profile, WeeklySummary } from "@/lib/types";

interface HistoryPanelProps {
  profile: Profile;
  weeklySummary: WeeklySummary;
  entries: HistoryEntry[];
}

export function HistoryPanel({ profile, weeklySummary, entries }: HistoryPanelProps) {
  return (
    <div className="space-y-6">
      <section className="grain rounded-[2rem] border border-[var(--line)] bg-[var(--card-strong)] p-6 shadow-[var(--shadow-lg)]">
        <p className="font-['Space_Grotesk'] text-sm font-semibold uppercase tracking-[0.24em] text-[var(--accent)]">
          Weekly Summary
        </p>
        <div className="mt-3 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="font-['Space_Grotesk'] text-3xl font-bold text-slate-950">
              {weeklySummary.range_label}
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              이번 주 출근 {weeklySummary.days_checked_in}일, 연속 기록 {weeklySummary.streak_days}일
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <Metric label="평균 출근" value={weeklySummary.average_check_in ?? "-"} />
            <Metric label="평균 퇴근" value={weeklySummary.average_check_out ?? "-"} />
            <Metric label="근무 시간" value={formatMinutes(weeklySummary.total_work_minutes)} />
            <Metric label="포인트" value={`${weeklySummary.total_points}P`} />
          </div>
        </div>
      </section>

      <section className="space-y-4">
        {entries.length === 0 ? (
          <EmptyState
            description="출근과 퇴근을 한 번만 기록해도 여기서 흐름을 다시 확인할 수 있어요."
            title="아직 저장된 근무일이 없습니다."
          />
        ) : (
          entries.map((entry) => {
            const checkedOut = Boolean(entry.workday.check_out_at);

            return (
              <article
                className="rounded-[2rem] border border-[var(--line)] bg-white/70 p-5 shadow-sm"
                key={entry.workday.id}
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-['Space_Grotesk'] text-2xl font-semibold text-slate-950">
                        {formatLocalDateLabel(entry.workday.local_date)}
                      </h3>
                      {entry.workday.goal_completed ? <Badge label="목표 달성" tone="success" /> : null}
                      {checkedOut ? <Badge label="퇴근 완료" /> : <Badge label="퇴근 전" tone="warning" />}
                    </div>
                    <p className="mt-2 text-sm text-slate-500">
                      출근 {formatTimeOnly(entry.workday.check_in_at, profile.timezone) ?? "-"}
                      {" · "}
                      퇴근 {formatTimeOnly(entry.workday.check_out_at, profile.timezone) ?? "-"}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2 text-sm text-slate-600">
                    <Badge label={`근무 ${formatMinutes(entry.workday.total_work_minutes)}`} />
                    <Badge label={`집중 ${formatMinutes(entry.workday.total_focus_minutes)}`} />
                    <Badge label={`${entry.workday.total_points}P`} />
                  </div>
                </div>

                <div className="mt-5 grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
                  <div className="space-y-4">
                    <Block title="오늘 목표" value={entry.workday.today_goal} />
                    <Block title="오늘 첫 작업" value={entry.workday.today_first_task} />
                    <Block title="퇴근 회고" value={entry.workday.daily_review ?? "기록 없음"} />
                    <Block title="내일 첫 작업" value={entry.workday.tomorrow_first_task ?? "미정"} />
                  </div>
                  <div className="space-y-4">
                    <Panel title="상태 로그" count={entry.status_logs.length}>
                      {entry.status_logs.length === 0 ? (
                        <li>기록 없음</li>
                      ) : (
                        entry.status_logs.map((log) => (
                          <li className="rounded-2xl bg-slate-900/5 px-3 py-3" key={log.id}>
                            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                              <span className="font-medium text-slate-900">
                                {getStatusLabel(log.status_type)}
                              </span>
                              <span className="text-slate-500">
                                {formatTimeOnly(log.start_at, profile.timezone)}
                                {log.end_at
                                  ? ` - ${formatTimeOnly(log.end_at, profile.timezone)}`
                                  : " - 진행 중"}
                              </span>
                            </div>
                            {log.memo ? (
                              <p className="mt-2 text-slate-500">메모: {log.memo}</p>
                            ) : null}
                          </li>
                        ))
                      )}
                    </Panel>
                    <Panel title="집중 세션" count={entry.focus_sessions.length}>
                      {entry.focus_sessions.length === 0 ? (
                        <li>기록 없음</li>
                      ) : (
                        entry.focus_sessions.map((session) => (
                          <li className="rounded-2xl bg-slate-900/5 px-3 py-3" key={session.id}>
                            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                              <span className="font-medium text-slate-900">
                                {session.is_completed ? "완료 세션" : session.end_at ? "중단 세션" : "진행 중 세션"}
                              </span>
                              <span className="text-slate-500">
                                {session.end_at ? `${session.duration_minutes}분` : `목표 ${session.duration_minutes}분`}
                              </span>
                            </div>
                            <p className="mt-1 text-slate-500">
                              {formatTimeOnly(session.start_at, profile.timezone)}
                              {session.end_at
                                ? ` - ${formatTimeOnly(session.end_at, profile.timezone)}`
                                : " - 진행 중"}
                            </p>
                            {session.memo ? (
                              <p className="mt-2 text-slate-500">메모: {session.memo}</p>
                            ) : null}
                          </li>
                        ))
                      )}
                    </Panel>
                    <Panel title="포인트 이벤트" count={entry.point_events.length}>
                      {entry.point_events.length === 0 ? (
                        <li>기록 없음</li>
                      ) : (
                        entry.point_events.map((event) => (
                          <li className="flex items-center justify-between gap-3 rounded-2xl bg-slate-900/5 px-3 py-3" key={event.id}>
                            <div>
                              <p className="font-medium text-slate-900">{getPointEventLabel(event.event_type)}</p>
                              <p className="mt-1 text-slate-500">
                                {formatTimestamp(event.created_at, profile.timezone)}
                              </p>
                            </div>
                            <span className="rounded-full bg-white px-3 py-1 text-sm font-semibold text-slate-900">
                              {event.points}P
                            </span>
                          </li>
                        ))
                      )}
                    </Panel>
                  </div>
                </div>
              </article>
            );
          })
        )}
      </section>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl bg-white/75 px-4 py-3 text-right">
      <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{label}</p>
      <p className="mt-1 text-lg font-semibold text-slate-900">{value}</p>
    </div>
  );
}

function Badge({ label, tone = "default" }: { label: string; tone?: "default" | "success" | "warning" }) {
  const toneClassName =
    tone === "success"
      ? "bg-emerald-50 text-emerald-700"
      : tone === "warning"
        ? "bg-amber-50 text-amber-700"
        : "bg-slate-900/5 text-slate-700";

  return <span className={`rounded-full px-3 py-1.5 ${toneClassName}`}>{label}</span>;
}

function Block({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-3xl border border-[var(--line)] bg-white/80 p-4">
      <p className="text-sm font-semibold text-slate-700">{title}</p>
      <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">{value}</p>
    </div>
  );
}

function Panel({ title, count, children }: { title: string; count: number; children: React.ReactNode }) {
  return (
    <div className="rounded-3xl border border-[var(--line)] bg-white/80 p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-slate-700">{title}</p>
        <span className="text-xs uppercase tracking-[0.16em] text-slate-400">{count}건</span>
      </div>
      <ul className="mt-3 space-y-2 text-sm text-slate-600">{children}</ul>
    </div>
  );
}
