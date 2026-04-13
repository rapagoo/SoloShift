"use client";

import Image from "next/image";
import { useMemo, useRef } from "react";

import { getOfficeAssetPath } from "@/lib/office/assets";
import {
  OFFICE_DECOR_ITEMS,
  OFFICE_DESKS,
  OFFICE_FLOOR_LABEL,
} from "@/lib/office/config";
import { assignOfficeDesk, clampOfficeAvatarPosition } from "@/lib/office/spatial";
import {
  OfficeAvatarPosition,
  OfficeChatBubble,
  OfficeDecorConfig,
  OfficeDeskConfig,
  OfficePresenceMember,
  OfficeRealtimeConnectionState,
} from "@/lib/office/types";
import { cn } from "@/lib/utils";

interface OfficeFloorProps {
  chatBubbles: Record<string, OfficeChatBubble>;
  connectionState: OfficeRealtimeConnectionState;
  members: OfficePresenceMember[];
  onMove: (position: OfficeAvatarPosition) => void;
  profileId: string;
}

export function OfficeFloor({
  chatBubbles,
  connectionState,
  members,
  onMove,
  profileId,
}: OfficeFloorProps) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const backgroundAsset = getOfficeAssetPath("office-background");
  const allKnownUserIds = Array.from(new Set([profileId, ...members.map((member) => member.userId)]));
  const myDeskId = assignOfficeDesk(allKnownUserIds, profileId, OFFICE_DESKS);
  const sortedMembers = useMemo(
    () =>
      [...members].sort((left, right) => {
        if (left.self !== right.self) {
          return left.self ? 1 : -1;
        }

        return left.position.y - right.position.y;
      }),
    [members],
  );

  const handleMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!mapRef.current) {
      return;
    }

    const rect = mapRef.current.getBoundingClientRect();
    const next = clampOfficeAvatarPosition({
      x: (event.clientX - rect.left) / rect.width,
      y: (event.clientY - rect.top) / rect.height,
    });

    onMove(next);
  };

  return (
    <section className="overflow-hidden rounded-[2.6rem] border border-[#d6c0a1] bg-[linear-gradient(180deg,#fff7ee_0%,#f7e6d0_100%)] shadow-[0_28px_75px_-42px_rgba(90,70,53,0.35)]">
      <div className="flex flex-col gap-4 border-b border-[#e7d7c3] px-6 py-5 md:flex-row md:items-end md:justify-between">
        <div className="max-w-3xl">
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.28em] text-[#8b5e34]">
            {OFFICE_FLOOR_LABEL}
          </p>
          <h2 className="mt-2 font-['Space_Grotesk'] text-3xl font-semibold text-[#2a1f17]">
            넓은 공유 오피스에서 움직이고, 바로 말 걸 수 있는 메인 공간
          </h2>
          <p className="mt-2 text-sm leading-7 text-[#5d4b3d]">
            바닥을 클릭하면 이동하고, 채팅을 보내면 아바타 위에 말풍선이 잠깐 떠오릅니다. 지금은
            플레이스홀더 그래픽으로 테스트하고, 나중에는 준비하실 픽셀 아트를 같은 위치 슬롯에 바로
            꽂을 수 있게 구조를 바꿔두었습니다.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-sm">
          <Chip label={`온라인 ${members.length}명`} tone="solid" />
          <Chip label={`홈 책상 ${myDeskId.toUpperCase().replace("DESK-", "Desk ")}`} />
          <Chip label="바닥 클릭 이동" />
          <Chip label={getConnectionLabel(connectionState)} />
        </div>
      </div>

      <div className="p-5 sm:p-6">
        <div
          className="relative aspect-[16/10] overflow-hidden rounded-[2.2rem] border-[6px] border-[#5a4635] bg-[#ddc8ad] shadow-[12px_12px_0_rgba(90,70,53,0.14)]"
          onClick={handleMove}
          ref={mapRef}
        >
          {backgroundAsset ? (
            <Image
              alt="Main office background"
              className="object-cover"
              fill
              priority
              sizes="(min-width: 1280px) 72vw, 100vw"
              src={backgroundAsset}
            />
          ) : (
            <>
              <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.11)_2px,transparent_2px),linear-gradient(90deg,rgba(255,255,255,0.11)_2px,transparent_2px)] bg-[size:28px_28px]" />
              <div className="absolute inset-x-[8%] top-[6%] h-[16%] rounded-[1.25rem] bg-[#a7d8ff]" />
              <div className="absolute inset-x-[7%] top-[5%] h-[18%] rounded-[1.4rem] border-[6px] border-[#5a4635]" />
              <div className="absolute inset-x-[12%] top-[28%] h-[12%] rounded-[999px] bg-[#efe5d5]" />
              <div className="absolute left-1/2 top-[18%] h-[62%] w-[15%] -translate-x-1/2 rounded-[999px] bg-[#efe5d5]" />
              <div className="absolute inset-x-[11%] bottom-[8%] h-[10%] rounded-[1.6rem] bg-[#efe5d5]" />
            </>
          )}

          {OFFICE_DECOR_ITEMS.map((decor) => (
            <DecorProp decor={decor} key={decor.id} />
          ))}

          {OFFICE_DESKS.map((desk) => (
            <DeskProp desk={desk} key={desk.id} selected={desk.id === myDeskId} />
          ))}

          {sortedMembers.map((member) => (
            <AvatarMarker bubble={chatBubbles[member.userId]} key={member.presenceKey} member={member} />
          ))}

          <div className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 border-4 border-[#5a4635] bg-[#fff5e8] px-4 py-2 text-[11px] font-semibold text-[#5a4635] shadow-[4px_4px_0_rgba(90,70,53,0.12)]">
            바닥을 클릭하면 이동합니다
          </div>
        </div>
      </div>
    </section>
  );
}

function DecorProp({ decor }: { decor: OfficeDecorConfig }) {
  const assetPath = getOfficeAssetPath(decor.assetSlot);

  return (
    <div
      className="absolute relative"
      style={{
        left: `${decor.position.x * 100}%`,
        top: `${decor.position.y * 100}%`,
        width: `${decor.widthPercent * 100}%`,
        height: `${decor.heightPercent * 100}%`,
        transform: "translate(-50%, -50%)",
        zIndex: decor.zIndex ?? 1,
      }}
    >
      {assetPath ? (
        <Image
          alt={decor.label}
          className="object-contain"
          fill
          sizes="20vw"
          src={assetPath}
        />
      ) : (
        <div
          className={cn(
            "flex h-full w-full items-center justify-center border-[5px] border-[#5a4635] px-3 text-center text-[11px] font-semibold text-[#5a4635] shadow-[6px_6px_0_rgba(90,70,53,0.12)]",
            decor.accentClassName,
          )}
        >
          {decor.label}
        </div>
      )}
    </div>
  );
}

function DeskProp({ desk, selected }: { desk: OfficeDeskConfig; selected: boolean }) {
  const deskAsset = getOfficeAssetPath("desk");
  const chairAsset = getOfficeAssetPath("chair");

  return (
    <div
      className="absolute"
      style={{
        left: `${desk.position.x * 100}%`,
        top: `${desk.position.y * 100}%`,
        transform: "translate(-50%, -50%)",
        zIndex: 4,
      }}
    >
      <div className="relative w-[214px]">
        {selected ? (
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 border-4 border-[#5a4635] bg-[#fff1c9] px-3 py-1 text-[11px] font-bold text-[#7a4a00] shadow-[4px_4px_0_rgba(90,70,53,0.12)]">
            내 자리 후보
          </div>
        ) : null}

        <div className="relative h-[134px]">
          <div className="absolute inset-x-[20px] top-[18px] h-[72px] relative">
            {deskAsset ? (
              <Image
                alt={desk.label}
                className="object-contain"
                fill
                sizes="18vw"
                src={deskAsset}
              />
            ) : (
              <div className="relative h-full w-full border-[5px] border-[#5a4635] bg-[#f8ebd8] shadow-[10px_10px_0_rgba(90,70,53,0.12)]">
                <div className="absolute inset-x-0 top-0 h-5 bg-[#b28c63]" />
                <div className="absolute inset-x-[12px] top-[22px] h-[18px] border-4 border-[#5a4635] bg-[#e8dccd]" />
                <div className="absolute left-[18px] top-[30px] h-4 w-12 bg-[#7bb07e]" />
                <div className="absolute right-[18px] top-[28px] h-10 w-12 border-4 border-[#5a4635] bg-[#88c2f0]" />
                <div className="absolute right-[30px] top-[68px] h-2 w-8 bg-[#5a4635]" />
                <div className="absolute left-[18px] top-[78px] h-3 w-9 bg-[#f2c18d]" />
                <div className="absolute left-[66px] top-[76px] h-3 w-9 bg-[#d2b38e]" />
              </div>
            )}
          </div>

          <div className="absolute inset-x-[64px] bottom-0 h-[52px] relative">
            {chairAsset ? (
              <Image
                alt={`${desk.label} chair`}
                className="object-contain"
                fill
                sizes="12vw"
                src={chairAsset}
              />
            ) : (
              <div className="relative h-full w-full">
                <div className="absolute left-1/2 top-0 h-[34px] w-[72px] -translate-x-1/2 border-4 border-[#5a4635] bg-[#8f7050]" />
                <div className="absolute bottom-[10px] left-1/2 h-10 w-[94px] -translate-x-1/2 border-4 border-[#5a4635] bg-[#c8b39b]" />
                <div className="absolute bottom-0 left-1/2 h-4 w-6 -translate-x-1/2 bg-[#5a4635]" />
              </div>
            )}
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

function AvatarMarker({
  bubble,
  member,
}: {
  bubble?: OfficeChatBubble;
  member: OfficePresenceMember;
}) {
  const avatarAsset = getOfficeAssetPath("avatar");

  return (
    <div
      className="absolute"
      style={{
        left: `${member.position.x * 100}%`,
        top: `${member.position.y * 100}%`,
        transform: "translate(-50%, -50%)",
        zIndex: member.self ? 20 : 10 + Math.round(member.position.y * 10),
      }}
    >
      {bubble ? <SpeechBubble bubble={bubble} /> : null}

      <div className="relative flex flex-col items-center">
        <div className="h-3 w-10 rounded-full bg-black/10 blur-[2px]" />
        {avatarAsset ? (
          <div className="relative -mt-2 h-[74px] w-[52px]">
            <Image
              alt={member.nickname}
              className="object-contain"
              fill
              sizes="52px"
              src={avatarAsset}
            />
          </div>
        ) : (
          <div className="relative -mt-2 flex flex-col items-center">
            <div className="h-6 w-6 border-4 border-[#5a4635] bg-[#ffd7b0]" />
            <div
              className={cn(
                "mt-[-2px] h-8 w-10 border-4 border-[#5a4635]",
                member.self ? "bg-[#f59e0b]" : "bg-[#7c9eff]",
              )}
            />
          </div>
        )}

        <div className="mt-1 flex flex-col items-center gap-1">
          <span className="border-2 border-[#5a4635] bg-white/95 px-2 py-0.5 text-[10px] font-bold text-[#2a1f17] shadow-[3px_3px_0_rgba(90,70,53,0.08)]">
            {member.nickname}
          </span>
          <span className={cn("border-2 px-2 py-0.5 text-[10px] font-semibold", getStateChipClass(member))}>
            {getStateLabel(member)}
          </span>
        </div>
      </div>
    </div>
  );
}

function SpeechBubble({ bubble }: { bubble: OfficeChatBubble }) {
  return (
    <div className="absolute -top-16 left-1/2 max-w-[220px] -translate-x-1/2">
      <div className="rounded-[1rem] border-4 border-[#5a4635] bg-white px-3 py-2 text-center text-xs font-medium leading-5 text-[#2a1f17] shadow-[6px_6px_0_rgba(90,70,53,0.12)]">
        {bubble.message}
      </div>
      <div className="mx-auto h-4 w-4 rotate-45 border-b-4 border-r-4 border-[#5a4635] bg-white -translate-y-2" />
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

function getStateChipClass(member: OfficePresenceMember) {
  if (member.topLevelState === "checked_out") {
    return "border-[#c7b2c7] bg-[#f6ecf7] text-[#7f4d89]";
  }

  if (member.topLevelState === "away") {
    return "border-[#d4c6b3] bg-[#f8f3eb] text-[#6c5848]";
  }

  if (member.topLevelState === "resting") {
    return "border-[#b8d7b7] bg-[#edf8ee] text-[#2f6b39]";
  }

  if (member.topLevelState === "before_check_in") {
    return "border-[#f0c78c] bg-[#fff4de] text-[#8a5a11]";
  }

  return "border-[#b9cdf2] bg-[#edf4ff] text-[#315a93]";
}

function getStateLabel(member: OfficePresenceMember) {
  if (member.topLevelState === "checked_out") {
    return "퇴근";
  }

  if (member.topLevelState === "away") {
    return "자리 비움";
  }

  if (member.topLevelState === "resting") {
    return member.statusLabel ?? "휴식";
  }

  if (member.topLevelState === "before_check_in") {
    return "출근 전";
  }

  return member.statusLabel ?? "업무 중";
}
