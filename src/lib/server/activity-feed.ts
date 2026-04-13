import { buildOfficeActivityInsertPayload } from "@/lib/domain/office-activity";
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

async function recordOfficeActivityEvent(params: RecordActivityEventParams) {
  const admin = createSupabaseAdminClient();
  const payload = buildOfficeActivityInsertPayload(params);
  const { data, error } = await admin
    .from("office_activity_events")
    .insert(payload)
    .select("id")
    .single();

  if (error || !data) {
    throw new Error(error?.message || "오피스 이벤트 저장에 실패했습니다.");
  }
}
