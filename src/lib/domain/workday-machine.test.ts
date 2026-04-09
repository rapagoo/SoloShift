import {
  computeFocusMinutes,
  computeStatusWorkMinutes,
  ensureCanChangeStatus,
  ensureCanCheckIn,
  ensureCanCheckOut,
  ensureCanStartFocusSession,
  getTopLevelState,
} from "@/lib/domain/workday-machine";
import { FocusSession, StatusLog, Workday } from "@/lib/types";

describe("workday machine", () => {
  const openWorkday: Workday = {
    id: "workday-1",
    user_id: "user-1",
    local_date: "2026-04-09",
    check_in_at: "2026-04-09T01:00:00.000Z",
    check_out_at: null,
    today_goal: "ship MVP",
    today_first_task: "build layout",
    tomorrow_first_task: null,
    daily_review: null,
    goal_completed: false,
    total_work_minutes: 0,
    total_focus_minutes: 0,
    total_points: 0,
  };

  it("blocks duplicate check-ins and checkout before check-in", () => {
    expect(() => ensureCanCheckIn(openWorkday)).toThrow("이미 출근 기록");
    expect(() => ensureCanCheckOut(null)).toThrow("출근 기록");
  });

  it("requires an active productive status before a focus session starts", () => {
    expect(() =>
      ensureCanStartFocusSession({
        workday: openWorkday,
        activeStatus: null,
        activeSession: null,
      }),
    ).toThrow("현재 작업 상태");

    expect(() =>
      ensureCanStartFocusSession({
        workday: openWorkday,
        activeStatus: {
          id: "status-1",
          workday_id: openWorkday.id,
          status_type: "break",
          start_at: "2026-04-09T01:00:00.000Z",
          end_at: null,
          memo: null,
        },
        activeSession: null,
      }),
    ).toThrow("휴식/식사/자리 비움");
  });

  it("computes work and focus minutes from logs", () => {
    const statusLogs: StatusLog[] = [
      {
        id: "status-1",
        workday_id: openWorkday.id,
        status_type: "study_algorithm",
        start_at: "2026-04-09T01:00:00.000Z",
        end_at: "2026-04-09T01:30:00.000Z",
        memo: null,
      },
      {
        id: "status-2",
        workday_id: openWorkday.id,
        status_type: "break",
        start_at: "2026-04-09T01:30:00.000Z",
        end_at: "2026-04-09T01:40:00.000Z",
        memo: null,
      },
      {
        id: "status-3",
        workday_id: openWorkday.id,
        status_type: "portfolio",
        start_at: "2026-04-09T01:40:00.000Z",
        end_at: "2026-04-09T02:10:00.000Z",
        memo: null,
      },
    ];

    const focusSessions: FocusSession[] = [
      {
        id: "focus-1",
        workday_id: openWorkday.id,
        status_log_id: "status-1",
        start_at: "2026-04-09T01:00:00.000Z",
        end_at: "2026-04-09T01:25:00.000Z",
        duration_minutes: 25,
        memo: null,
        is_completed: true,
      },
      {
        id: "focus-2",
        workday_id: openWorkday.id,
        status_log_id: "status-3",
        start_at: "2026-04-09T01:40:00.000Z",
        end_at: "2026-04-09T02:05:00.000Z",
        duration_minutes: 25,
        memo: null,
        is_completed: true,
      },
    ];

    expect(computeStatusWorkMinutes(statusLogs)).toBe(60);
    expect(computeFocusMinutes(focusSessions)).toBe(50);
  });

  it("derives the top-level state from workday and active status", () => {
    expect(getTopLevelState(null, null)).toBe("before_check_in");
    expect(
      getTopLevelState(openWorkday, {
        id: "status-1",
        workday_id: openWorkday.id,
        status_type: "meal",
        start_at: "2026-04-09T01:00:00.000Z",
        end_at: null,
        memo: null,
      }),
    ).toBe("resting");
    expect(getTopLevelState({ ...openWorkday, check_out_at: "2026-04-09T09:00:00.000Z" }, null)).toBe(
      "checked_out",
    );
  });

  it("blocks status changes before check-in", () => {
    expect(() => ensureCanChangeStatus(null)).toThrow("출근 후");
  });
});
