"use client";

import { OfficeAvatarPosition, OfficeNpcSummary, OfficePresenceMember, OfficeRealtimeConnectionState, OfficeRoomId, OfficeRoomSummary } from "@/lib/office/types";
import { clampOfficeAvatarPosition } from "@/lib/office/spatial";
import { cn } from "@/lib/utils";

interface OfficeFloorProps {
  currentRoomId: OfficeRoomId;
  rooms: OfficeRoomSummary[];
  npcDirectory: OfficeNpcSummary[];
  members: OfficePresenceMember[];
  roomCounts: Record<OfficeRoomId, number>;
  connectionState: OfficeRealtimeConnectionState;
  userPosition: OfficeAvatarPosition;
  onMove: (position: OfficeAvatarPosition) => void;
  onRoomChange: (roomId: OfficeRoomId) => void;
}

export function OfficeFloor({
  currentRoomId,
  rooms,
  npcDirectory,
  members,
  roomCounts,
  connectionState,
  userPosition,
  onMove,
  onRoomChange,
}: OfficeFloorProps) {
  const currentRoom = rooms.find((room) => room.id === currentRoomId) ?? rooms[0];
  const others = members.filter((member) => !member.self);
  const npcCount = npcDirectory.filter((npc) => npc.homeRoomId === currentRoomId).length;

  return (
    <section className="rounded-[2rem] border border-[var(--line)] bg-white/75 p-6 shadow-sm">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Office Floor</p>
          <h2 className="mt-3 font-['Space_Grotesk'] text-3xl font-semibold text-slate-950">
            메인 오피스 안에서 직접 움직이기
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-500">
            방을 클릭하면 이동하고, 현재 방 안에서는 원하는 위치를 눌러 아바타를 옮길 수 있습니다.
            이제 카드형 오피스 위에 실제 공간 레이어를 같이 얹습니다.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-sm text-slate-700">
          <HintChip label={`현재 방 ${currentRoom.shortLabel}`} tone="strong" />
          <HintChip label={`NPC ${npcCount}명`} />
          <HintChip label={getConnectionCopy(connectionState)} />
        </div>
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="relative aspect-[16/10] overflow-hidden rounded-[1.85rem] border border-slate-200 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.95),_rgba(255,248,235,0.92)_35%,_rgba(255,242,226,0.85)_100%)] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.08)_1px,transparent_1px)] bg-[size:32px_32px]" />
          <div className="pointer-events-none absolute inset-x-[8%] top-[8%] h-px bg-slate-300/60" />
          <div className="pointer-events-none absolute left-[34%] top-[12%] h-[72%] w-px bg-slate-300/50" />

          {rooms.map((room) => {
            const roomMembers = others.filter((member) => member.roomId === room.id);
            const roomNpcs = npcDirectory.filter((npc) => npc.homeRoomId === room.id);
            const isCurrent = room.id === currentRoomId;

            return (
              <button
                className={cn(
                  "group absolute overflow-hidden rounded-[1.5rem] border p-3 text-left transition duration-150",
                  isCurrent
                    ? "border-orange-300 bg-white/92 shadow-[0_24px_60px_-36px_rgba(249,115,22,0.55)]"
                    : "border-white/70 bg-white/72 hover:-translate-y-0.5 hover:bg-white/86",
                )}
                key={room.id}
                onClick={(event) => {
                  if (!isCurrent) {
                    onRoomChange(room.id);
                    return;
                  }

                  const rect = event.currentTarget.getBoundingClientRect();
                  const nextPosition = clampOfficeAvatarPosition({
                    x: (event.clientX - rect.left) / rect.width,
                    y: (event.clientY - rect.top) / rect.height,
                  });
                  onMove(nextPosition);
                }}
                style={{
                  left: `${room.mapRect.left}%`,
                  top: `${room.mapRect.top}%`,
                  width: `${room.mapRect.width}%`,
                  height: `${room.mapRect.height}%`,
                }}
                type="button"
              >
                <div
                  className={cn(
                    "absolute inset-0 opacity-70",
                    room.id === "lobby"
                      ? "bg-[radial-gradient(circle_at_top,_rgba(251,191,36,0.22),transparent_62%)]"
                      : room.id === "focus-room"
                        ? "bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.18),transparent_62%)]"
                        : "bg-[radial-gradient(circle_at_top,_rgba(52,211,153,0.2),transparent_62%)]",
                  )}
                />
                <div className="relative z-10 flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                      {room.shortLabel}
                    </p>
                    <h3 className="mt-1 font-['Space_Grotesk'] text-lg font-semibold text-slate-950">
                      {room.name}
                    </h3>
                  </div>
                  <span
                    className={cn(
                      "rounded-full px-2.5 py-1 text-[11px] font-medium",
                      isCurrent
                        ? "bg-orange-100 text-orange-700"
                        : "bg-slate-900/5 text-slate-600",
                    )}
                  >
                    {isCurrent ? "현재" : "이동"}
                  </span>
                </div>

                <p className="relative z-10 mt-2 max-w-[15rem] text-xs leading-5 text-slate-500">
                  {room.description}
                </p>

                <div className="pointer-events-none absolute inset-0">
                  {roomNpcs.map((npc) => (
                    <AvatarMarker
                      colorClassName={npc.accentClassName}
                      key={npc.id}
                      label={npc.name}
                      position={npc.mapPosition}
                      roomId={room.id}
                      subtle
                      type="npc"
                    />
                  ))}

                  {roomMembers.map((member) => (
                    <AvatarMarker
                      colorClassName={member.self ? "bg-orange-500 text-white" : "bg-slate-900 text-white"}
                      key={member.presenceKey}
                      label={member.nickname}
                      position={member.position}
                      roomId={room.id}
                      type="user"
                    />
                  ))}

                  {isCurrent ? (
                    <AvatarMarker
                      colorClassName="bg-orange-500 text-white ring-4 ring-orange-100"
                      label="나"
                      position={userPosition}
                      roomId={room.id}
                      type="self"
                    />
                  ) : null}
                </div>

                <div className="absolute inset-x-3 bottom-3 z-10 flex items-end justify-between gap-3">
                  <div className="rounded-2xl bg-white/86 px-3 py-2 text-xs leading-5 text-slate-600 shadow-sm">
                    {isCurrent
                      ? "현재 방 안을 클릭하면 자리를 옮깁니다."
                      : "방을 클릭하면 이 공간으로 이동합니다."}
                  </div>
                  <div className="rounded-full bg-slate-950 px-3 py-1 text-[11px] font-medium text-white">
                    {getRoomCountLabel(connectionState, roomCounts[room.id], isCurrent)}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="space-y-4">
          <aside className="rounded-[1.6rem] border border-[var(--line)] bg-white/80 p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Movement Guide</p>
            <div className="mt-3 space-y-3 text-sm leading-6 text-slate-600">
              <p>
                현재 방은 <span className="font-medium text-slate-900">{currentRoom.name}</span> 입니다.
              </p>
              <p>다른 방을 누르면 바로 이동하고, 현재 방 안에서는 원하는 위치를 눌러 아바타 자리를 바꿉니다.</p>
              <p>
                온라인 유저는 점으로, NPC는 각 방의 고정 자리에서 보입니다. 공간감만 먼저 확인하는
                1차 프로토타입이라 이동은 좌석 단위보다 자유 클릭에 가깝게 잡았습니다.
              </p>
            </div>
          </aside>

          <aside className="rounded-[1.6rem] border border-[var(--line)] bg-white/80 p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Floor Legend</p>
            <div className="mt-3 space-y-3">
              <LegendRow label="내 아바타" markerClassName="bg-orange-500 ring-4 ring-orange-100" />
              <LegendRow label="온라인 유저" markerClassName="bg-slate-900" />
              <LegendRow label="NPC" markerClassName="bg-white ring-2 ring-slate-300" />
            </div>
          </aside>

          <aside className="rounded-[1.6rem] border border-[var(--line)] bg-white/80 p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Room Snapshot</p>
            <div className="mt-3 space-y-3 text-sm leading-6 text-slate-600">
              <SnapshotRow label="현재 방" value={currentRoom.name} />
              <SnapshotRow label="온라인 인원" value={getRoomCountLabel(connectionState, roomCounts[currentRoomId], true)} />
              <SnapshotRow label="NPC 배치" value={`${npcCount}명`} />
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}

function AvatarMarker({
  colorClassName,
  label,
  position,
  roomId,
  subtle = false,
  type,
}: {
  colorClassName: string;
  label: string;
  position: OfficeAvatarPosition;
  roomId: OfficeRoomId;
  subtle?: boolean;
  type: "npc" | "user" | "self";
}) {
  return (
    <div
      className="absolute"
      style={{
        left: `${position.x * 100}%`,
        top: `${position.y * 100}%`,
        transform: "translate(-50%, -50%)",
      }}
      title={`${label} · ${roomId}`}
    >
      <div className="flex flex-col items-center gap-1">
        <span
          className={cn(
            "flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-semibold shadow-sm",
            type === "npc" ? "border border-slate-200 text-slate-700" : "",
            subtle ? "opacity-95" : "",
            colorClassName,
          )}
        >
          {type === "npc" ? "N" : type === "self" ? "나" : label.slice(0, 1)}
        </span>
        <span className="rounded-full bg-white/88 px-2 py-0.5 text-[10px] font-medium text-slate-700 shadow-sm">
          {label}
        </span>
      </div>
    </div>
  );
}

function HintChip({ label, tone = "default" }: { label: string; tone?: "default" | "strong" }) {
  return (
    <span
      className={cn(
        "rounded-full px-3 py-1.5",
        tone === "strong" ? "bg-[var(--accent)] text-white" : "bg-white/80 text-slate-700",
      )}
    >
      {label}
    </span>
  );
}

function LegendRow({ label, markerClassName }: { label: string; markerClassName: string }) {
  return (
    <div className="flex items-center gap-3 rounded-[1.15rem] bg-slate-900/5 px-3 py-3">
      <span className={cn("h-4 w-4 rounded-full", markerClassName)} />
      <span className="text-sm text-slate-700">{label}</span>
    </div>
  );
}

function SnapshotRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-[1.15rem] bg-slate-900/5 px-3 py-3">
      <span className="text-slate-500">{label}</span>
      <span className="font-medium text-slate-900">{value}</span>
    </div>
  );
}

function getConnectionCopy(connectionState: OfficeRealtimeConnectionState) {
  if (connectionState === "live") {
    return "실시간 연결됨";
  }

  if (connectionState === "error") {
    return "연결 상태 확인 필요";
  }

  return "실시간 연결 중";
}

function getRoomCountLabel(
  connectionState: OfficeRealtimeConnectionState,
  roomCount: number,
  isCurrentRoom: boolean,
) {
  if (connectionState === "live") {
    return `${roomCount}명 온라인`;
  }

  if (connectionState === "error") {
    return "실시간 확인 필요";
  }

  return isCurrentRoom ? "자리 표시 중" : "실시간 연결 중";
}
