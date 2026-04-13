"use client";

import Link from "next/link";

import { OfficeFloor } from "@/components/office/office-floor";
import { OfficePresencePanel } from "@/components/office/office-presence-panel";
import { getStatusLabel } from "@/lib/constants";
import { OFFICE_DESKS, OFFICE_NAME, OFFICE_REALTIME_TOPIC, OFFICE_TAGLINE } from "@/lib/office/config";
import { assignOfficeDesk, getPreferredOfficeDesk } from "@/lib/office/spatial";
import { OfficeExperience } from "@/lib/office/types";
import { formatMinutes, formatTimeOnly, formatTimestamp } from "@/lib/time";
import { Profile } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useOfficePresence } from "@/components/office/use-office-presence";

interface OfficeShellProps {
  experience: OfficeExperience;
  profile: Profile;
}

export function OfficeShell({ experience, profile }: OfficeShellProps) {
  const { dashboard, officePulse } = experience;
  const statusLabel = dashboard.active_status ? getStatusLabel(dashboard.active_status.status_type) : null;
  const fallbackDesk = getPreferredOfficeDesk(profile.id, OFFICE_DESKS) ?? OFFICE_DESKS[0];
  const provisionalPosition = fallbackDesk?.position ?? { x: 0.24, y: 0.34 };
  const roomOptions = experience.rooms.map((room) => ({
    id: room.id,
    name: room.name,
    shortLabel: room.shortLabel,
  }));

  const { members, connectionState, errorDetail } = useOfficePresence({
    currentRoomId: "lobby",
    position: provisionalPosition,
    profile: { id: profile.id, nickname: profile.nickname },
    roomOptions,
    statusLabel,
    topLevelState: dashboard.top_level_state,
    topic: OFFICE_REALTIME_TOPIC,
  });

  const allKnownUserIds = Array.from(new Set([profile.id, ...members.map((member) => member.userId)]));
  const myDeskId = assignOfficeDesk(allKnownUserIds, profile.id, OFFICE_DESKS);
  const myDesk = OFFICE_DESKS.find((desk) => desk.id === myDeskId) ?? fallbackDesk;

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[2rem] border border-[var(--line)] bg-gradient-to-br from-[#fff2db] via-white to-[#ffe8d5] p-6 shadow-[var(--shadow-lg)]">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="font-mono text-sm font-semibold uppercase tracking-[0.28em] text-[#8b5e34]">
              Shared Office First
            </p>
            <h1 className="mt-3 font-['Space_Grotesk'] text-4xl font-bold leading-tight text-slate-950">
              {OFFICE_NAME}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">{OFFICE_TAGLINE}</p>
            <div className="mt-5 flex flex-wrap gap-2 text-sm text-slate-700">
              <Badge label={`내 자리 · ${myDesk.label}`} tone="strong" />
              <Badge label={`현재 상태 · ${statusLabel ?? "출근 전"}`} />
              <Badge label={`온라인 · ${members.length}명`} />
            </div>
          </div>
          <div className="grid w-full gap-3 sm:grid-cols-3 lg:max-w-xl">
            <MetricCard label="오늘 포인트" value={`${dashboard.workday?.total_points ?? 0}P`} />
            <MetricCard label="집중 시간" value={formatMinutes(dashboard.focus_minutes_live)} />
            <MetricCard
              label="완료 작업"
              value={`${dashboard.tasks.filter((task) => task.status === "done").length}/${dashboard.tasks.length}`}
            />
          </div>
        </div>
      </section>

      <OfficeFloor
        connectionState={connectionState}
        members={members}
        profileId={profile.id}
        profileNickname={profile.nickname}
      />

      <section className="grid gap-6 xl:grid-cols-[1.02fr_0.98fr]">
        <OfficePresencePanel
          connectionState={connectionState}
          errorDetail={errorDetail}
          members={members}
        />

        <div className="space-y-6">
          <SectionPanel
            eyebrow="Office Pulse"
            title={officePulse.headline}
            description={officePulse.detail}
          >
            <div className="grid gap-3 sm:grid-cols-3">
              {officePulse.stats.map((stat) => (
                <MetricCard key={stat.label} label={stat.label} value={stat.value} />
              ))}
            </div>
            <div className="mt-5 border-4 border-[#5a4635] bg-[#fff5e8] p-4 shadow-[4px_4px_0_rgba(90,70,53,0.12)]">
              <div className="flex items-center justify-between gap-3">
                <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-[#8b5e34]">
                  Recent Office Feed
                </p>
                <span className="text-xs uppercase tracking-[0.18em] text-slate-400">
                  {officePulse.recentActivity.length}건
                </span>
              </div>
              {officePulse.recentActivity.length === 0 ? (
                <p className="mt-3 text-sm leading-6 text-slate-500">
                  출근하거나 작업을 시작하면 이 오피스도 바로 살아납니다.
                </p>
              ) : (
                <ul className="mt-3 space-y-3 text-sm text-slate-600">
                  {officePulse.recentActivity.map((item) => (
                    <li className="border-2 border-[#d9c2a4] bg-white/80 px-4 py-3" key={item.id}>
                      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-medium text-slate-900">{item.title}</span>
                          <span className="rounded-full bg-white px-2.5 py-1 text-xs font-medium text-slate-700">
                            {item.actor_nickname}
                          </span>
                          <span className="rounded-full bg-white px-2.5 py-1 text-xs font-medium text-slate-500">
                            {getPreferredOfficeDesk(item.user_id, OFFICE_DESKS)?.label ?? "Desk A"}
                          </span>
                        </div>
                        <span className="text-slate-500">
                          {formatTimestamp(item.created_at, profile.timezone)}
                        </span>
                      </div>
                      {item.description ? (
                        <p className="mt-2 leading-6 text-slate-500">{item.description}</p>
                      ) : null}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </SectionPanel>

          <SectionPanel
            eyebrow="Today Snapshot"
            title="지금 오피스에서 이어지는 오늘의 흐름"
            description="자리 위 존재감은 메인 화면에 두고, 세부 업무 조작과 기록은 보조 화면으로 남겨둡니다."
          >
            <div className="space-y-3">
              <SnapshotRow label="현재 상태" value={statusLabel ?? "아직 설정 안 됨"} />
              <SnapshotRow
                label="오늘 목표"
                value={dashboard.workday?.today_goal ?? "출근 후 목표를 적으면 자리에 흐름이 생깁니다."}
              />
              <SnapshotRow
                label="첫 작업"
                value={dashboard.workday?.today_first_task ?? "아직 없음"}
              />
              <SnapshotRow
                label="집중 세션"
                value={
                  dashboard.active_focus_session
                    ? `${dashboard.active_focus_session.duration_minutes}분 세션 진행 중`
                    : dashboard.focus_sessions.length > 0
                      ? `${dashboard.focus_sessions.length}회 기록`
                      : "아직 시작 전"
                }
              />
              <SnapshotRow
                label="출근/퇴근"
                value={
                  dashboard.workday
                    ? `${formatTimeOnly(dashboard.workday.check_in_at, profile.timezone) ?? "-"} / ${
                        formatTimeOnly(dashboard.workday.check_out_at, profile.timezone) ?? "진행 중"
                      }`
                    : "출근 전"
                }
              />
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <Link
                className="inline-flex h-12 items-center justify-center rounded-2xl bg-[var(--accent)] px-5 text-sm font-medium text-white shadow-lg shadow-orange-200/50 transition hover:bg-[var(--accent-strong)]"
                href="/dashboard"
              >
                세부 업무 패널 열기
              </Link>
              <Link
                className="inline-flex h-12 items-center justify-center rounded-2xl border border-[var(--line)] bg-white/80 px-5 text-sm font-medium text-slate-900 transition hover:bg-white"
                href="/history"
              >
                기록 보기
              </Link>
            </div>
            <div className="mt-4 rounded-[1.5rem] bg-slate-900/5 px-4 py-4 text-sm leading-6 text-slate-600">
              이 오피스의 핵심은 많이 걷는 것이 아니라, 같은 공간에 함께 앉아 있다는 감각입니다.
              다음 패스에서는 자리 위에 작은 타이머, 작업 상태, 간단한 반응을 더 올려서 감시받는 듯한
              집중감을 더 강하게 만들 수 있습니다.
            </div>
          </SectionPanel>
        </div>
      </section>
    </div>
  );
}

function SectionPanel({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[2rem] border border-[var(--line)] bg-white/75 p-6 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">{eyebrow}</p>
      <h2 className="mt-3 font-['Space_Grotesk'] text-3xl font-semibold text-slate-950">{title}</h2>
      <p className="mt-3 text-sm leading-7 text-slate-500">{description}</p>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.5rem] bg-white/80 px-4 py-4 text-center shadow-sm">
      <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{label}</p>
      <p className="mt-2 text-lg font-semibold text-slate-950">{value}</p>
    </div>
  );
}

function Badge({ label, tone = "default" }: { label: string; tone?: "default" | "strong" }) {
  return (
    <span
      className={cn(
        "rounded-full px-3 py-1.5 text-sm",
        tone === "strong" ? "bg-[var(--accent)] text-white" : "bg-white/80 text-slate-700",
      )}
    >
      {label}
    </span>
  );
}

function SnapshotRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-[1.25rem] bg-slate-900/5 px-4 py-3 text-sm">
      <span className="text-slate-500">{label}</span>
      <span className="max-w-[70%] text-right font-medium text-slate-900">{value}</span>
    </div>
  );
}
