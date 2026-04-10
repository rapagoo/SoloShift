import { buildOfficeExperience, resolveCurrentOfficeRoomId } from "@/lib/domain/office";
import { DashboardData, FocusSession, Workday } from "@/lib/types";

const workday: Workday = {
  id: "workday-1",
  user_id: "user-1",
  local_date: "2026-04-10",
  check_in_at: "2026-04-10T01:00:00.000Z",
  check_out_at: null,
  today_goal: "포트폴리오 섹션 정리",
  today_first_task: "자기소개 문장 다듬기",
  tomorrow_first_task: null,
  daily_review: null,
  goal_completed: false,
  total_work_minutes: 0,
  total_focus_minutes: 0,
  total_points: 10,
};

describe("office domain helpers", () => {
  it("defaults to the lobby before check-in", () => {
    expect(resolveCurrentOfficeRoomId(createDashboard())).toBe("lobby");
  });

  it("moves to the focus room while a focus session is active", () => {
    expect(
      resolveCurrentOfficeRoomId(
        createDashboard({
          workday,
          active_focus_session: createFocusSession(),
        }),
      ),
    ).toBe("focus-room");
  });

  it("moves to the lounge after checkout", () => {
    expect(
      resolveCurrentOfficeRoomId(
        createDashboard({
          workday: { ...workday, check_out_at: "2026-04-10T10:00:00.000Z" },
        }),
      ),
    ).toBe("lounge");
  });

  it("only opens a conversation for an npc inside the selected room", () => {
    const experience = buildOfficeExperience({
      dashboard: createDashboard({
        workday,
        active_status: {
          id: "status-1",
          workday_id: workday.id,
          status_type: "portfolio",
          start_at: "2026-04-10T01:10:00.000Z",
          end_at: null,
          memo: null,
        },
      }),
      officeActivity: [],
      nickname: "서진",
      requestedRoomId: "focus-room",
      requestedNpcId: "mina",
    });

    expect(experience.currentRoom.id).toBe("focus-room");
    expect(experience.selectedConversation).toBeNull();
  });

  it("builds a focus-oriented conversation for jiho inside the focus room", () => {
    const experience = buildOfficeExperience({
      dashboard: createDashboard({
        workday,
        active_status: {
          id: "status-1",
          workday_id: workday.id,
          status_type: "study_algorithm",
          start_at: "2026-04-10T01:10:00.000Z",
          end_at: null,
          memo: null,
        },
        active_focus_session: createFocusSession(),
      }),
      officeActivity: [],
      nickname: "서진",
      requestedRoomId: "focus-room",
      requestedNpcId: "jiho",
    });

    expect(experience.selectedConversation?.npcId).toBe("jiho");
    expect(experience.selectedConversation?.title).toContain("포커스 룸");
    expect(experience.selectedConversation?.messages[1]?.body).toContain("25분");
  });

  it("prefers shared office activity for the pulse feed", () => {
    const experience = buildOfficeExperience({
      dashboard: createDashboard({
        workday,
        activity_feed: [
          {
            id: "personal-1",
            workday_id: workday.id,
            event_type: "task_created",
            title: "개인 피드 항목",
            description: "대시보드 전용 활동입니다.",
            meta: {},
            created_at: "2026-04-10T03:10:00.000Z",
          },
        ],
      }),
      officeActivity: [
        {
          id: "office-1",
          office_slug: "soloshift-commons",
          user_id: "user-2",
          actor_nickname: "민지",
          room_id: "focus-room",
          workday_id: "workday-2",
          event_type: "focus_session_started",
          title: "집중 세션 시작",
          description: "25분 세션을 열었습니다.",
          meta: {},
          created_at: "2026-04-10T03:15:00.000Z",
        },
      ],
      nickname: "서진",
    });

    expect(experience.officePulse.recentActivity[0]?.id).toBe("office-1");
    expect(experience.officePulse.detail).toContain("민지");
  });
});

function createDashboard(overrides: Partial<DashboardData> = {}): DashboardData {
  return {
    workday: null,
    active_status: null,
    active_focus_session: null,
    status_logs: [],
    focus_sessions: [],
    point_events: [],
    tasks: [],
    activity_feed: [],
    top_level_state: "before_check_in",
    work_minutes_live: 0,
    focus_minutes_live: 0,
    streak_days: 0,
    late_minutes: null,
    character_message: "오늘 흐름을 시작해볼까요?",
    ...overrides,
  };
}

function createFocusSession(): FocusSession {
  return {
    id: "focus-1",
    workday_id: workday.id,
    status_log_id: "status-1",
    start_at: "2026-04-10T01:15:00.000Z",
    end_at: null,
    duration_minutes: 25,
    memo: null,
    is_completed: false,
  };
}
