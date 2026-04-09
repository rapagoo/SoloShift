import { PRODUCTIVE_STATUS_VALUES, REST_STATUS_VALUES } from "@/lib/constants";
import { minutesBetween } from "@/lib/time";
import { FocusSession, StatusLog, StatusType, TopLevelState, Workday } from "@/lib/types";

const productiveStatusSet = new Set<string>(PRODUCTIVE_STATUS_VALUES);
const restStatusSet = new Set<string>(REST_STATUS_VALUES);

export function getTopLevelState(
  workday: Workday | null,
  activeStatus: StatusLog | null,
): TopLevelState {
  if (!workday?.check_in_at) {
    return "before_check_in";
  }

  if (workday.check_out_at) {
    return "checked_out";
  }

  if (!activeStatus) {
    return "working";
  }

  if (restStatusSet.has(activeStatus.status_type)) {
    return "resting";
  }

  if (activeStatus.status_type === "away") {
    return "away";
  }

  return "working";
}

export function ensureCanCheckIn(workday: Workday | null) {
  if (workday) {
    throw new Error("오늘은 이미 출근 기록이 있습니다.");
  }
}

export function ensureCanChangeStatus(workday: Workday | null) {
  if (!workday?.check_in_at) {
    throw new Error("출근 후에만 상태를 변경할 수 있습니다.");
  }

  if (workday.check_out_at) {
    throw new Error("퇴근한 날에는 상태를 변경할 수 없습니다.");
  }
}

export function ensureCanStartFocusSession(params: {
  workday: Workday | null;
  activeStatus: StatusLog | null;
  activeSession: FocusSession | null;
}) {
  ensureCanChangeStatus(params.workday);

  if (!params.activeStatus) {
    throw new Error("집중 세션 전에 현재 작업 상태를 먼저 선택해주세요.");
  }

  if (!productiveStatusSet.has(params.activeStatus.status_type)) {
    throw new Error("휴식/식사/자리 비움 상태에서는 집중 세션을 시작할 수 없습니다.");
  }

  if (params.activeSession) {
    throw new Error("이미 진행 중인 집중 세션이 있습니다.");
  }
}

export function ensureCanFinishFocusSession(activeSession: FocusSession | null) {
  if (!activeSession) {
    throw new Error("진행 중인 집중 세션이 없습니다.");
  }
}

export function ensureCanCheckOut(workday: Workday | null) {
  if (!workday?.check_in_at) {
    throw new Error("출근 기록이 있어야 퇴근할 수 있습니다.");
  }

  if (workday.check_out_at) {
    throw new Error("이미 퇴근을 완료했습니다.");
  }
}

export function computeStatusWorkMinutes(statusLogs: StatusLog[], now = new Date()) {
  return statusLogs.reduce((total, log) => {
    if (!productiveStatusSet.has(log.status_type)) {
      return total;
    }

    const endAt = log.end_at ?? now.toISOString();
    return total + minutesBetween(log.start_at, endAt);
  }, 0);
}

export function computeFocusMinutes(focusSessions: FocusSession[], now = new Date()) {
  return focusSessions.reduce((total, session) => {
    if (session.end_at) {
      return total + session.duration_minutes;
    }

    const liveDuration = minutesBetween(session.start_at, now);
    return total + Math.min(liveDuration, session.duration_minutes);
  }, 0);
}

export function closeCurrentStatus(
  activeStatus: StatusLog | null,
  now = new Date(),
): Partial<StatusLog> | null {
  if (!activeStatus) {
    return null;
  }

  return {
    end_at: now.toISOString(),
  };
}

export function finishCurrentSession(
  activeSession: FocusSession | null,
  now = new Date(),
  isCompleted = false,
  memo?: string,
) {
  if (!activeSession) {
    return null;
  }

  return {
    end_at: now.toISOString(),
    duration_minutes: minutesBetween(activeSession.start_at, now),
    is_completed: isCompleted,
    memo: memo ?? activeSession.memo,
  };
}

export function isProductiveStatus(status: StatusType) {
  return productiveStatusSet.has(status);
}
