export type StatusType =
  | "study_algorithm"
  | "portfolio"
  | "resume"
  | "break"
  | "meal"
  | "away";

export type TopLevelState =
  | "before_check_in"
  | "working"
  | "resting"
  | "away"
  | "checked_out";

export type PointEventType =
  | "check_in_on_time"
  | "check_in_minor_late"
  | "check_in_late"
  | "focus_session_complete"
  | "goal_completed"
  | "daily_review_submitted"
  | "five_day_streak_bonus";

export interface Profile {
  id: string;
  nickname: string;
  timezone: string;
  default_check_in_time: string;
  created_at: string;
}

export interface Workday {
  id: string;
  user_id: string;
  local_date: string;
  check_in_at: string | null;
  check_out_at: string | null;
  today_goal: string;
  today_first_task: string;
  tomorrow_first_task: string | null;
  daily_review: string | null;
  goal_completed: boolean;
  total_work_minutes: number;
  total_focus_minutes: number;
  total_points: number;
  created_at?: string;
}

export interface StatusLog {
  id: string;
  workday_id: string;
  status_type: StatusType;
  start_at: string;
  end_at: string | null;
  memo: string | null;
}

export interface FocusSession {
  id: string;
  workday_id: string;
  status_log_id: string;
  start_at: string;
  end_at: string | null;
  duration_minutes: number;
  memo: string | null;
  is_completed: boolean;
}

export interface PointEvent {
  id: string;
  workday_id: string;
  event_type: PointEventType;
  points: number;
  meta: Record<string, unknown>;
  created_at: string;
}

export interface WeeklySummary {
  range_label: string;
  days_checked_in: number;
  average_check_in: string | null;
  average_check_out: string | null;
  total_work_minutes: number;
  total_focus_minutes: number;
  total_points: number;
  streak_days: number;
}

export interface DashboardData {
  workday: Workday | null;
  active_status: StatusLog | null;
  active_focus_session: FocusSession | null;
  status_logs: StatusLog[];
  focus_sessions: FocusSession[];
  point_events: PointEvent[];
  top_level_state: TopLevelState;
  work_minutes_live: number;
  focus_minutes_live: number;
  streak_days: number;
  late_minutes: number | null;
  character_message: string;
}

export interface HistoryEntry {
  workday: Workday;
  status_logs: StatusLog[];
  focus_sessions: FocusSession[];
  point_events: PointEvent[];
}

export interface ActionState {
  ok: boolean;
  message?: string;
  error?: string;
}
