"use client";

import { OfficeFloor } from "@/components/office/office-floor";
import { OfficeSidebar } from "@/components/office/office-sidebar";
import { getStatusLabel } from "@/lib/constants";
import { OFFICE_NAME, OFFICE_REALTIME_TOPIC, OFFICE_TAGLINE } from "@/lib/office/config";
import { OfficeExperience } from "@/lib/office/types";
import { Profile } from "@/lib/types";
import { useOfficePresence } from "@/components/office/use-office-presence";

interface OfficeShellProps {
  experience: OfficeExperience;
  profile: Profile;
}

export function OfficeShell({ experience, profile }: OfficeShellProps) {
  const { dashboard, officePulse } = experience;
  const statusLabel = dashboard.active_status ? getStatusLabel(dashboard.active_status.status_type) : null;
  const roomOptions = experience.rooms.map((room) => ({
    id: room.id,
    name: room.name,
    shortLabel: room.shortLabel,
  }));

  const { members, connectionState } = useOfficePresence({
    currentRoomId: "lobby",
    position: { x: 0.24, y: 0.34 },
    profile: { id: profile.id, nickname: profile.nickname },
    roomOptions,
    statusLabel,
    topLevelState: dashboard.top_level_state,
    topic: OFFICE_REALTIME_TOPIC,
  });

  return (
    <div className="space-y-5">
      <section className="rounded-[2rem] border border-[#e3d0b7] bg-white/70 px-5 py-4 shadow-sm backdrop-blur">
        <p className="font-mono text-xs font-semibold uppercase tracking-[0.24em] text-[#8b5e34]">
          Office First
        </p>
        <div className="mt-2 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="font-['Space_Grotesk'] text-3xl font-semibold text-[#2a1f17]">{OFFICE_NAME}</h1>
            <p className="mt-2 max-w-3xl text-sm leading-7 text-[#5d4b3d]">{OFFICE_TAGLINE}</p>
          </div>
          <div className="text-sm text-[#6c5848]">
            {profile.nickname}님이 지금 오피스에 들어와 있습니다.
          </div>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_24rem]">
        <OfficeFloor connectionState={connectionState} members={members} profileId={profile.id} />
        <OfficeSidebar
          activity={officePulse.recentActivity}
          isLocked={Boolean(dashboard.workday?.check_out_at)}
          members={members}
          profile={profile}
          statusLabel={statusLabel}
          tasks={dashboard.tasks}
          workdayGoal={dashboard.workday?.today_goal ?? null}
        />
      </section>
    </div>
  );
}
