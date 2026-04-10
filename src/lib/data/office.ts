import { getTodayDashboard } from "@/lib/data/dashboard";
import { buildOfficeExperience } from "@/lib/domain/office";
import { Profile } from "@/lib/types";

export async function getOfficeExperience(params: {
  userId: string;
  profile: Profile;
  room?: string | null;
  talk?: string | null;
}) {
  const dashboard = await getTodayDashboard(params.userId, params.profile);

  return buildOfficeExperience({
    dashboard,
    nickname: params.profile.nickname,
    requestedRoomId: params.room,
    requestedNpcId: params.talk,
  });
}
