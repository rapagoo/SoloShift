import { resolveOfficeRoomForActivity } from "@/lib/domain/office";
import { OFFICE_SLUG } from "@/lib/office/config";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { ActivityEventType, StatusType } from "@/lib/types";

interface RecordActivityEventParams {
  workdayId: string;
  userId: string;
  actorNickname: string;
  eventType: ActivityEventType;
  title: string;
  description?: string | null;
  meta?: Record<string, unknown>;
  statusType?: StatusType | null;
}

export async function recordActivityEvent({
  workdayId,
  userId,
  actorNickname,
  eventType,
  title,
  description = null,
  meta = {},
  statusType = null,
}: RecordActivityEventParams) {
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("activity_feed")
    .insert({
      workday_id: workdayId,
      event_type: eventType,
      title,
      description,
      meta,
    })
    .select("id")
    .single();

  if (error || !data) {
    throw new Error(error?.message || "활동 피드 저장에 실패했습니다.");
  }

  try {
    await recordOfficeActivityEvent({
      workdayId,
      userId,
      actorNickname,
      eventType,
      title,
      description,
      meta,
      statusType,
    });
  } catch (error) {
    console.error("office activity event insert failed", error);
  }
}

async function recordOfficeActivityEvent({
  workdayId,
  userId,
  actorNickname,
  eventType,
  title,
  description,
  meta,
  statusType,
}: RecordActivityEventParams) {
  const admin = createSupabaseAdminClient();
  const roomId = resolveOfficeRoomForActivity({
    eventType,
    statusType,
  });

  const { data, error } = await admin
    .from("office_activity_events")
    .insert({
      office_slug: OFFICE_SLUG,
      user_id: userId,
      actor_nickname: actorNickname,
      room_id: roomId,
      workday_id: workdayId,
      event_type: eventType,
      title,
      description,
      meta,
    })
    .select("id")
    .single();

  if (error || !data) {
    throw new Error(error?.message || "오피스 이벤트 저장에 실패했습니다.");
  }
}
