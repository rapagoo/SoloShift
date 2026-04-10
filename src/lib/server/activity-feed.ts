import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { ActivityEventType } from "@/lib/types";

interface RecordActivityEventParams {
  workdayId: string;
  eventType: ActivityEventType;
  title: string;
  description?: string | null;
  meta?: Record<string, unknown>;
}

export async function recordActivityEvent({
  workdayId,
  eventType,
  title,
  description = null,
  meta = {},
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
}
