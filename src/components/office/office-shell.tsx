import Link from "next/link";
import type { ReactNode } from "react";

import { EmptyState } from "@/components/empty-state";
import { getStatusLabel } from "@/lib/constants";
import { OfficeExperience, OfficeNpcId, OfficeRoomId } from "@/lib/office/types";
import { formatTimeOnly, formatTimestamp } from "@/lib/time";
import { Profile } from "@/lib/types";
import { cn } from "@/lib/utils";

interface OfficeShellProps {
  experience: OfficeExperience;
  profile: Profile;
}

export function OfficeShell({ experience, profile }: OfficeShellProps) {
  const { dashboard, currentRoom, officeName, officePulse, officeTagline, npcsInRoom, rooms, selectedConversation } =
    experience;
  const workday = dashboard.workday;
  const activeFocus = dashboard.active_focus_session;
  const activeStatus = dashboard.active_status;

  return (
    <div className="space-y-6">
      <section
        className={cn(
          "grain overflow-hidden rounded-[2rem] border border-[var(--line)] bg-gradient-to-br p-6 shadow-[var(--shadow-lg)]",
          currentRoom.themeClassName,
        )}
      >
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="font-['Space_Grotesk'] text-sm font-semibold uppercase tracking-[0.28em] text-[var(--accent)]">
              Office Preview
            </p>
            <h1 className="mt-3 font-['Space_Grotesk'] text-4xl font-bold leading-tight text-slate-950">
              {officeName}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">{officeTagline}</p>
            <div className="mt-5 flex flex-wrap gap-2 text-sm text-slate-700">
              <Badge label={`현재 방 · ${currentRoom.name}`} tone="strong" />
              <Badge label={`분위기 · ${getTopLevelStateLabel(dashboard.top_level_state)}`} />
              <Badge label={`현재 인원 · ${rooms.find((room) => room.id === currentRoom.id)?.occupancyLabel ?? "1명 감지"}`} />
            </div>
          </div>
          <div className="grid w-full gap-3 sm:grid-cols-3 lg:max-w-xl">
            {officePulse.stats.map((stat) => (
              <MetricCard key={stat.label} label={stat.label} value={stat.value} />
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
        <div className="space-y-6">
          <SectionPanel
            eyebrow="Room Switch"
            title="방을 옮기며 오늘 흐름을 다른 시각으로 봅니다."
            description="대시보드의 작업과 활동 피드를 그대로 가져오되, 오피스에서는 공간과 동료 반응 중심으로 다시 보여줍니다."
          >
            <div className="grid gap-4 md:grid-cols-3">
              {rooms.map((room) => {
                const href = buildOfficeHref(room.id);

                return (
                  <Link
                    className={cn(
                      "rounded-[1.75rem] border p-4 transition",
                      room.isCurrent
                        ? "border-slate-950 bg-amber-50 text-slate-950 shadow-lg shadow-amber-200/50"
                        : "border-[var(--line)] bg-white/80 text-slate-900 hover:-translate-y-0.5 hover:bg-white",
                    )}
                    href={href}
                    key={room.id}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p
                        className={cn(
                          "font-['Space_Grotesk'] text-xl font-semibold",
                          room.isCurrent ? "text-slate-950" : "text-slate-950",
                        )}
                      >
                        {room.shortLabel}
                      </p>
                      <span
                        className={cn(
                          "rounded-full px-3 py-1 text-xs font-medium",
                          room.isCurrent ? "bg-slate-950 text-white" : "bg-slate-900/5 text-slate-600",
                        )}
                      >
                        {room.isCurrent ? "현재 방" : "이동"}
                      </span>
                    </div>
                    <p className={cn("mt-2 text-sm", room.isCurrent ? "text-slate-700" : "text-slate-500")}>
                      {room.description}
                    </p>
                    <p className={cn("mt-4 text-xs uppercase tracking-[0.18em]", room.isCurrent ? "text-slate-500" : "text-slate-400")}>
                      {room.occupancyLabel}
                    </p>
                    <p className={cn("mt-2 text-sm leading-6", room.isCurrent ? "text-slate-700" : "text-slate-600")}>
                      {room.hint}
                    </p>
                  </Link>
                );
              })}
            </div>
          </SectionPanel>

          <section
            className={cn(
              "overflow-hidden rounded-[2rem] border border-[var(--line)] bg-gradient-to-br p-6 shadow-sm",
              currentRoom.themeClassName,
            )}
          >
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-xl">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Current Room
                </p>
                <h2 className="mt-3 font-['Space_Grotesk'] text-3xl font-semibold text-slate-950">
                  {currentRoom.name}
                </h2>
                <p className="mt-3 text-sm leading-7 text-slate-600">{currentRoom.description}</p>
                <p className="mt-4 rounded-[1.5rem] bg-white/75 px-4 py-4 text-sm leading-6 text-slate-600 shadow-sm">
                  {rooms.find((room) => room.id === currentRoom.id)?.hint}
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-3 lg:max-w-sm">
                {currentRoom.layoutLabels.map((label) => (
                  <div className="rounded-[1.5rem] border border-white/60 bg-white/70 px-4 py-4 text-sm font-medium text-slate-700 shadow-sm" key={label}>
                    {label}
                  </div>
                ))}
              </div>
            </div>
          </section>

          <SectionPanel
            eyebrow="NPC Cast"
            title={`${currentRoom.shortLabel}에 머무는 동료들`}
            description="지금 단계에서는 NPC가 오늘의 작업, 상태, 집중 세션, 퇴근 기록을 읽고 규칙형으로 반응합니다."
          >
            {npcsInRoom.length === 0 ? (
              <EmptyState
                description="이 방에는 아직 배치된 동료가 없습니다."
                title="NPC 준비 중"
              />
            ) : (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
                {npcsInRoom.map((npc) => {
                  const isSelected = selectedConversation?.npcId === npc.id;
                  const href = isSelected
                    ? buildOfficeHref(currentRoom.id)
                    : buildOfficeHref(currentRoom.id, npc.id);

                  return (
                    <article className="rounded-[1.75rem] border border-[var(--line)] bg-white/80 p-5 shadow-sm" key={npc.id}>
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-['Space_Grotesk'] text-2xl font-semibold text-slate-950">
                              {npc.name}
                            </h3>
                            <span className={cn("rounded-full px-3 py-1 text-xs font-medium", npc.accentClassName)}>
                              {npc.role}
                            </span>
                          </div>
                          <p className="mt-2 text-sm leading-6 text-slate-500">{npc.intro}</p>
                        </div>
                        <span className="rounded-full bg-slate-900/5 px-3 py-1 text-xs font-medium text-slate-600">
                          {npc.moodLabel}
                        </span>
                      </div>
                      <p className="mt-4 rounded-[1.25rem] bg-slate-900/5 px-4 py-4 text-sm leading-6 text-slate-600">
                        {npc.reactionSummary}
                      </p>
                      <div className="mt-4 flex items-center justify-between gap-3">
                        <p className="text-sm text-slate-500">{npc.actionLabel}</p>
                        <Link
                          className={cn(
                            "inline-flex h-11 items-center justify-center rounded-2xl px-4 text-sm font-medium transition",
                            isSelected
                              ? "border border-slate-200 bg-slate-100 text-slate-900 hover:bg-slate-200"
                              : "bg-[var(--accent)] text-white shadow-lg shadow-orange-200/50 hover:bg-[var(--accent-strong)]",
                          )}
                          href={href}
                        >
                          {isSelected ? "대화 닫기" : "대화 열기"}
                        </Link>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </SectionPanel>
        </div>

        <div className="space-y-6">
          <SectionPanel
            eyebrow="Conversation"
            title={
              selectedConversation
                ? `${npcsInRoom.find((npc) => npc.id === selectedConversation.npcId)?.name ?? "동료"}와의 짧은 대화`
                : "동료를 선택하면 대화를 열 수 있습니다."
            }
            description={
              selectedConversation
                ? selectedConversation.subtitle
                : "같은 방의 NPC를 고르면 오늘 활동에 맞춘 규칙형 대화가 오른쪽 패널에 열립니다."
            }
          >
            {selectedConversation ? (
              <div className="space-y-3">
                <div className="rounded-[1.5rem] bg-slate-950 px-4 py-4 text-white">
                  <p className="font-['Space_Grotesk'] text-xl font-semibold">
                    {selectedConversation.title}
                  </p>
                  <p className="mt-2 text-sm text-slate-300">{selectedConversation.subtitle}</p>
                </div>
                {selectedConversation.messages.map((message, index) => (
                  <div
                    className={cn(
                      "rounded-[1.5rem] px-4 py-4 text-sm leading-7 shadow-sm",
                      message.speaker === "npc"
                        ? "bg-white text-slate-700"
                        : "ml-6 bg-slate-950 text-slate-100",
                    )}
                    key={`${message.speaker}-${index}`}
                  >
                    <p className="mb-2 text-xs uppercase tracking-[0.18em] text-slate-400">
                      {message.speaker === "npc" ? "NPC" : "You"}
                    </p>
                    <p>{message.body}</p>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                description="예를 들어 로비의 미나는 출근과 진행 상황에, 포커스 룸의 지호는 세션 텐션에, 라운지의 소라는 회고와 문장 톤에 반응합니다."
                title="아직 열린 대화가 없습니다."
              />
            )}
          </SectionPanel>

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
            <div className="mt-5 rounded-[1.5rem] border border-[var(--line)] bg-white/80 p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-slate-700">최근 오피스 반응</p>
                <span className="text-xs uppercase tracking-[0.18em] text-slate-400">
                  {officePulse.recentActivity.length}건
                </span>
              </div>
              {officePulse.recentActivity.length === 0 ? (
                <p className="mt-3 text-sm leading-6 text-slate-500">
                  출근하거나 작업을 시작하면 이 공간도 바로 반응합니다.
                </p>
              ) : (
                <ul className="mt-3 space-y-3 text-sm text-slate-600">
                  {officePulse.recentActivity.map((item) => (
                    <li className="rounded-[1.25rem] bg-slate-900/5 px-4 py-3" key={item.id}>
                      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                        <span className="font-medium text-slate-900">{item.title}</span>
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
            title="현재 근무 흐름과 오피스 연결"
            description="오피스는 별도 데이터를 새로 만들지 않고, 지금까지 쌓인 개인 workday 데이터를 공간 관점으로 다시 묶어 보여줍니다."
          >
            <div className="space-y-3">
              <SnapshotRow
                label="현재 상태"
                value={activeStatus ? getStatusLabel(activeStatus.status_type) : "아직 설정 안 됨"}
              />
              <SnapshotRow
                label="오늘 목표"
                value={workday?.today_goal ?? "출근 후 목표를 적으면 이곳에 연결됩니다."}
              />
              <SnapshotRow
                label="첫 작업"
                value={workday?.today_first_task ?? "아직 없음"}
              />
              <SnapshotRow
                label="집중 세션"
                value={
                  activeFocus
                    ? `${activeFocus.duration_minutes}분 세션 진행 중`
                    : dashboard.focus_sessions.length > 0
                      ? `${dashboard.focus_sessions.length}회 기록`
                      : "아직 시작 안 함"
                }
              />
              <SnapshotRow
                label="출근/퇴근"
                value={
                  workday
                    ? `${formatTimeOnly(workday.check_in_at, profile.timezone) ?? "-"} / ${formatTimeOnly(workday.check_out_at, profile.timezone) ?? "진행 중"}`
                    : "출근 전"
                }
              />
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <Link
                className="inline-flex h-12 items-center justify-center rounded-2xl bg-slate-950 px-5 text-sm font-medium text-white transition hover:bg-slate-800"
                href="/"
              >
                대시보드에서 작업 이어가기
              </Link>
              <Link
                className="inline-flex h-12 items-center justify-center rounded-2xl border border-[var(--line)] bg-white/80 px-5 text-sm font-medium text-slate-900 transition hover:bg-white"
                href="/history"
              >
                기록 보기
              </Link>
            </div>
            <div className="mt-4 rounded-[1.5rem] bg-slate-900/5 px-4 py-4 text-sm leading-6 text-slate-600">
              {workday?.check_out_at
                ? "퇴근 뒤에는 라운지와 회고 톤이 더 강해집니다. 다음 단계에서는 이 흐름이 실제 NPC 관계와 공간 이벤트로 이어집니다."
                : "지금 단계의 오피스는 읽기 중심의 공간입니다. 다음 패스에서는 룸 이벤트 저장과 더 깊은 NPC 상호작용을 붙일 예정입니다."}
            </div>
          </SectionPanel>
        </div>
      </section>
    </div>
  );
}

function buildOfficeHref(room: OfficeRoomId, talk?: OfficeNpcId | null) {
  const search = new URLSearchParams({ room });

  if (talk) {
    search.set("talk", talk);
  }

  return `/office?${search.toString()}`;
}

function getTopLevelStateLabel(value: OfficeExperience["dashboard"]["top_level_state"]) {
  switch (value) {
    case "before_check_in":
      return "오피스 대기";
    case "working":
      return "근무 진행";
    case "resting":
      return "호흡 조절";
    case "away":
      return "자리 비움";
    case "checked_out":
      return "마감 완료";
  }
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
  children: ReactNode;
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
        tone === "strong" ? "bg-slate-950 text-white" : "bg-white/80 text-slate-700",
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
