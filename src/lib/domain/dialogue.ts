import { PointEventType } from "@/lib/types";

export function getCharacterDialogue(params: {
  event:
    | "idle"
    | "check_in"
    | "focus_complete"
    | "check_out_goal"
    | "check_out_plain";
  lateMinutes?: number | null;
}) {
  switch (params.event) {
    case "check_in":
      if ((params.lateMinutes ?? 0) <= 0) {
        return "좋아요. 오늘도 근무 흐름을 깔끔하게 시작해봅시다.";
      }

      if ((params.lateMinutes ?? 0) <= 10) {
        return "조금 늦었지만 괜찮아요. 첫 세션부터 템포를 올려봅시다.";
      }

      return "오늘은 출발이 늦었네요. 지금부터 흐름만 회복해도 충분합니다.";
    case "focus_complete":
      return "세션 하나를 제대로 끝냈네요. 이런 누적이 하루를 만듭니다.";
    case "check_out_goal":
      return "오늘 목표까지 마무리했습니다. 이 정도면 아주 좋은 퇴근이에요.";
    case "check_out_plain":
      return "오늘 기록은 여기까지 저장했습니다. 내일 첫 작업만 가볍게 이어가면 됩니다.";
    default:
      return "출근, 상태 변경, 집중 세션으로 오늘의 흐름을 세워보세요.";
  }
}

export function getPointEventLabel(type: PointEventType) {
  switch (type) {
    case "check_in_on_time":
      return "정시 출근";
    case "check_in_minor_late":
      return "10분 이내 지각 출근";
    case "check_in_late":
      return "지각 출근";
    case "focus_session_complete":
      return "집중 세션 완료";
    case "goal_completed":
      return "오늘 목표 달성";
    case "daily_review_submitted":
      return "퇴근 회고 작성";
    case "five_day_streak_bonus":
      return "5일 연속 퇴근";
  }
}
