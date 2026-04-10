"use client";

import { useEffect, useEffectEvent, useMemo, useState } from "react";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import {
  countOfficePresenceByRoom,
  listOfficePresenceMembers,
} from "@/lib/office/presence";
import {
  OfficePresenceMember,
  OfficePresencePayload,
  OfficeRealtimeConnectionState,
  OfficeRoomId,
  OfficeRoomSummary,
} from "@/lib/office/types";
import { Profile, TopLevelState } from "@/lib/types";
import { cn } from "@/lib/utils";

interface OfficePresencePanelProps {
  currentRoomId: OfficeRoomId;
  profile: Pick<Profile, "id" | "nickname">;
  roomOptions: Pick<OfficeRoomSummary, "id" | "name" | "shortLabel">[];
  statusLabel: string | null;
  topLevelState: TopLevelState;
  topic: string;
}

export function OfficePresencePanel({
  currentRoomId,
  profile,
  roomOptions,
  statusLabel,
  topLevelState,
  topic,
}: OfficePresencePanelProps) {
  const [supabase] = useState(() => createSupabaseBrowserClient());
  const [members, setMembers] = useState<OfficePresenceMember[]>([]);
  const [connectionState, setConnectionState] =
    useState<OfficeRealtimeConnectionState>("connecting");

  const syncPresence = useEffectEvent((state: Record<string, OfficePresencePayload[]>) => {
    setMembers(listOfficePresenceMembers(state, profile.id));
  });

  useEffect(() => {
    const channel = supabase.channel(topic, {
      config: {
        presence: {
          key: profile.id,
        },
      },
    });

    const handleSync = () => {
      syncPresence(channel.presenceState<OfficePresencePayload>());
    };

    channel
      .on("presence", { event: "sync" }, handleSync)
      .on("presence", { event: "join" }, handleSync)
      .on("presence", { event: "leave" }, handleSync)
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          setConnectionState("live");
          await channel.track({
            userId: profile.id,
            nickname: profile.nickname,
            roomId: currentRoomId,
            topLevelState,
            statusLabel,
            onlineAt: new Date().toISOString(),
          });
          handleSync();
          return;
        }

        if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
          setConnectionState("error");
          return;
        }

        if (status === "CLOSED") {
          setConnectionState("connecting");
        }
      });

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [
    currentRoomId,
    profile.id,
    profile.nickname,
    statusLabel,
    supabase,
    topLevelState,
    topic,
  ]);

  const roomCounts = useMemo(
    () =>
      countOfficePresenceByRoom(
        roomOptions.map((room) => room.id),
        members,
      ),
    [members, roomOptions],
  );
  const others = members.filter((member) => !member.self);
  const currentRoomOthers = others.filter((member) => member.roomId === currentRoomId);

  return (
    <section className="rounded-[2rem] border border-[var(--line)] bg-white/75 p-6 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
        Live Presence
      </p>
      <div className="mt-3 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="font-['Space_Grotesk'] text-3xl font-semibold text-slate-950">
            지금 오피스에 접속 중인 사람들
          </h2>
          <p className="mt-3 text-sm leading-7 text-slate-500">
            현재는 같은 오피스 채널 안에서 누가 어느 방에 있는지 실시간으로 보여주는 단계입니다.
          </p>
        </div>
        <PresenceStatusBadge state={connectionState} />
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        {roomOptions.map((room) => (
          <div
            className={cn(
              "rounded-[1.5rem] border px-4 py-4 text-center shadow-sm",
              room.id === currentRoomId
                ? "border-orange-200 bg-orange-100"
                : "border-[var(--line)] bg-white/80",
            )}
            key={room.id}
          >
            <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
              {room.shortLabel}
            </p>
            <p className="mt-2 text-2xl font-semibold text-slate-950">
              {roomCounts[room.id]}명
            </p>
            <p className="mt-1 text-sm text-slate-500">
              {room.id === currentRoomId ? "현재 내가 있는 방" : room.name}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-[1.5rem] border border-[var(--line)] bg-white/80 p-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-slate-700">현재 방 동료</p>
            <span className="text-xs uppercase tracking-[0.16em] text-slate-400">
              {currentRoomOthers.length}명
            </span>
          </div>
          {connectionState === "error" ? (
            <p className="mt-3 text-sm leading-6 text-rose-600">
              실시간 채널에 연결하지 못했습니다. Supabase Realtime 공개 채널 설정을 확인해주세요.
            </p>
          ) : currentRoomOthers.length === 0 ? (
            <p className="mt-3 text-sm leading-6 text-slate-500">
              아직 같은 방에 다른 사용자가 없습니다. 다른 브라우저나 계정으로 `/office`를 열면 바로 반영됩니다.
            </p>
          ) : (
            <ul className="mt-3 space-y-3">
              {currentRoomOthers.map((member) => (
                <li className="rounded-[1.25rem] bg-slate-900/5 px-4 py-3" key={member.userId}>
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-medium text-slate-900">{member.nickname}</p>
                      <p className="mt-1 text-sm text-slate-500">
                        {member.statusLabel ?? getTopLevelStateLabel(member.topLevelState)}
                      </p>
                    </div>
                    <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-medium text-orange-700">
                      같은 방
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-[1.5rem] border border-[var(--line)] bg-white/80 p-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-slate-700">온라인 사용자 전체</p>
            <span className="text-xs uppercase tracking-[0.16em] text-slate-400">
              {members.length}명
            </span>
          </div>
          <ul className="mt-3 space-y-3">
            {members.map((member) => {
              const room = roomOptions.find((candidate) => candidate.id === member.roomId);

              return (
                <li className="rounded-[1.25rem] bg-slate-900/5 px-4 py-3" key={member.userId}>
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium text-slate-900">{member.nickname}</p>
                        {member.self ? (
                          <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-medium text-orange-700">
                            나
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-1 text-sm text-slate-500">
                        {room?.shortLabel ?? member.roomId} ·{" "}
                        {member.statusLabel ?? getTopLevelStateLabel(member.topLevelState)}
                      </p>
                    </div>
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-600">
                      {member.connectionCount > 1 ? `${member.connectionCount}개 연결` : "1개 연결"}
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}

function PresenceStatusBadge({ state }: { state: OfficeRealtimeConnectionState }) {
  const copy =
    state === "live"
      ? { label: "실시간 연결됨", className: "bg-emerald-100 text-emerald-700" }
      : state === "error"
        ? { label: "연결 확인 필요", className: "bg-rose-100 text-rose-700" }
        : { label: "연결 중", className: "bg-amber-100 text-amber-700" };

  return (
    <span className={cn("rounded-full px-3 py-1.5 text-sm font-medium", copy.className)}>
      {copy.label}
    </span>
  );
}

function getTopLevelStateLabel(value: TopLevelState) {
  switch (value) {
    case "before_check_in":
      return "출근 전";
    case "working":
      return "근무 진행";
    case "resting":
      return "휴식 중";
    case "away":
      return "자리 비움";
    case "checked_out":
      return "퇴근 완료";
  }
}
