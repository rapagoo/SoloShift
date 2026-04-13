"use client";

import type { RealtimeChannel } from "@supabase/supabase-js";
import { useEffect, useEffectEvent, useMemo, useRef, useState } from "react";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { countOfficePresenceByRoom, listOfficePresenceMembers } from "@/lib/office/presence";
import {
  OfficeAvatarPosition,
  OfficePresenceMember,
  OfficePresencePayload,
  OfficeRealtimeConnectionState,
  OfficeRoomId,
  OfficeRoomSummary,
} from "@/lib/office/types";
import { Profile, TopLevelState } from "@/lib/types";

interface UseOfficePresenceParams {
  currentRoomId: OfficeRoomId;
  position: OfficeAvatarPosition;
  profile: Pick<Profile, "id" | "nickname">;
  roomOptions: Pick<OfficeRoomSummary, "id" | "name" | "shortLabel">[];
  statusLabel: string | null;
  topLevelState: TopLevelState;
  topic: string;
}

export function useOfficePresence({
  currentRoomId,
  position,
  profile,
  roomOptions,
  statusLabel,
  topLevelState,
  topic,
}: UseOfficePresenceParams) {
  const [supabase] = useState(() => createSupabaseBrowserClient());
  const channelRef = useRef<RealtimeChannel | null>(null);
  const [members, setMembers] = useState<OfficePresenceMember[]>([]);
  const [connectionState, setConnectionState] =
    useState<OfficeRealtimeConnectionState>("connecting");
  const [errorDetail, setErrorDetail] = useState<string | null>(null);
  const [presenceReady, setPresenceReady] = useState(false);

  const buildPresencePayload = useEffectEvent((): OfficePresencePayload => {
    return {
      userId: profile.id,
      nickname: profile.nickname,
      roomId: currentRoomId,
      topLevelState,
      statusLabel,
      onlineAt: new Date().toISOString(),
      posX: position.x,
      posY: position.y,
    };
  });

  const syncPresence = useEffectEvent((state: Record<string, OfficePresencePayload[]>) => {
    setMembers(listOfficePresenceMembers(state, profile.id));
  });

  useEffect(() => {
    let cancelled = false;
    const channel = supabase.channel(topic, {
      config: {
        private: true,
        presence: {
          key: profile.id,
        },
      },
    });

    channelRef.current = channel;

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
                "브라우저 세션 토큰을 찾지 못했습니다. 다시 로그인한 뒤 시도해 주세요.",
            );
          }
          return;
        }

        await supabase.realtime.setAuth(session.access_token);

        if (cancelled) {
          return;
        }

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
              setPresenceReady(true);
              setErrorDetail(null);
              await channel.track(buildPresencePayload());
              handleSync();
              return;
            }

            if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
              setMembers([]);
              setPresenceReady(false);
              setConnectionState("error");
              setErrorDetail(
                error?.message ??
                  "Realtime authorization 정책 또는 채널 설정을 다시 확인해주세요.",
              );
              return;
            }

            if (status === "CLOSED") {
              setMembers([]);
              setPresenceReady(false);
              setConnectionState("connecting");
              setErrorDetail(null);
            }
          });
      } catch {
        if (!cancelled) {
          setMembers([]);
          setPresenceReady(false);
          setConnectionState("error");
          setErrorDetail("실시간 채널 연결 중 알 수 없는 오류가 발생했습니다.");
        }
      }
    })();

    return () => {
      cancelled = true;
      setPresenceReady(false);
      channelRef.current = null;
      void supabase.removeChannel(channel);
    };
  }, [profile.id, profile.nickname, supabase, topic]);

  useEffect(() => {
    if (!presenceReady || connectionState !== "live" || !channelRef.current) {
      return;
    }

    void channelRef.current.track(buildPresencePayload());
  }, [
    connectionState,
    currentRoomId,
    position.x,
    position.y,
    presenceReady,
    statusLabel,
    topLevelState,
  ]);

  const roomCounts = useMemo(
    () => countOfficePresenceByRoom(roomOptions.map((room) => room.id), members),
    [members, roomOptions],
  );

  return {
    members,
    roomCounts,
    connectionState,
    errorDetail,
  };
}
