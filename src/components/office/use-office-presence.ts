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

interface UseOfficePresenceParams {
  currentRoomId: OfficeRoomId;
  profile: Pick<Profile, "id" | "nickname">;
  roomOptions: Pick<OfficeRoomSummary, "id" | "name" | "shortLabel">[];
  statusLabel: string | null;
  topLevelState: TopLevelState;
  topic: string;
}

export function useOfficePresence({
  currentRoomId,
  profile,
  roomOptions,
  statusLabel,
  topLevelState,
  topic,
}: UseOfficePresenceParams) {
  const [supabase] = useState(() => createSupabaseBrowserClient());
  const [members, setMembers] = useState<OfficePresenceMember[]>([]);
  const [connectionState, setConnectionState] =
    useState<OfficeRealtimeConnectionState>("connecting");

  const syncPresence = useEffectEvent((state: Record<string, OfficePresencePayload[]>) => {
    setMembers(listOfficePresenceMembers(state, profile.id));
  });

  useEffect(() => {
    let cancelled = false;
    let channel = supabase.channel(topic, {
      config: {
        private: true,
        presence: {
          key: profile.id,
        },
      },
    });

    const handleSync = () => {
      if (cancelled) {
        return;
      }

      syncPresence(channel.presenceState<OfficePresencePayload>());
    };

    void (async () => {
      try {
        await supabase.realtime.setAuth();

        if (cancelled) {
          return;
        }

        channel
          .on("presence", { event: "sync" }, handleSync)
          .on("presence", { event: "join" }, handleSync)
          .on("presence", { event: "leave" }, handleSync)
          .subscribe(async (status) => {
            if (cancelled) {
              return;
            }

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
              setMembers([]);
              setConnectionState("error");
              return;
            }

            if (status === "CLOSED") {
              setMembers([]);
              setConnectionState("connecting");
            }
          });
      } catch {
        if (!cancelled) {
          setMembers([]);
          setConnectionState("error");
        }
      }
    })();

    return () => {
      cancelled = true;
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

  return {
    members,
    roomCounts,
    connectionState,
  };
}
