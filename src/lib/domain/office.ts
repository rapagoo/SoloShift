import { getStatusLabel } from "@/lib/constants";
import {
  OFFICE_NAME,
  OFFICE_NPCS,
  OFFICE_ROOMS,
  OFFICE_SLUG,
  OFFICE_TAGLINE,
} from "@/lib/office/config";
import {
  OfficeConversation,
  OfficeExperience,
  OfficeNpcConfig,
  OfficeNpcId,
  OfficeNpcSummary,
  OfficeRoomConfig,
  OfficeRoomId,
  OfficeRoomSummary,
} from "@/lib/office/types";
import { DashboardData, OfficeActivityEvent, StatusType } from "@/lib/types";
import { formatMinutes } from "@/lib/time";

const OFFICE_ROOM_IDS = new Set<OfficeRoomId>(OFFICE_ROOMS.map((room) => room.id));

export function buildOfficeExperience(params: {
  dashboard: DashboardData;
  officeActivity: OfficeActivityEvent[];
  nickname: string;
  requestedRoomId?: string | null;
  requestedNpcId?: string | null;
}): OfficeExperience {
  const currentRoomId = resolveCurrentOfficeRoomId(params.dashboard, params.requestedRoomId);
  const rooms = buildRoomSummaries(params.dashboard, currentRoomId);
  const currentRoom = rooms.find((room) => room.id === currentRoomId) ?? rooms[0];
  const npcsInRoomConfig = OFFICE_NPCS.filter((npc) => npc.homeRoomId === currentRoom.id);
  const selectedNpcId = normalizeNpcId(params.requestedNpcId, npcsInRoomConfig);

  return {
    officeName: OFFICE_NAME,
    officeTagline: OFFICE_TAGLINE,
    currentRoom,
    rooms,
    npcDirectory: OFFICE_NPCS.map((npc) => buildNpcSummary(npc, params.dashboard)),
    npcsInRoom: npcsInRoomConfig.map((npc) => buildNpcSummary(npc, params.dashboard)),
    selectedConversation: selectedNpcId
      ? buildNpcConversation({
          npcId: selectedNpcId,
          nickname: params.nickname,
          dashboard: params.dashboard,
        })
      : null,
    selectedNpcId,
    officePulse: buildOfficePulse(params.dashboard, params.officeActivity),
    dashboard: params.dashboard,
  };
}

export function resolveCurrentOfficeRoomId(
  dashboard: DashboardData,
  requestedRoomId?: string | null,
): OfficeRoomId {
  if (requestedRoomId && isOfficeRoomId(requestedRoomId)) {
    return requestedRoomId;
  }

  if (!dashboard.workday) {
    return "lobby";
  }

  if (dashboard.workday.check_out_at) {
    return "lounge";
  }

  if (dashboard.active_focus_session) {
    return "focus-room";
  }

  if (dashboard.active_status?.status_type === "break" || dashboard.active_status?.status_type === "meal") {
    return "lounge";
  }

  return "lobby";
}

function buildRoomSummaries(dashboard: DashboardData, currentRoomId: OfficeRoomId): OfficeRoomSummary[] {
  return OFFICE_ROOMS.map((room) => {
    const baseCount = OFFICE_NPCS.filter((npc) => npc.homeRoomId === room.id).length;
    const isCurrent = room.id === currentRoomId;
    const occupantCount = baseCount + (isCurrent ? 1 : 0);

    return {
      ...room,
      isCurrent,
      occupancyLabel: `${occupantCount}명 감지`,
      hint: getRoomHint(room, dashboard),
    };
  });
}

export function resolveOfficeRoomForActivity(params: {
  eventType: OfficeActivityEvent["event_type"];
  statusType?: StatusType | null;
}): OfficeRoomId {
  if (params.eventType === "check_out") {
    return "lounge";
  }

  if (
    params.eventType === "focus_session_started" ||
    params.eventType === "focus_session_completed" ||
    params.eventType === "focus_session_interrupted"
  ) {
    return "focus-room";
  }

  if (
    params.eventType === "status_changed" &&
    (params.statusType === "break" || params.statusType === "meal")
  ) {
    return "lounge";
  }

  return "lobby";
}

function buildNpcSummary(npc: OfficeNpcConfig, dashboard: DashboardData): OfficeNpcSummary {
  switch (npc.id) {
    case "mina": {
      if (!dashboard.workday) {
        return {
          ...npc,
          moodLabel: "출근 대기",
          reactionSummary: "출근 버튼을 누르면 오늘 오피스가 정식으로 열립니다.",
          actionLabel: "로비에서 짧게 브리핑 받기",
        };
      }

      if (dashboard.workday.check_out_at) {
        return {
          ...npc,
          moodLabel: "마감 확인",
          reactionSummary: "오늘 로그가 깔끔하게 닫혔는지 확인하고 있습니다.",
          actionLabel: "퇴근 피드백 듣기",
        };
      }

      const completedTasks = dashboard.tasks.filter((task) => task.status === "done").length;
      return {
        ...npc,
        moodLabel: completedTasks > 0 ? "진행 점검" : "상태 정리",
        reactionSummary:
          completedTasks > 0
            ? `완료된 작업 ${completedTasks}개를 기준으로 오늘 흐름을 보고 있습니다.`
            : "현재 상태를 잡고 첫 세션으로 들어갈 타이밍을 보고 있습니다.",
        actionLabel: "오늘 흐름 공유하기",
      };
    }
    case "jiho": {
      if (dashboard.active_focus_session) {
        return {
          ...npc,
          moodLabel: "집중 모드",
          reactionSummary: `${dashboard.active_focus_session.duration_minutes}분 세션이 열려 있습니다.`,
          actionLabel: "세션 텐션 맞추기",
        };
      }

      if (dashboard.active_status && !dashboard.workday?.check_out_at) {
        return {
          ...npc,
          moodLabel: "세션 제안",
          reactionSummary: `${getStatusLabel(dashboard.active_status.status_type)} 흐름이면 바로 집중 세션으로 이어가기 좋습니다.`,
          actionLabel: "집중 세션 이야기하기",
        };
      }

      return {
        ...npc,
        moodLabel: "준비 중",
        reactionSummary: "포커스 룸은 상태가 정해지고 나면 훨씬 빛을 발합니다.",
        actionLabel: "집중 루틴 이야기하기",
      };
    }
    default: {
      if (dashboard.workday?.check_out_at) {
        return {
          ...npc,
          moodLabel: "회고 정리",
          reactionSummary: "오늘 회고와 내일 첫 작업의 톤을 정리하고 있습니다.",
          actionLabel: "퇴근 후 한마디 듣기",
        };
      }

      if (dashboard.active_status?.status_type === "break" || dashboard.active_status?.status_type === "meal") {
        return {
          ...npc,
          moodLabel: "호흡 조절",
          reactionSummary: "잠깐 쉬어도 리듬이 끊기지 않도록 템포를 보고 있습니다.",
          actionLabel: "라운지 대화 시작",
        };
      }

      return {
        ...npc,
        moodLabel: "문장 다듬기",
        reactionSummary: "포트폴리오나 회고 문장을 조금 더 선명하게 만드는 데 관심이 많습니다.",
        actionLabel: "표현 조언 듣기",
      };
    }
  }
}

function buildNpcConversation(params: {
  npcId: OfficeNpcId;
  nickname: string;
  dashboard: DashboardData;
}): OfficeConversation {
  const npc = OFFICE_NPCS.find((candidate) => candidate.id === params.npcId) ?? OFFICE_NPCS[0];
  const statusLabel = params.dashboard.active_status
    ? getStatusLabel(params.dashboard.active_status.status_type)
    : "상태 미설정";
  const completedTasks = params.dashboard.tasks.filter((task) => task.status === "done").length;

  switch (params.npcId) {
    case "mina":
      if (!params.dashboard.workday) {
        return {
          npcId: npc.id,
          title: "출근 브리핑",
          subtitle: "로비에서 하루 시작을 열어주는 짧은 대화",
          messages: [
            { speaker: "user", body: `미나님, 오늘은 ${params.nickname}으로 출근 준비만 해둔 상태예요.` },
            { speaker: "npc", body: "좋아요. 출근 버튼만 눌러도 오늘 흐름이 분명해집니다. 목표와 첫 작업을 먼저 적어두죠." },
            { speaker: "npc", body: "로비는 시작 신호를 명확하게 주는 곳이에요. 그 다음 방은 자연스럽게 따라옵니다." },
          ],
        };
      }

      if (params.dashboard.workday.check_out_at) {
        return {
          npcId: npc.id,
          title: "마감 확인",
          subtitle: "퇴근 후 로비에서 받는 오늘 정리",
          messages: [
            { speaker: "user", body: "오늘 근무를 마무리했습니다. 로비로 다시 내려왔어요." },
            { speaker: "npc", body: `좋아요. 오늘 완료된 작업은 ${completedTasks}개, 포인트는 ${params.dashboard.workday.total_points}P로 정리됐네요.` },
            { speaker: "npc", body: "이 정도면 내일 첫 작업만 바로 열 수 있게 충분히 정돈된 퇴근입니다." },
          ],
        };
      }

      return {
        npcId: npc.id,
        title: "진행 체크인",
        subtitle: "현재 업무 흐름을 정리하는 짧은 로비 대화",
        messages: [
          { speaker: "user", body: `지금은 ${statusLabel} 흐름으로 움직이고 있어요.` },
          { speaker: "npc", body: completedTasks > 0 ? `좋네요. 이미 ${completedTasks}개 작업을 닫았으니 오늘 리듬이 살아 있습니다.` : "좋아요. 아직 완료 작업이 없어도 템포만 잡히면 금방 올라옵니다." },
          { speaker: "npc", body: "상태를 분명하게 적어둔 덕분에 다음 세션이나 방 이동이 훨씬 자연스러워질 거예요." },
        ],
      };
    case "jiho":
      return {
        npcId: npc.id,
        title: "포커스 룸 대화",
        subtitle: "집중 세션 직전과 직후에 텐션을 맞추는 대화",
        messages: [
          { speaker: "user", body: params.dashboard.active_focus_session ? "지금 세션이 열려 있어요. 끝까지 밀고 가고 싶습니다." : `현재 상태는 ${statusLabel}입니다. 세션으로 들어가도 될까요?` },
          { speaker: "npc", body: params.dashboard.active_focus_session ? `좋아요. 이미 ${params.dashboard.active_focus_session.duration_minutes}분 세션이 걸려 있으니 지금은 리듬을 끊지 않는 게 우선입니다.` : "좋아요. 포커스 룸은 상태가 분명할수록 더 강해집니다. 25분 하나부터 정확히 끊어보죠." },
          { speaker: "npc", body: "이 방에서는 길게 고민하지 말고 한 세션 단위로만 생각해도 충분합니다." },
        ],
      };
    default:
      return {
        npcId: npc.id,
        title: "라운지 대화",
        subtitle: "호흡을 고르며 오늘 문장을 정리하는 대화",
        messages: [
          { speaker: "user", body: params.dashboard.workday?.check_out_at ? "오늘 일은 마쳤고, 이제 문장만 정리하고 싶어요." : "잠깐 리듬을 정리하면서 다음 움직임을 생각하고 싶어요." },
          { speaker: "npc", body: params.dashboard.workday?.check_out_at ? "좋아요. 퇴근 뒤 라운지에서는 오늘을 평가하기보다 내일의 진입 장벽을 낮추는 게 핵심이에요." : "좋아요. 쉬는 순간에도 흐름이 끊기지 않게, 다음 한 줄만 미리 정해두면 충분합니다." },
          { speaker: "npc", body: completedTasks > 0 ? `오늘 완료 작업 ${completedTasks}개가 이미 분위기를 만들고 있어요. 그걸 회고 문장으로 이어가봅시다.` : "아직 완료 작업이 없어도 괜찮아요. 지금 숨 고른 뒤에 다시 올라가면 됩니다." },
        ],
      };
  }
}

function buildOfficePulse(dashboard: DashboardData, officeActivity: OfficeActivityEvent[]) {
  const completedTasks = dashboard.tasks.filter((task) => task.status === "done").length;
  const totalTasks = dashboard.tasks.length;
  const latestActivity = officeActivity[0];

  const headline = !dashboard.workday
    ? "오피스는 대기 중입니다."
    : dashboard.workday.check_out_at
      ? "오늘 근무는 마감 단계까지 정리되었습니다."
      : dashboard.active_focus_session
        ? "포커스 룸 기준으로 하루 텐션이 유지되고 있습니다."
        : completedTasks > 0
          ? `완료 작업 ${completedTasks}개로 흐름이 쌓이고 있습니다.`
          : "아직 큰 이벤트는 적지만 오피스 리듬은 열려 있습니다.";

  const detail = latestActivity
    ? `${latestActivity.actor_nickname} · ${latestActivity.description ?? latestActivity.title}`
    : !dashboard.workday
      ? "출근을 시작하면 로비와 활동 피드가 바로 살아납니다."
      : "최근 활동이 이 공간의 분위기를 계속 바꾸고 있습니다.";

  return {
    headline,
    detail,
    stats: [
      { label: "완료 작업", value: totalTasks > 0 ? `${completedTasks}/${totalTasks}` : "0/0" },
      { label: "집중 시간", value: formatMinutes(dashboard.focus_minutes_live) },
      { label: "포인트", value: `${dashboard.workday?.total_points ?? 0}P` },
    ],
    recentActivity: officeActivity.slice(0, 4),
  };
}

export function createFallbackOfficeActivity(params: {
  dashboard: DashboardData;
  nickname: string;
}): OfficeActivityEvent[] {
  return params.dashboard.activity_feed.map((entry) => ({
    id: `fallback-${entry.id}`,
    office_slug: OFFICE_SLUG,
    user_id: params.dashboard.workday?.user_id ?? "unknown-user",
    actor_nickname: params.nickname,
    room_id: resolveOfficeRoomForActivity({
      eventType: entry.event_type,
      statusType: normalizeStatusType(entry.meta?.statusType),
    }),
    workday_id: entry.workday_id,
    event_type: entry.event_type,
    title: entry.title,
    description: entry.description,
    meta: entry.meta,
    created_at: entry.created_at,
  }));
}

function getRoomHint(room: OfficeRoomConfig, dashboard: DashboardData) {
  if (!dashboard.workday) {
    return room.id === "lobby"
      ? "출근을 열면 이 방이 가장 먼저 반응합니다."
      : "오늘 흐름이 시작되면 이 방도 같이 켜집니다.";
  }

  if (room.id === "focus-room" && dashboard.active_focus_session) {
    return "지금 진행 중인 세션이 이 방의 중심 이벤트입니다.";
  }

  if (room.id === "lounge" && dashboard.workday.check_out_at) {
    return "퇴근 후에는 라운지 톤이 가장 자연스럽습니다.";
  }

  if (room.id === "lobby" && dashboard.active_status) {
    return `${getStatusLabel(dashboard.active_status.status_type)} 흐름이 로비 알림판에 반영됩니다.`;
  }

  return room.atmosphere;
}

function normalizeNpcId(requestedNpcId: string | null | undefined, npcsInRoom: OfficeNpcConfig[]) {
  if (!requestedNpcId) {
    return null;
  }

  const roomNpcIds = new Set<OfficeNpcId>(npcsInRoom.map((npc) => npc.id));
  return roomNpcIds.has(requestedNpcId as OfficeNpcId) ? (requestedNpcId as OfficeNpcId) : null;
}

function isOfficeRoomId(value: string): value is OfficeRoomId {
  return OFFICE_ROOM_IDS.has(value as OfficeRoomId);
}

function normalizeStatusType(value: unknown): StatusType | null {
  if (
    value === "study_algorithm" ||
    value === "portfolio" ||
    value === "resume" ||
    value === "break" ||
    value === "meal" ||
    value === "away"
  ) {
    return value;
  }

  return null;
}
