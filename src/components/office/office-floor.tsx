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
  const availableCount = Math.max(OFFICE_DESKS.length - members.length, 0);
  const overflowCount = Math.max(0, members.length - OFFICE_DESKS.length);

  return (
    <section className="overflow-hidden rounded-[2.6rem] border border-[#d6c0a1] bg-[linear-gradient(180deg,#fff7ee_0%,#f7e6d0_100%)] shadow-[0_28px_75px_-42px_rgba(90,70,53,0.35)]">
      <div className="flex flex-col gap-4 border-b border-[#e7d7c3] px-6 py-5 md:flex-row md:items-end md:justify-between">
        <div className="max-w-3xl">
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.28em] text-[#8b5e34]">
            {OFFICE_FLOOR_LABEL}
          </p>
          <h2 className="mt-2 font-['Space_Grotesk'] text-3xl font-semibold text-[#2a1f17]">
            책상 네 개로 시작하는 메인 오피스
          </h2>
          <p className="mt-2 text-sm leading-7 text-[#5d4b3d]">
            작은 팀이 함께 쓰는 가상 오피스처럼, 책상과 통로가 먼저 읽히고 업무는 오른쪽 사이드바에서
            이어집니다. 책상 위 상태 배지와 착석 정보만으로도 누가 일하고 있는지 바로 느껴지는 화면을
            목표로 정리했습니다.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-sm">
          <Chip label={`온라인 ${members.length}명`} tone="solid" />
          <Chip label={`빈 자리 ${availableCount}석`} />
          <Chip label={`내 자리 ${myDeskId.toUpperCase().replace("DESK-", "Desk ")}`} />
          <Chip label={getConnectionLabel(connectionState)} />
        </div>
      </div>

      <div className="p-5 sm:p-6">
        <div className="relative aspect-[16/10] overflow-hidden rounded-[2.2rem] border-[6px] border-[#5a4635] bg-[#ddc8ad] shadow-[12px_12px_0_rgba(90,70,53,0.14)]">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.11)_2px,transparent_2px),linear-gradient(90deg,rgba(255,255,255,0.11)_2px,transparent_2px)] bg-[size:28px_28px]" />
          <div className="absolute inset-x-[5%] top-[5%] h-[18%] rounded-[1rem] border-[6px] border-[#5a4635] bg-[#a7d8ff]">
            <div className="absolute inset-x-[4%] bottom-[18%] h-[14%] bg-white/80" />
            <div className="absolute left-1/3 top-0 h-full w-[6px] -translate-x-1/2 bg-[#5a4635]" />
            <div className="absolute left-2/3 top-0 h-full w-[6px] -translate-x-1/2 bg-[#5a4635]" />
          </div>

          <div className="absolute inset-x-[10%] top-[29%] h-[14%] rounded-[999px] bg-[#efe5d5]" />
          <div className="absolute left-1/2 top-[22%] h-[56%] w-[14%] -translate-x-1/2 rounded-[999px] bg-[#efe5d5]" />
          <div className="absolute inset-x-[13%] bottom-[8%] h-[10%] rounded-[1.4rem] bg-[#efe5d5]" />

          <PixelBlock className="left-[9%] top-[18%] w-[17%] bg-[#fff5e8]">
            <div className="space-y-2 text-[#5a4635]">
              <p className="text-[11px] font-semibold tracking-[0.18em]">TODAY BOARD</p>
              <div className="h-2 w-full bg-[#d1b798]" />
              <div className="h-2 w-[82%] bg-[#d1b798]" />
              <div className="h-2 w-[68%] bg-[#d1b798]" />
            </div>
          </PixelBlock>

          <PixelBlock className="right-[9%] top-[20%] w-[14%] bg-[#cfe6bf]">
            <div className="space-y-2">
              <div className="h-6 w-6 border-4 border-[#5a4635] bg-[#7bb07e]" />
              <div className="h-2 w-full bg-[#8d6a45]" />
            </div>
          </PixelBlock>

          <PixelBlock className="bottom-[12%] left-[10%] w-[15%] bg-[#ffe8c9]">
            <div className="space-y-2 text-[#5a4635]">
              <p className="text-[11px] font-semibold tracking-[0.18em]">COFFEE BAR</p>
              <div className="flex gap-2">
                <div className="h-5 w-5 border-4 border-[#5a4635] bg-[#f2c18d]" />
                <div className="h-5 w-5 border-4 border-[#5a4635] bg-[#9bc3a5]" />
              </div>
            </div>
          </PixelBlock>

          <PixelBlock className="bottom-[11%] right-[10%] w-[16%] bg-[#f6d5dd]">
            <div className="space-y-2 text-[#5a4635]">
              <p className="text-[11px] font-semibold tracking-[0.18em]">LOCKER</p>
              <div className="grid grid-cols-3 gap-1">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div className="h-4 border-2 border-[#5a4635] bg-[#fff5e8]" key={index} />
                ))}
              </div>
            </div>
          </PixelBlock>

          {deskOccupancy.map(({ desk, occupant }) => (
            <DeskTile
              desk={desk}
              key={desk.id}
              occupant={occupant}
              selected={desk.id === myDeskId}
            />
          ))}

          {overflowCount > 0 ? (
            <div className="absolute right-[7%] top-[12%] border-4 border-[#5a4635] bg-[#fff5e8] px-4 py-2 text-[11px] font-semibold text-[#5a4635] shadow-[4px_4px_0_rgba(90,70,53,0.12)]">
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
  const statusCopy = occupant ? getSeatStatusCopy(occupant) : null;

  return (
    <div
      className="absolute"
      style={{
        left: `${desk.position.x * 100}%`,
        top: `${desk.position.y * 100}%`,
        transform: "translate(-50%, -50%)",
      }}
    >
      <div className="relative w-[192px]">
        {statusCopy ? (
          <div className="absolute -top-8 left-1/2 z-20 -translate-x-1/2">
            <span
              className={cn(
                "inline-flex items-center gap-2 border-4 px-3 py-1 text-[11px] font-semibold shadow-[4px_4px_0_rgba(90,70,53,0.12)]",
                statusCopy.className,
              )}
            >
              <span className="h-2 w-2 rounded-full bg-current" />
              {statusCopy.label}
            </span>
          </div>
        ) : null}

        <div
          className={cn(
            "relative h-[174px] w-[192px] border-[5px] border-[#5a4635] bg-[#f8ebd8] shadow-[10px_10px_0_rgba(90,70,53,0.12)]",
            selected ? "ring-4 ring-[#f59e0b]/25" : "",
          )}
        >
          <div className="absolute inset-x-0 top-0 h-5 bg-[#b28c63]" />
          <div className="absolute inset-x-[12px] top-[22px] h-[18px] border-4 border-[#5a4635] bg-[#e8dccd]" />
          <div className="absolute left-[18px] top-[30px] h-4 w-12 bg-[#7bb07e]" />
          <div className="absolute right-[18px] top-[28px] h-10 w-12 border-4 border-[#5a4635] bg-[#88c2f0]" />
          <div className="absolute right-[30px] top-[68px] h-2 w-8 bg-[#5a4635]" />
          <div className="absolute left-[18px] top-[78px] h-3 w-9 bg-[#f2c18d]" />
          <div className="absolute left-[66px] top-[76px] h-3 w-9 bg-[#d2b38e]" />
          <div className="absolute left-1/2 top-[88px] h-4 w-[96px] -translate-x-1/2 border-4 border-[#5a4635] bg-[#d8c3ab]" />
          <div className="absolute left-1/2 top-[108px] h-[34px] w-[70px] -translate-x-1/2 border-4 border-[#5a4635] bg-[#8f7050]" />
          <div className="absolute bottom-[20px] left-1/2 h-10 w-[94px] -translate-x-1/2 border-4 border-[#5a4635] bg-[#c8b39b]" />
          <div className="absolute bottom-[9px] left-1/2 h-4 w-6 -translate-x-1/2 bg-[#5a4635]" />

          {selected ? (
            <div className="absolute left-3 top-3 z-20 border-4 border-[#5a4635] bg-[#fff1c9] px-2 py-1 text-[10px] font-bold text-[#7a4a00]">
              내 자리
            </div>
          ) : null}

          {occupant ? (
            <div className="absolute left-1/2 top-[104px] -translate-x-1/2">
              <Avatar occupant={occupant} selected={selected} />
            </div>
          ) : (
            <div className="absolute left-1/2 top-[112px] -translate-x-1/2">
              <div className="h-[42px] w-[34px] border-4 border-dashed border-[#ccb59a] bg-[#fcf5eb]" />
            </div>
          )}

          <div className="absolute inset-x-2 bottom-2 border-2 border-[#d9c2a4] bg-white/90 px-2 py-1.5 text-center">
            <p className="text-[11px] font-semibold text-[#4f3d31]">
              {occupant ? `${occupant.nickname}${occupant.self ? " · 나" : ""}` : "빈 자리"}
            </p>
            <p className="mt-0.5 text-[10px] text-[#7a6656]">
              {occupant ? getTopLevelStateLabel(occupant) : desk.neighborhood}
            </p>
          </div>
        </div>

        <div className="mt-2 flex items-center justify-center gap-2">
          <span
            className={cn(
              "inline-flex border-2 px-2.5 py-1 text-[11px] font-semibold shadow-[3px_3px_0_rgba(90,70,53,0.08)]",
              desk.accentClassName,
            )}
          >
            {desk.label}
          </span>
          <span className="text-[11px] font-medium text-[#6f573f]">{desk.neighborhood}</span>
        </div>
      </div>
    </div>
  );
}

function Avatar({ occupant, selected }: { occupant: OfficePresenceMember; selected: boolean }) {
  return (
    <div className="flex flex-col items-center">
      <div className="h-6 w-6 border-4 border-[#5a4635] bg-[#ffd7b0]" />
      <div
        className={cn(
          "mt-[-2px] h-7 w-10 border-4 border-[#5a4635]",
          selected ? "bg-[#f59e0b]" : "bg-[#7c9eff]",
        )}
      />
      <div className="mt-1 border-2 border-[#5a4635] bg-white px-1.5 text-[9px] font-bold text-[#2a1f17]">
        {occupant.self ? "나" : occupant.nickname.slice(0, 1)}
      </div>
    </div>
  );
}

function PixelBlock({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "absolute border-[5px] border-[#5a4635] px-4 py-3 shadow-[6px_6px_0_rgba(90,70,53,0.12)]",
        className,
      )}
    >
      {children}
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

function getSeatStatusCopy(member: OfficePresenceMember) {
  if (member.topLevelState === "checked_out") {
    return {
      label: "퇴근함",
      className: "border-[#c7b2c7] bg-[#f6ecf7] text-[#7f4d89]",
    };
  }

  if (member.topLevelState === "away") {
    return {
      label: "자리 비움",
      className: "border-[#d4c6b3] bg-[#f8f3eb] text-[#6c5848]",
    };
  }

  if (member.topLevelState === "resting") {
    return {
      label: member.statusLabel ?? "휴식 중",
      className: "border-[#b8d7b7] bg-[#edf8ee] text-[#2f6b39]",
    };
  }

  if (member.topLevelState === "before_check_in") {
    return {
      label: "출근 전",
      className: "border-[#f0c78c] bg-[#fff4de] text-[#8a5a11]",
    };
  }

  return {
    label: member.statusLabel ?? "업무 중",
    className: "border-[#b9cdf2] bg-[#edf4ff] text-[#315a93]",
  };
}

function getTopLevelStateLabel(member: OfficePresenceMember) {
  if (member.topLevelState === "checked_out") {
    return "오늘 일정 종료";
  }

  if (member.topLevelState === "away") {
    return "잠시 자리 비움";
  }

  if (member.topLevelState === "resting") {
    return member.statusLabel ?? "휴식 중";
  }

  if (member.topLevelState === "before_check_in") {
    return "출근 준비 중";
  }

  return member.statusLabel ?? "업무 진행 중";
}
