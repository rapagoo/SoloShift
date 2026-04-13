import { getStatusLabel } from "@/lib/constants";
import { resolveOfficeRoomForActivity } from "@/lib/domain/office";
import { OFFICE_SLUG } from "@/lib/office/config";
import { ActivityEventType, StatusType } from "@/lib/types";

export interface OfficeActivityBuildParams {
  workdayId: string;
  userId: string;
  actorNickname: string;
  eventType: ActivityEventType;
  title: string;
  meta?: Record<string, unknown>;
  statusType?: StatusType | null;
}

export interface OfficeActivityInsertPayload {
  office_slug: string;
  user_id: string;
  actor_nickname: string;
  room_id: "lobby" | "focus-room" | "lounge";
  workday_id: string;
  event_type: ActivityEventType;
  title: string;
  description: string | null;
  meta: Record<string, unknown>;
}

export function buildOfficeActivityInsertPayload({
  workdayId,
  userId,
  actorNickname,
  eventType,
  title,
  meta = {},
  statusType = null,
}: OfficeActivityBuildParams): OfficeActivityInsertPayload {
  return {
    office_slug: OFFICE_SLUG,
    user_id: userId,
    actor_nickname: actorNickname,
    room_id: resolveOfficeRoomForActivity({
      eventType,
      statusType,
    }),
    workday_id: workdayId,
    event_type: eventType,
    title,
    description: buildOfficeActivityDescription({
      eventType,
      statusType,
      meta,
    }),
    meta: buildOfficeActivityMeta({
      eventType,
      statusType,
      meta,
    }),
  };
}

function buildOfficeActivityDescription(params: {
  eventType: ActivityEventType;
  statusType?: StatusType | null;
  meta: Record<string, unknown>;
}) {
  switch (params.eventType) {
    case "check_in":
      return "오늘 업무를 시작했습니다.";
    case "status_changed":
      return params.statusType
        ? `${getStatusLabel(params.statusType)} 상태로 전환했습니다.`
        : "현재 상태를 전환했습니다.";
    case "focus_session_started":
      return "집중 세션을 시작했습니다.";
    case "focus_session_completed":
      return "집중 세션을 완료했습니다.";
    case "focus_session_interrupted":
      return "집중 세션을 중단했습니다.";
    case "check_out":
      return toBoolean(params.meta.goalCompleted)
        ? "오늘 회고를 저장하고 목표 달성으로 퇴근했습니다."
        : "오늘 회고를 저장하고 퇴근했습니다.";
    case "task_created":
      return "새 작업을 등록했습니다.";
    case "task_started":
      return "작업 하나를 진행 중으로 전환했습니다.";
    case "task_completed":
      return "작업 하나를 완료했습니다.";
    case "task_reopened":
      return "작업 하나를 다시 열었습니다.";
  }
}

function buildOfficeActivityMeta(params: {
  eventType: ActivityEventType;
  statusType?: StatusType | null;
  meta: Record<string, unknown>;
}) {
  switch (params.eventType) {
    case "check_in":
      return pickNumericMeta(params.meta, ["lateMinutes"]);
    case "status_changed":
      return params.statusType ? { statusType: params.statusType } : {};
    case "focus_session_started":
      return pickNumericMeta(params.meta, ["durationMinutes"]);
    case "focus_session_completed":
    case "focus_session_interrupted":
      return {
        ...pickNumericMeta(params.meta, ["durationMinutes"]),
        ...pickBooleanMeta(params.meta, ["isCompleted"]),
      };
    case "check_out":
      return pickBooleanMeta(params.meta, ["goalCompleted"]);
    default:
      return {};
  }
}

function pickNumericMeta(
  meta: Record<string, unknown>,
  keys: string[],
): Record<string, number> {
  return keys.reduce<Record<string, number>>((result, key) => {
    const value = meta[key];

    if (typeof value === "number" && Number.isFinite(value)) {
      result[key] = value;
    }

    return result;
  }, {});
}

function pickBooleanMeta(
  meta: Record<string, unknown>,
  keys: string[],
): Record<string, boolean> {
  return keys.reduce<Record<string, boolean>>((result, key) => {
    const value = meta[key];

    if (typeof value === "boolean") {
      result[key] = value;
    }

    return result;
  }, {});
}

function toBoolean(value: unknown) {
  return value === true;
}
