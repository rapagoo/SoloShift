"use client";

import { OFFICE_DESKS, OFFICE_FLOOR_LABEL } from "@/lib/office/config";
import { assignOfficeDesk, buildDeskOccupancy } from "@/lib/office/spatial";
import {
  OfficeDeskConfig,
  OfficeDeskId,
  OfficePresenceMember,
  OfficeRealtimeConnectionState,
} from "@/lib/office/types";
import { cn } from "@/lib/utils";

interface OfficeFloorProps {
  connectionState: OfficeRealtimeConnectionState;
  members: OfficePresenceMember[];
  profileId: string;
  profileNickname: string;
}

export function OfficeFloor({
  connectionState,
  members,
  profileId,
  profileNickname,
}: OfficeFloorProps) {
  const allKnownUserIds = Array.from(new Set([profileId, ...members.map((member) => member.userId)]));
  const myDeskId = assignOfficeDesk(allKnownUserIds, profileId, OFFICE_DESKS);
  const myDesk = OFFICE_DESKS.find((desk) => desk.id === myDeskId) ?? OFFICE_DESKS[0];
  const deskOccupancy = buildDeskOccupancy(members, OFFICE_DESKS);
  const occupiedDeskCount = deskOccupancy.filter((entry) => entry.occupant).length;
  const overflowCount = Math.max(0, members.length - OFFICE_DESKS.length);

  return (
    <section className="rounded-[2rem] border border-[var(--line)] bg-[#f8f1e5] p-6 shadow-sm">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.28em] text-[#8b5e34]">
            Shared Office
          </p>
          <h2 className="mt-3 font-['Space_Grotesk'] text-3xl font-semibold text-[#2a1f17]">
            네 자리만 있는 작은 픽셀 오피스
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-[#5d4b3d]">
            이제 오피스는 방을 오가는 화면이 아니라, 같은 책상 줄에서 서로가 일하고 있는지
            느끼는 메인 공간입니다. 로그인하면 바로 이 공간에 들어와서 오늘 자리에 앉은 사람들을
            확인하는 흐름으로 가져갑니다.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-sm">
          <PixelChip label={OFFICE_FLOOR_LABEL} tone="solid" />
          <PixelChip label={`온라인 ${members.length}명`} />
          <PixelChip label={`빈 자리 ${Math.max(0, OFFICE_DESKS.length - occupiedDeskCount)}개`} />
          <PixelChip label={getConnectionLabel(connectionState)} />
        </div>
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="relative aspect-[16/10] overflow-hidden border-4 border-[#5a4635] bg-[#dbc8ae] p-4 shadow-[8px_8px_0_rgba(90,70,53,0.15)]">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.12)_2px,transparent_2px),linear-gradient(90deg,rgba(255,255,255,0.12)_2px,transparent_2px)] bg-[size:24px_24px]" />
          <div className="absolute inset-x-[8%] top-[8%] h-[18%] border-4 border-[#7eb6d9] bg-[#bfe3ff] shadow-[0_6px_0_rgba(90,70,53,0.12)]" />
          <div className="absolute left-[8%] right-[8%] top-[31%] h-3 bg-[#b28c63]" />
          <div className="absolute left-[48%] top-[24%] h-[54%] w-3 -translate-x-1/2 bg-[#b28c63]" />
          <div className="absolute bottom-[8%] left-[8%] h-[12%] w-[24%] border-4 border-[#5a4635] bg-[#9bc3a5]" />
          <div className="absolute bottom-[8%] right-[8%] h-[12%] w-[20%] border-4 border-[#5a4635] bg-[#f5d1a8]" />
          <div className="absolute bottom-[10%] right-[10%] h-8 w-8 border-4 border-[#5a4635] bg-[#fff6ed]" />

          {deskOccupancy.map(({ desk, occupant }) => (
            <DeskStation
              desk={desk}
              key={desk.id}
              occupant={occupant}
              profileNickname={profileNickname}
              selected={desk.id === myDeskId}
            />
          ))}

          {overflowCount > 0 ? (
            <div className="absolute right-[6%] top-[8%] border-4 border-[#5a4635] bg-[#fff5e8] px-3 py-2 text-[11px] font-semibold text-[#5a4635] shadow-[4px_4px_0_rgba(90,70,53,0.12)]">
              대기 {overflowCount}명
            </div>
          ) : null}
        </div>

        <div className="space-y-4">
          <aside className="border-4 border-[#5a4635] bg-[#fff5e8] p-4 shadow-[4px_4px_0_rgba(90,70,53,0.12)]">
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-[#8b5e34]">
              My Desk
            </p>
            <div className="mt-3 space-y-3 text-sm leading-6 text-[#5d4b3d]">
              <PixelRow label="자리" value={myDesk?.label ?? "Desk A"} />
              <PixelRow label="구역" value={myDesk?.neighborhood ?? "창가 왼쪽"} />
              <PixelRow label="상태" value={resolveSelfStatus(members, profileId)} />
              <p>
                이 자리에서 오늘 작업과 집중 상태가 보이는 방향으로 확장하면, 굳이 많이 움직이지
                않아도 “같은 사무실에 출근했다”는 감각이 생깁니다.
              </p>
            </div>
          </aside>

          <aside className="border-4 border-[#5a4635] bg-[#fff5e8] p-4 shadow-[4px_4px_0_rgba(90,70,53,0.12)]">
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-[#8b5e34]">
              Seat Roster
            </p>
            <ul className="mt-3 space-y-3">
              {deskOccupancy.map(({ desk, occupant }) => (
                <li
                  className="flex items-center justify-between gap-3 border-2 border-[#d9c2a4] bg-white/70 px-3 py-3 text-sm text-[#4f3d31]"
                  key={desk.id}
                >
                  <div>
                    <p className="font-semibold text-[#2a1f17]">{desk.label}</p>
                    <p className="text-xs text-[#7a6656]">{desk.neighborhood}</p>
                  </div>
                  <span className="text-right font-medium">
                    {occupant ? `${occupant.nickname}${occupant.self ? " (나)" : ""}` : "빈 자리"}
                  </span>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </div>
    </section>
  );
}

function DeskStation({
  desk,
  occupant,
  profileNickname,
  selected,
}: {
  desk: OfficeDeskConfig;
  occupant: OfficePresenceMember | null;
  profileNickname: string;
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
          "relative h-[104px] w-[112px] border-4 border-[#5a4635] bg-[#f7ead7] shadow-[6px_6px_0_rgba(90,70,53,0.14)]",
          selected ? "ring-4 ring-[#f59e0b]/30" : "",
        )}
      >
        <div className="absolute inset-x-0 top-0 h-3 bg-[#b28c63]" />
        <div className="absolute bottom-[18px] left-1/2 h-6 w-[72px] -translate-x-1/2 border-4 border-[#5a4635] bg-[#c8b092]" />
        <div className="absolute bottom-[8px] left-1/2 h-[10px] w-4 -translate-x-1/2 bg-[#5a4635]" />
        <div className="absolute right-[10px] top-[12px] h-6 w-6 border-4 border-[#5a4635] bg-[#7eb6d9]" />
        {occupant ? (
          <div className="absolute left-1/2 top-[34px] -translate-x-1/2">
            <PixelAvatar label={occupant.self ? "나" : occupant.nickname.slice(0, 1)} selected={selected} />
          </div>
        ) : (
          <div className="absolute left-1/2 top-[38px] h-7 w-7 -translate-x-1/2 border-4 border-dashed border-[#c7b09a] bg-[#fdf4ea]" />
        )}
        <div className="absolute inset-x-2 bottom-2 border-2 border-[#d9c2a4] bg-white/85 px-2 py-1 text-center text-[11px] font-semibold text-[#4f3d31]">
          {occupant ? `${occupant.nickname}${occupant.self ? " · 나" : ""}` : `${desk.label} 비어 있음`}
        </div>
      </div>
      <div className="mt-2 text-center">
        <span className={cn("inline-flex border-2 px-2 py-1 text-[11px] font-semibold", desk.accentClassName)}>
          {desk.label}
        </span>
      </div>
      {occupant ? (
        <div className="mt-1 text-center text-[11px] text-[#5d4b3d]">
          {occupant.self ? profileNickname : occupant.nickname}
        </div>
      ) : null}
    </div>
  );
}

function PixelAvatar({ label, selected }: { label: string; selected: boolean }) {
  return (
    <div className="flex flex-col items-center">
      <div className="h-5 w-5 border-4 border-[#5a4635] bg-[#ffd7b0]" />
      <div className={cn("mt-[-2px] h-5 w-7 border-4 border-[#5a4635]", selected ? "bg-[#f59e0b]" : "bg-[#7c9eff]")} />
      <div className="mt-1 border-2 border-[#5a4635] bg-white px-1 text-[9px] font-bold text-[#2a1f17]">
        {label}
      </div>
    </div>
  );
}

function PixelChip({ label, tone = "default" }: { label: string; tone?: "default" | "solid" }) {
  return (
    <span
      className={cn(
        "border-2 px-3 py-1.5 font-mono text-xs font-semibold uppercase tracking-[0.1em]",
        tone === "solid"
          ? "border-[#5a4635] bg-[#5a4635] text-[#fff7ef]"
          : "border-[#cfae87] bg-[#fff5e8] text-[#6f573f]",
      )}
    >
      {label}
    </span>
  );
}

function PixelRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 border-2 border-[#d9c2a4] bg-white/70 px-3 py-3">
      <span className="text-[#7a6656]">{label}</span>
      <span className="font-semibold text-[#2a1f17]">{value}</span>
    </div>
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

function resolveSelfStatus(members: OfficePresenceMember[], profileId: string) {
  const selfMember = members.find((member) => member.userId === profileId);
  return selfMember?.statusLabel ?? "오늘 흐름 준비 중";
}
