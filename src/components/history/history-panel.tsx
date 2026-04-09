import { EmptyState } from "@/components/empty-state";
import { getPointEventLabel } from "@/lib/domain/dialogue";
import { formatLocalDateLabel, formatMinutes, formatTimeOnly } from "@/lib/time";
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
          entries.map((entry) => (
            <article
              className="rounded-[2rem] border border-[var(--line)] bg-white/70 p-5 shadow-sm"
              key={entry.workday.id}
            >
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <h3 className="font-['Space_Grotesk'] text-2xl font-semibold text-slate-950">
                    {formatLocalDateLabel(entry.workday.local_date)}
                  </h3>
                  <p className="mt-2 text-sm text-slate-500">
                    출근 {formatTimeOnly(entry.workday.check_in_at, profile.timezone) ?? "-"}
                    {' · '}
                    퇴근 {formatTimeOnly(entry.workday.check_out_at, profile.timezone) ?? "-"}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 text-sm text-slate-600">
                  <Badge label={`근무 ${formatMinutes(entry.workday.total_work_minutes)}`} />
                  <Badge label={`집중 ${formatMinutes(entry.workday.total_focus_minutes)}`} />
                  <Badge label={`${entry.workday.total_points}P`} />
                </div>
              </div>

              <div className="mt-5 grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
                <div className="space-y-4">
                  <Block title="오늘 목표" value={entry.workday.today_goal} />
                  <Block title="오늘 첫 작업" value={entry.workday.today_first_task} />
                  <Block title="퇴근 회고" value={entry.workday.daily_review ?? "기록 없음"} />
                  <Block title="내일 첫 작업" value={entry.workday.tomorrow_first_task ?? "미정"} />
                </div>
                <div className="space-y-4">
                  <div className="rounded-3xl border border-[var(--line)] bg-white/80 p-4">
                    <p className="text-sm font-semibold text-slate-700">상태 로그</p>
                    <ul className="mt-3 space-y-2 text-sm text-slate-600">
                      {entry.status_logs.length === 0 ? (
                        <li>기록 없음</li>
                      ) : (
                        entry.status_logs.map((log) => (
                          <li className="rounded-2xl bg-slate-900/5 px-3 py-2" key={log.id}>
                            {log.status_type} · {formatTimeOnly(log.start_at, profile.timezone)}
                            {log.end_at
                              ? ` - ${formatTimeOnly(log.end_at, profile.timezone)}`
                              : " - 진행 중"}
                          </li>
                        ))
                      )}
                    </ul>
                  </div>
                  <div className="rounded-3xl border border-[var(--line)] bg-white/80 p-4">
                    <p className="text-sm font-semibold text-slate-700">포인트 이벤트</p>
                    <ul className="mt-3 space-y-2 text-sm text-slate-600">
                      {entry.point_events.length === 0 ? (
                        <li>기록 없음</li>
                      ) : (
                        entry.point_events.map((event) => (
                          <li className="flex items-center justify-between rounded-2xl bg-slate-900/5 px-3 py-2" key={event.id}>
                            <span>{getPointEventLabel(event.event_type)}</span>
                            <span>{event.points}P</span>
                          </li>
                        ))
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            </article>
          ))
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

function Badge({ label }: { label: string }) {
  return <span className="rounded-full bg-slate-900/5 px-3 py-1.5">{label}</span>;
}

function Block({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-3xl border border-[var(--line)] bg-white/80 p-4">
      <p className="text-sm font-semibold text-slate-700">{title}</p>
      <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">{value}</p>
    </div>
  );
}
