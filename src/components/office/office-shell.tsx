"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { OfficeFloor } from "@/components/office/office-floor";
import { OfficeSidebar } from "@/components/office/office-sidebar";
import { useOfficePresence } from "@/components/office/use-office-presence";
import { getStatusLabel } from "@/lib/constants";
import {
  OFFICE_DESKS,
  OFFICE_NAME,
  OFFICE_REALTIME_TOPIC,
  OFFICE_TAGLINE,
} from "@/lib/office/config";
import { clampOfficeAvatarPosition, moveOfficeAvatarTowards } from "@/lib/office/spatial";
import { OfficeAvatarPosition, OfficeExperience } from "@/lib/office/types";
import { Profile } from "@/lib/types";

const KEYBOARD_SPEED = 0.02;
const CLICK_MOVE_STEP = 0.018;
const KEYBOARD_MOVE_STEP = 0.024;

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
  const spawnPosition = OFFICE_DESKS[0].position;
  const [position, setPosition] = useState<OfficeAvatarPosition>(spawnPosition);
  const targetPositionRef = useRef<OfficeAvatarPosition>(spawnPosition);
  const pressedKeysRef = useRef<Set<string>>(new Set());

  const {
    members,
    connectionState,
    chatMessages,
    chatBubbles,
    sendChatMessage,
  } = useOfficePresence({
    currentRoomId: "lobby",
    position,
    profile: { id: profile.id, nickname: profile.nickname },
    roomOptions,
    statusLabel,
    topLevelState: dashboard.top_level_state,
    topic: OFFICE_REALTIME_TOPIC,
  });

  const setTargetPosition = useCallback((next: OfficeAvatarPosition) => {
    targetPositionRef.current = next;
  }, []);

  useEffect(() => {
    const shouldIgnoreKeyboard = (target: EventTarget | null) => {
      if (!(target instanceof HTMLElement)) {
        return false;
      }

      const tagName = target.tagName.toLowerCase();
      return tagName === "input" || tagName === "textarea" || target.isContentEditable;
    };

    const relevantKeys = new Set(["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"]);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (shouldIgnoreKeyboard(event.target) || !relevantKeys.has(event.key)) {
        return;
      }

      event.preventDefault();
      pressedKeysRef.current.add(event.key);
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (!relevantKeys.has(event.key)) {
        return;
      }

      pressedKeysRef.current.delete(event.key);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  useEffect(() => {
    let frameId = 0;

    const animate = () => {
      setPosition((current) => {
        const pressedKeys = pressedKeysRef.current;

        if (pressedKeys.size > 0) {
          const horizontal =
            (pressedKeys.has("ArrowRight") ? 1 : 0) - (pressedKeys.has("ArrowLeft") ? 1 : 0);
          const vertical =
            (pressedKeys.has("ArrowDown") ? 1 : 0) - (pressedKeys.has("ArrowUp") ? 1 : 0);

          if (horizontal !== 0 || vertical !== 0) {
            const magnitude = Math.hypot(horizontal, vertical) || 1;
            targetPositionRef.current = clampOfficeAvatarPosition({
              x: targetPositionRef.current.x + (horizontal / magnitude) * KEYBOARD_SPEED,
              y: targetPositionRef.current.y + (vertical / magnitude) * KEYBOARD_SPEED,
            });
          }
        }

        const next = moveOfficeAvatarTowards(
          current,
          targetPositionRef.current,
          pressedKeys.size > 0 ? KEYBOARD_MOVE_STEP : CLICK_MOVE_STEP,
        );

        if (Math.abs(next.x - current.x) < 0.0001 && Math.abs(next.y - current.y) < 0.0001) {
          return current;
        }

        return next;
      });

      frameId = window.requestAnimationFrame(animate);
    };

    frameId = window.requestAnimationFrame(animate);

    return () => window.cancelAnimationFrame(frameId);
  }, []);

  const displayedMembers = useMemo(() => {
    const nextMembers = members.map((member) =>
      member.self
        ? {
            ...member,
            position,
            posX: position.x,
            posY: position.y,
          }
        : member,
    );

    if (nextMembers.some((member) => member.self)) {
      return nextMembers;
    }

    return [
      {
        userId: profile.id,
        nickname: profile.nickname,
        roomId: "lobby" as const,
        topLevelState: dashboard.top_level_state,
        statusLabel,
        onlineAt: new Date().toISOString(),
        posX: position.x,
        posY: position.y,
        self: true,
        connectionCount: 1,
        presenceKey: profile.id,
        position,
      },
      ...nextMembers,
    ];
  }, [dashboard.top_level_state, members, position, profile.id, profile.nickname, statusLabel]);

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
            {profile.nickname}님이 지금 메인 오피스에서 움직이며 함께 일하고 있습니다.
          </div>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_31rem]">
        <OfficeFloor
          chatBubbles={chatBubbles}
          connectionState={connectionState}
          members={displayedMembers}
          onMove={setTargetPosition}
          profileId={profile.id}
        />
        <OfficeSidebar
          activity={officePulse.recentActivity}
          chatMessages={chatMessages}
          connectionState={connectionState}
          isLocked={Boolean(dashboard.workday?.check_out_at)}
          members={displayedMembers}
          onSendChat={sendChatMessage}
          profile={profile}
          statusLabel={statusLabel}
          tasks={dashboard.tasks}
          workdayGoal={dashboard.workday?.today_goal ?? null}
        />
      </section>
    </div>
  );
}
