import { EmptyState } from "@/components/empty-state";
import { formatTimestamp } from "@/lib/time";
import { ActivityFeedEntry } from "@/lib/types";

interface ActivityFeedPanelProps {
  entries: ActivityFeedEntry[];
  timezone: string;
}

export function ActivityFeedPanel({ entries, timezone }: ActivityFeedPanelProps) {
  return (
    <section className="rounded-[2rem] border border-[var(--line)] bg-white/75 p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h3 className="font-['Space_Grotesk'] text-2xl font-semibold text-slate-950">
            오늘 활동 피드
          </h3>
          <p className="mt-2 text-sm text-slate-500">
            출근, 상태 변경, 세션, 작업 변화가 시간순으로 쌓입니다.
          </p>
        </div>
        <span className="rounded-full bg-slate-900/5 px-3 py-1 text-sm text-slate-600">
          {entries.length}건
        </span>
      </div>

      {entries.length === 0 ? (
        <EmptyState
          description="출근, 작업 추가, 집중 세션 기록이 쌓이면 하루 흐름이 여기서 이어집니다."
          title="아직 기록된 활동이 없습니다."
        />
      ) : (
        <ul className="space-y-3">
          {entries.map((entry) => (
            <li className="rounded-3xl bg-slate-900/5 px-4 py-4" key={entry.id}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-slate-900">{entry.title}</p>
                  {entry.description ? (
                    <p className="mt-2 text-sm leading-6 text-slate-500">{entry.description}</p>
                  ) : null}
                </div>
                <span className="whitespace-nowrap text-xs text-slate-400">
                  {formatTimestamp(entry.created_at, timezone)}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
