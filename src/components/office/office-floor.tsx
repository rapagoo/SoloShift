"use client";

import { OFFICE_DESKS, OFFICE_FLOOR_LABEL } from "@/lib/office/config";
import { assignOfficeDesk, buildDeskOccupancy } from "@/lib/office/spatial";
import {
  OfficeDeskConfig,
  OfficePresenceMember,
  OfficeRealtimeConnectionState,
} from "@/lib/office/types";
import { cn } from "@/lib/utils";

interface OfficeFloorProps {
  connectionState: OfficeRealtimeConnectionState;
  members: OfficePresenceMember[];
  profileId: string;
}

export function OfficeFloor({ connectionState, members, profileId }: OfficeFloorProps) {
  const allKnownUserIds = Array.from(new Set([profileId, ...members.map((member) => member.userId)]));
  const myDeskId = assignOfficeDesk(allKnownUserIds, profileId, OFFICE_DESKS);
  const deskOccupancy = buildDeskOccupancy(members, OFFICE_DESKS);
  const overflowCount = Math.max(0, members.length - OFFICE_DESKS.length);

  return (
    <section className="overflow-hidden rounded-[2.4rem] border border-[#d9c2a4] bg-[linear-gradient(180deg,#fff6ea_0%,#f7e6d0_100%)] shadow-[0_24px_70px_-42px_rgba(90,70,53,0.35)]">
      <div className="flex flex-col gap-4 border-b border-[#e7d7c3] px-6 py-5 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.28em] text-[#8b5e34]">
            {OFFICE_FLOOR_LABEL}
          </p>
          <h2 className="mt-2 font-['Space_Grotesk'] text-3xl font-semibold text-[#2a1f17]">
            함께 앉아 있는 감각이 먼저 보이는 메인 오피스
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-7 text-[#5d4b3d]">
            모든 정보보다 먼저 오피스가 크게 보이고, 오른쪽 사이드바에서 작업과 피드를 이어가는
            구조입니다. 이 화면은 채팅방이 아니라 온라인 공동 근무 공간처럼 읽히는 것이 목표입니다.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-sm">
          <Chip label={`온라인 ${members.length}명`} tone="solid" />
          <Chip label={`내 자리 ${myDeskId.toUpperCase().replace("DESK-", "Desk ")}`} />
          <Chip label={getConnectionLabel(connectionState)} />
        </div>
      </div>

      <div className="p-5 sm:p-6">
        <div className="relative aspect-[16/11] overflow-hidden rounded-[2rem] border-4 border-[#5a4635] bg-[#dbc8ae] shadow-[10px_10px_0_rgba(90,70,53,0.12)]">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.12)_2px,transparent_2px),linear-gradient(90deg,rgba(255,255,255,0.12)_2px,transparent_2px)] bg-[size:26px_26px]" />
          <div className="absolute inset-x-[8%] top-[8%] h-[18%] border-4 border-[#5a4635] bg-[#bfe3ff]" />
          <div className="absolute inset-x-[10%] top-[31%] h-4 bg-[#b28c63]" />
          <div className="absolute left-1/2 top-[22%] h-[52%] w-4 -translate-x-1/2 bg-[#b28c63]" />
          <div className="absolute bottom-[8%] left-[9%] h-[13%] w-[25%] border-4 border-[#5a4635] bg-[#9bc3a5]" />
          <div className="absolute bottom-[8%] right-[10%] h-[13%] w-[20%] border-4 border-[#5a4635] bg-[#f5d1a8]" />
          <div className="absolute left-[12%] top-[12%] border-4 border-[#5a4635] bg-[#fff5e8] px-4 py-2 text-[11px] font-semibold text-[#5a4635] shadow-[4px_4px_0_rgba(90,70,53,0.12)]">
            출근 보드
          </div>
          <div className="absolute right-[12%] top-[12%] border-4 border-[#5a4635] bg-[#fff5e8] px-4 py-2 text-[11px] font-semibold text-[#5a4635] shadow-[4px_4px_0_rgba(90,70,53,0.12)]">
            집중 현황
          </div>

          {deskOccupancy.map(({ desk, occupant }) => (
            <DeskTile
              desk={desk}
              key={desk.id}
              occupant={occupant}
              selected={desk.id === myDeskId}
            />
          ))}

          {overflowCount > 0 ? (
            <div className="absolute right-[8%] top-[26%] border-4 border-[#5a4635] bg-[#fff5e8] px-3 py-2 text-[11px] font-semibold text-[#5a4635] shadow-[4px_4px_0_rgba(90,70,53,0.12)]">
              대기 {overflowCount}명
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function DeskTile({
  desk,
  occupant,
  selected,
}: {
  desk: OfficeDeskConfig;
  occupant: OfficePresenceMember | null;
  selected: boolean;
}) {
  return (
    <div
      className="absolute"
      style={{
        left: `${desk.position.x * 100}%`,
        top: `${desk.position.y * 100}%`,
        transform: "translate(-50%, -50%)",
      }}
    >
      <div
        className={cn(
          "relative h-[128px] w-[136px] border-4 border-[#5a4635] bg-[#f8ebd8] shadow-[8px_8px_0_rgba(90,70,53,0.12)]",
          selected ? "ring-4 ring-[#f59e0b]/25" : "",
        )}
      >
        <div className="absolute inset-x-0 top-0 h-4 bg-[#b28c63]" />
        <div className="absolute bottom-[20px] left-1/2 h-8 w-[84px] -translate-x-1/2 border-4 border-[#5a4635] bg-[#c9b39a]" />
        <div className="absolute bottom-[8px] left-1/2 h-3 w-5 -translate-x-1/2 bg-[#5a4635]" />
        <div className="absolute right-[10px] top-[16px] h-7 w-7 border-4 border-[#5a4635] bg-[#7eb6d9]" />
        <div className="absolute left-[10px] top-[16px] h-3 w-8 bg-[#7bb07e]" />

        {occupant ? (
          <div className="absolute left-1/2 top-[46px] -translate-x-1/2">
            <Avatar occupant={occupant} selected={selected} />
          </div>
        ) : (
          <div className="absolute left-1/2 top-[52px] h-8 w-8 -translate-x-1/2 border-4 border-dashed border-[#ccb59a] bg-[#fcf5eb]" />
        )}

        <div className="absolute inset-x-2 bottom-2 border-2 border-[#d9c2a4] bg-white/85 px-2 py-1 text-center text-[11px] font-semibold text-[#4f3d31]">
          {occupant ? `${occupant.nickname}${occupant.self ? " · 나" : ""}` : "빈 자리"}
        </div>
      </div>
      <div className="mt-2 flex justify-center">
        <span className={cn("inline-flex border-2 px-2.5 py-1 text-[11px] font-semibold", desk.accentClassName)}>
          {desk.label}
        </span>
      </div>
    </div>
  );
}

function Avatar({ occupant, selected }: { occupant: OfficePresenceMember; selected: boolean }) {
  return (
    <div className="flex flex-col items-center">
      <div className="h-5 w-5 border-4 border-[#5a4635] bg-[#ffd7b0]" />
      <div className={cn("mt-[-2px] h-6 w-8 border-4 border-[#5a4635]", selected ? "bg-[#f59e0b]" : "bg-[#7c9eff]")} />
      <div className="mt-1 border-2 border-[#5a4635] bg-white px-1.5 text-[9px] font-bold text-[#2a1f17]">
        {occupant.self ? "나" : occupant.nickname.slice(0, 1)}
      </div>
    </div>
  );
}

function Chip({ label, tone = "default" }: { label: string; tone?: "default" | "solid" }) {
  return (
    <span
      className={cn(
        "border-2 px-3 py-1.5 font-mono text-xs font-semibold uppercase tracking-[0.08em]",
        tone === "solid"
          ? "border-[#5a4635] bg-[#5a4635] text-[#fff7ef]"
          : "border-[#cfae87] bg-[#fff5e8] text-[#6f573f]",
      )}
    >
      {label}
    </span>
  );
}

function getConnectionLabel(connectionState: OfficeRealtimeConnectionState) {
  if (connectionState === "live") {
    return "실시간 연결됨";
  }

  if (connectionState === "error") {
    return "연결 확인 필요";
  }

  return "실시간 연결 중";
}
