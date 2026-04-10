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
  const [errorDetail, setErrorDetail] = useState<string | null>(null);

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
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError || !session?.access_token) {
          if (!cancelled) {
            setMembers([]);
            setConnectionState("error");
            setErrorDetail(
              sessionError?.message ??
                "브라우저 세션 토큰을 찾지 못했습니다. 다시 로그인한 뒤 시도해주세요.",
            );
          }
          return;
        }

        await supabase.realtime.setAuth(session.access_token);

        if (cancelled) {
          return;
        }

        setErrorDetail(null);

        channel
          .on("presence", { event: "sync" }, handleSync)
          .on("presence", { event: "join" }, handleSync)
          .on("presence", { event: "leave" }, handleSync)
          .subscribe(async (status, error) => {
            if (cancelled) {
              return;
            }

            if (status === "SUBSCRIBED") {
              setConnectionState("live");
              setErrorDetail(null);
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
              setErrorDetail(
                error?.message ??
                  "Realtime authorization 정책 또는 채널 설정을 다시 확인해주세요.",
              );
              return;
            }

            if (status === "CLOSED") {
              setMembers([]);
              setConnectionState("connecting");
              setErrorDetail(null);
            }
          });
      } catch {
        if (!cancelled) {
          setMembers([]);
          setConnectionState("error");
          setErrorDetail("실시간 채널 인증 중 오류가 발생했습니다.");
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
    errorDetail,
  };
}
