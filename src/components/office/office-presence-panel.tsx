"use client";

import { OFFICE_DESKS } from "@/lib/office/config";
import { buildDeskOccupancy } from "@/lib/office/spatial";
import { OfficePresenceMember, OfficeRealtimeConnectionState } from "@/lib/office/types";
import { cn } from "@/lib/utils";

interface OfficePresencePanelProps {
  connectionState: OfficeRealtimeConnectionState;
  errorDetail?: string | null;
  members: OfficePresenceMember[];
}

export function OfficePresencePanel({
  connectionState,
  errorDetail,
  members,
}: OfficePresencePanelProps) {
  const deskOccupancy = buildDeskOccupancy(members, OFFICE_DESKS);
  const occupiedDeskCount = deskOccupancy.filter((entry) => entry.occupant).length;
  const emptyDeskCount = Math.max(0, OFFICE_DESKS.length - occupiedDeskCount);
  const others = members.filter((member) => !member.self);

  return (
    <section className="rounded-[2rem] border-4 border-[#5a4635] bg-[#fff5e8] p-6 shadow-[6px_6px_0_rgba(90,70,53,0.12)]">
      <p className="font-mono text-xs font-semibold uppercase tracking-[0.24em] text-[#8b5e34]">
        Office Presence
      </p>
      <div className="mt-3 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="font-['Space_Grotesk'] text-3xl font-semibold text-[#2a1f17]">
            같은 오피스에 출근한 사람들
          </h2>
          <p className="mt-3 text-sm leading-7 text-[#5d4b3d]">
            핵심은 자유 이동보다 존재감입니다. 누가 자리에 앉아 있고, 누가 일하고 있고, 몇 자리가
            비어 있는지를 한눈에 보는 오피스 패널입니다.
          </p>
        </div>
        <PresenceStatusBadge state={connectionState} />
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <MetricTile label="온라인" value={`${members.length}명`} />
        <MetricTile label="착석" value={`${occupiedDeskCount}/${OFFICE_DESKS.length}`} />
        <MetricTile label="빈 자리" value={`${emptyDeskCount}개`} />
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="border-2 border-[#d9c2a4] bg-white/75 p-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-[#4f3d31]">자리 현황</p>
            <span className="text-xs uppercase tracking-[0.16em] text-[#8b5e34]">
              {OFFICE_DESKS.length}석
            </span>
          </div>
          <ul className="mt-3 space-y-3">
            {deskOccupancy.map(({ desk, occupant }) => (
              <li className="border-2 border-[#e3d3c0] bg-[#fffaf4] px-4 py-3 text-sm" key={desk.id}>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-[#2a1f17]">{desk.label}</p>
                    <p className="mt-1 text-xs text-[#7a6656]">{desk.neighborhood}</p>
                  </div>
                  <span className="font-medium text-[#4f3d31]">
                    {occupant ? `${occupant.nickname}${occupant.self ? " (나)" : ""}` : "빈 자리"}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="border-2 border-[#d9c2a4] bg-white/75 p-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-[#4f3d31]">온라인 사용자</p>
            <span className="text-xs uppercase tracking-[0.16em] text-[#8b5e34]">
              {others.length}명 동시 접속
            </span>
          </div>
          {connectionState === "error" ? (
            <p className="mt-3 text-sm leading-6 text-rose-700">
              실시간 오피스 채널에 연결하지 못했습니다. 로그인 상태와 Supabase Realtime
              authorization 정책을 확인해주세요.
              {errorDetail ? (
                <span className="mt-2 block border border-rose-200 bg-rose-50 px-3 py-2 text-xs leading-5 text-rose-700">
                  {errorDetail}
                </span>
              ) : null}
            </p>
          ) : members.length === 0 ? (
            <p className="mt-3 text-sm leading-6 text-[#5d4b3d]">
              아직 오피스에 연결된 사용자가 없습니다. 로그인 후 잠시 기다리면 자리가 배정됩니다.
            </p>
          ) : (
            <ul className="mt-3 space-y-3">
              {members.map((member) => (
                <li className="border-2 border-[#e3d3c0] bg-[#fffaf4] px-4 py-3" key={member.presenceKey}>
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium text-[#2a1f17]">{member.nickname}</p>
                        {member.self ? (
                          <span className="border border-orange-300 bg-orange-100 px-2 py-0.5 text-[11px] font-semibold text-orange-800">
                            나
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-1 text-sm text-[#6f5b49]">
                        {member.statusLabel ?? "오늘 흐름 준비 중"}
                      </p>
                    </div>
                    <span className="font-mono text-xs text-[#8b5e34]">
                      {member.connectionCount > 1 ? `${member.connectionCount} connections` : "single connection"}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}

function PresenceStatusBadge({ state }: { state: OfficeRealtimeConnectionState }) {
  const copy =
    state === "live"
      ? { label: "실시간 연결됨", className: "border-emerald-300 bg-emerald-100 text-emerald-800" }
      : state === "error"
        ? { label: "연결 확인 필요", className: "border-rose-300 bg-rose-100 text-rose-800" }
        : { label: "실시간 연결 중", className: "border-amber-300 bg-amber-100 text-amber-800" };

  return <span className={cn("border px-3 py-1.5 text-sm font-medium", copy.className)}>{copy.label}</span>;
}

function MetricTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-2 border-[#d9c2a4] bg-white/75 px-4 py-4 text-center">
      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#8b5e34]">{label}</p>
      <p className="mt-2 text-xl font-semibold text-[#2a1f17]">{value}</p>
    </div>
  );
}
