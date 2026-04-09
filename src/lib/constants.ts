export const STATUS_OPTIONS = [
  { value: "study_algorithm", label: "알고리즘 공부", category: "work" },
  { value: "portfolio", label: "포트폴리오 개발", category: "work" },
  { value: "resume", label: "이력서/자소서", category: "work" },
  { value: "break", label: "휴식", category: "rest" },
  { value: "meal", label: "식사", category: "rest" },
  { value: "away", label: "자리 비움", category: "away" },
] as const;

export const PRODUCTIVE_STATUS_VALUES = STATUS_OPTIONS.filter(
  (option) => option.category === "work",
).map((option) => option.value);

export const REST_STATUS_VALUES = STATUS_OPTIONS.filter(
  (option) => option.category === "rest",
).map((option) => option.value);

export const DEFAULT_TIMEZONE = "Asia/Seoul";
export const DEFAULT_CHECK_IN_TIME = "10:00";
export const FOCUS_PRESETS = [25, 50] as const;
