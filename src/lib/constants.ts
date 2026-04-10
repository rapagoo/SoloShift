import type { StatusType, TaskStatus } from "@/lib/types";

export const STATUS_OPTIONS = [
  { value: "study_algorithm", label: "알고리즘 공부", category: "work" },
  { value: "portfolio", label: "포트폴리오 개발", category: "work" },
  { value: "resume", label: "이력서/자소서", category: "work" },
  { value: "break", label: "휴식", category: "rest" },
  { value: "meal", label: "식사", category: "rest" },
  { value: "away", label: "자리 비움", category: "away" },
] as const;

export const TASK_STATUS_OPTIONS = [
  { value: "todo", label: "대기 중" },
  { value: "doing", label: "진행 중" },
  { value: "done", label: "완료" },
] as const;

export const PRODUCTIVE_STATUS_VALUES = STATUS_OPTIONS.filter(
  (option) => option.category === "work",
).map((option) => option.value);

export const REST_STATUS_VALUES = STATUS_OPTIONS.filter(
  (option) => option.category === "rest",
).map((option) => option.value);

export const TIMEZONE_OPTIONS = [
  { value: "Asia/Seoul", label: "한국 (서울)" },
  { value: "Asia/Tokyo", label: "일본 (도쿄)" },
  { value: "Asia/Shanghai", label: "중국 (상하이)" },
  { value: "Asia/Singapore", label: "싱가포르" },
  { value: "Asia/Bangkok", label: "태국 (방콕)" },
  { value: "Asia/Kolkata", label: "인도 (콜카타)" },
  { value: "Asia/Dubai", label: "아랍에미리트 (두바이)" },
  { value: "Europe/London", label: "영국 (런던)" },
  { value: "Europe/Berlin", label: "독일 (베를린)" },
  { value: "America/New_York", label: "미국 동부 (뉴욕)" },
  { value: "America/Chicago", label: "미국 중부 (시카고)" },
  { value: "America/Denver", label: "미국 산악 (덴버)" },
  { value: "America/Los_Angeles", label: "미국 서부 (로스앤젤레스)" },
  { value: "America/Toronto", label: "캐나다 (토론토)" },
  { value: "Australia/Sydney", label: "호주 (시드니)" },
  { value: "Pacific/Auckland", label: "뉴질랜드 (오클랜드)" },
] as const;

export const STATUS_LABEL_MAP: Record<StatusType, string> = {
  study_algorithm: "알고리즘 공부",
  portfolio: "포트폴리오 개발",
  resume: "이력서/자소서",
  break: "휴식",
  meal: "식사",
  away: "자리 비움",
};

export const TASK_STATUS_LABEL_MAP: Record<TaskStatus, string> = {
  todo: "대기 중",
  doing: "진행 중",
  done: "완료",
};

const timezoneLabelMap = Object.fromEntries(
  TIMEZONE_OPTIONS.map((option) => [option.value, option.label]),
) as Record<string, string>;

export function getStatusLabel(status: StatusType) {
  return STATUS_LABEL_MAP[status] ?? status;
}

export function getTaskStatusLabel(status: TaskStatus) {
  return TASK_STATUS_LABEL_MAP[status] ?? status;
}

export function getTimezoneLabel(timezone: string) {
  return timezoneLabelMap[timezone] ?? timezone;
}

export const DEFAULT_TIMEZONE = "Asia/Seoul";
export const DEFAULT_CHECK_IN_TIME = "10:00";
export const FOCUS_PRESETS = [25, 50] as const;
