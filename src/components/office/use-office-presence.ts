"use client";

import type { RealtimeChannel } from "@supabase/supabase-js";
import { useCallback, useEffect, useEffectEvent, useMemo, useRef, useState } from "react";

import { countOfficePresenceByRoom, listOfficePresenceMembers } from "@/lib/office/presence";
import {
  OfficeAvatarPosition,
  OfficeChatBubble,
  OfficeChatMessage,
  OfficePresenceMember,
  OfficePresencePayload,
  OfficeRealtimeConnectionState,
  OfficeRoomId,
  OfficeRoomSummary,
} from "@/lib/office/types";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
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

interface OfficeChatPayload {
  id: string;
  userId: string;
  nickname: string;
  message: string;
  createdAt: string;
}

const CHAT_EVENT = "office-chat";
const MAX_CHAT_MESSAGES = 24;
const CHAT_BUBBLE_DURATION_MS = 10_000;
const PRESENCE_TRACK_INTERVAL_MS = 180;
const PRESENCE_TRACK_DISTANCE = 0.018;

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
  const bubbleTimeoutsRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const lastTrackedRef = useRef<{
    x: number;
    y: number;
    roomId: OfficeRoomId;
    statusLabel: string | null;
    topLevelState: TopLevelState;
    trackedAt: number;
  } | null>(null);
  const [members, setMembers] = useState<OfficePresenceMember[]>([]);
  const [chatMessages, setChatMessages] = useState<OfficeChatMessage[]>([]);
  const [chatBubbles, setChatBubbles] = useState<Record<string, OfficeChatBubble>>({});
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

  const appendChatMessage = useCallback((entry: OfficeChatMessage) => {
    setChatMessages((current) => {
      if (current.some((message) => message.id === entry.id)) {
        return current;
      }

      return [entry, ...current].slice(0, MAX_CHAT_MESSAGES);
    });
  }, []);

  const showChatBubble = useCallback((entry: OfficeChatMessage) => {
    setChatBubbles((current) => ({
      ...current,
      [entry.userId]: {
        id: entry.id,
        userId: entry.userId,
        nickname: entry.nickname,
        message: entry.message,
        self: entry.self,
      },
    }));

    const existing = bubbleTimeoutsRef.current[entry.userId];
    if (existing) {
      clearTimeout(existing);
    }

    bubbleTimeoutsRef.current[entry.userId] = setTimeout(() => {
      setChatBubbles((current) => {
        if (current[entry.userId]?.id !== entry.id) {
          return current;
        }

        const next = { ...current };
        delete next[entry.userId];
        return next;
      });

      delete bubbleTimeoutsRef.current[entry.userId];
    }, CHAT_BUBBLE_DURATION_MS);
  }, []);

  const handleIncomingChat = useCallback((payload: OfficeChatPayload) => {
    const normalized: OfficeChatMessage = {
      ...payload,
      self: payload.userId === profile.id,
    };

    appendChatMessage(normalized);
    showChatBubble(normalized);
  }, [appendChatMessage, profile.id, showChatBubble]);

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
                "브라우저 세션 토큰을 찾지 못했습니다. 다시 로그인한 뒤에 오피스를 열어주세요.",
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
          .on("broadcast", { event: CHAT_EVENT }, ({ payload }) => {
            if (!payload) {
              return;
            }

            handleIncomingChat(payload as OfficeChatPayload);
          })
          .subscribe(async (status, error) => {
            if (cancelled) {
              return;
            }

            if (status === "SUBSCRIBED") {
              setConnectionState("live");
              setPresenceReady(true);
              setErrorDetail(null);
              const payload = buildPresencePayload();
              lastTrackedRef.current = {
                x: payload.posX,
                y: payload.posY,
                roomId: payload.roomId,
                statusLabel: payload.statusLabel,
                topLevelState: payload.topLevelState,
                trackedAt: Date.now(),
              };
              await channel.track(payload);
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
          setErrorDetail("실시간 채널 연결 중 예상하지 못한 오류가 발생했습니다.");
        }
      }
    })();

    return () => {
      cancelled = true;
      setPresenceReady(false);
      channelRef.current = null;
      Object.values(bubbleTimeoutsRef.current).forEach((timeoutId) => clearTimeout(timeoutId));
      bubbleTimeoutsRef.current = {};
      void supabase.removeChannel(channel);
    };
  }, [handleIncomingChat, profile.id, profile.nickname, supabase, topic]);

  useEffect(() => {
    if (!presenceReady || connectionState !== "live" || !channelRef.current) {
      return;
    }

    const now = Date.now();
    const lastTracked = lastTrackedRef.current;
    const movedEnough =
      !lastTracked ||
      Math.hypot(position.x - lastTracked.x, position.y - lastTracked.y) >= PRESENCE_TRACK_DISTANCE;
    const statusChanged =
      !lastTracked ||
      lastTracked.roomId !== currentRoomId ||
      lastTracked.statusLabel !== statusLabel ||
      lastTracked.topLevelState !== topLevelState;
    const intervalElapsed = !lastTracked || now - lastTracked.trackedAt >= PRESENCE_TRACK_INTERVAL_MS;

    if (!statusChanged && !(movedEnough && intervalElapsed)) {
      return;
    }

    lastTrackedRef.current = {
      x: position.x,
      y: position.y,
      roomId: currentRoomId,
      statusLabel,
      topLevelState,
      trackedAt: now,
    };

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

  const sendChatMessage = useCallback(async (message: string) => {
    const trimmed = message.trim();
    if (!trimmed || !channelRef.current) {
      return;
    }

    const payload: OfficeChatPayload = {
      id: globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`,
      userId: profile.id,
      nickname: profile.nickname,
      message: trimmed,
      createdAt: new Date().toISOString(),
    };

    handleIncomingChat(payload);

    await channelRef.current.send({
      type: "broadcast",
      event: CHAT_EVENT,
      payload,
    });
  }, [handleIncomingChat, profile.id, profile.nickname]);

  const roomCounts = useMemo(
    () => countOfficePresenceByRoom(roomOptions.map((room) => room.id), members),
    [members, roomOptions],
  );

  return {
    members,
    roomCounts,
    connectionState,
    errorDetail,
    chatMessages,
    chatBubbles,
    sendChatMessage,
  };
}
