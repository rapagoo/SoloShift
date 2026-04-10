import { buildOfficeExperience, createFallbackOfficeActivity } from "@/lib/domain/office";
import { OFFICE_SLUG } from "@/lib/office/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { OfficeActivityEvent, Profile } from "@/lib/types";

import { getTodayDashboard } from "@/lib/data/dashboard";

const OFFICE_ACTIVITY_LIMIT = 12;

export async function getOfficeExperience(params: {
  userId: string;
  profile: Profile;
  room?: string | null;
  talk?: string | null;
}) {
  const dashboard = await getTodayDashboard(params.userId, params.profile);
  const officeActivity = await getRecentOfficeActivity(params.profile.nickname, dashboard);

  return buildOfficeExperience({
    dashboard,
    officeActivity,
    nickname: params.profile.nickname,
    requestedRoomId: params.room,
    requestedNpcId: params.talk,
  });
}

async function getRecentOfficeActivity(nickname: string, dashboard: Awaited<ReturnType<typeof getTodayDashboard>>) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("office_activity_events")
    .select("*")
    .eq("office_slug", OFFICE_SLUG)
    .order("created_at", { ascending: false })
    .limit(OFFICE_ACTIVITY_LIMIT);

  if (error) {
    return createFallbackOfficeActivity({
      dashboard,
      nickname,
    });
  }

  return ((data as OfficeActivityEvent[] | null) ?? []).slice(0, OFFICE_ACTIVITY_LIMIT);
}
