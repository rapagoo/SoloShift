import { OfficeDeskConfig, OfficeNpcConfig, OfficeRoomConfig } from "@/lib/office/types";

export const OFFICE_SLUG = "soloshift-commons";
export const OFFICE_NAME = "SoloShift Commons";
export const OFFICE_TAGLINE = "같은 책상 줄에 앉아 있는 감각으로 하루를 이어가는 작은 온라인 오피스.";
export const OFFICE_FLOOR_LABEL = "Main Shared Office";
export const OFFICE_REALTIME_TOPIC = `office:${OFFICE_SLUG}:presence`;

export const OFFICE_DESKS: OfficeDeskConfig[] = [
  {
    id: "desk-a",
    label: "Desk A",
    neighborhood: "창가 왼쪽",
    position: { x: 0.28, y: 0.36 },
    accentClassName: "bg-amber-200 text-amber-900",
  },
  {
    id: "desk-b",
    label: "Desk B",
    neighborhood: "창가 오른쪽",
    position: { x: 0.72, y: 0.36 },
    accentClassName: "bg-sky-200 text-sky-900",
  },
  {
    id: "desk-c",
    label: "Desk C",
    neighborhood: "보드 옆",
    position: { x: 0.28, y: 0.72 },
    accentClassName: "bg-emerald-200 text-emerald-900",
  },
  {
    id: "desk-d",
    label: "Desk D",
    neighborhood: "커피 바 옆",
    position: { x: 0.72, y: 0.72 },
    accentClassName: "bg-rose-200 text-rose-900",
  },
];

export const OFFICE_ROOMS: OfficeRoomConfig[] = [
  {
    id: "lobby",
    name: "메인 오피스",
    shortLabel: "메인",
    description: "책상 네 개와 공용 보드가 있는 단일 공유 오피스입니다.",
    atmosphere: "같은 공간 안에서 서로의 리듬을 느끼는 메인 워크룸",
    themeClassName: "from-orange-100 via-white to-amber-50",
    layoutLabels: ["4인 책상 구역", "공용 보드", "커피 바"],
    mapRect: { left: 6, top: 8, width: 88, height: 80 },
    defaultAvatarPosition: { x: 0.28, y: 0.36 },
  },
  {
    id: "focus-room",
    name: "메인 오피스",
    shortLabel: "메인",
    description: "기존 구조와의 호환을 위해 남겨둔 내부 전용 구역입니다.",
    atmosphere: "현재 제품 경험에서는 모두 메인 오피스로 통합됩니다.",
    themeClassName: "from-orange-100 via-white to-amber-50",
    layoutLabels: ["4인 책상 구역", "공용 보드", "커피 바"],
    mapRect: { left: 6, top: 8, width: 88, height: 80 },
    defaultAvatarPosition: { x: 0.72, y: 0.36 },
  },
  {
    id: "lounge",
    name: "메인 오피스",
    shortLabel: "메인",
    description: "기존 구조와의 호환을 위해 남겨둔 내부 전용 구역입니다.",
    atmosphere: "현재 제품 경험에서는 모두 메인 오피스로 통합됩니다.",
    themeClassName: "from-orange-100 via-white to-amber-50",
    layoutLabels: ["4인 책상 구역", "공용 보드", "커피 바"],
    mapRect: { left: 6, top: 8, width: 88, height: 80 },
    defaultAvatarPosition: { x: 0.28, y: 0.72 },
  },
];

export const OFFICE_NPCS: OfficeNpcConfig[] = [
  {
    id: "mina",
    name: "미나",
    role: "팀 리드",
    archetype: "calm-manager",
    homeRoomId: "lobby",
    accentClassName: "bg-rose-100 text-rose-700",
    intro: "기존 공유 오피스 흐름을 정리하던 팀 리드입니다.",
    mapPosition: { x: 0.48, y: 0.18 },
  },
  {
    id: "jiho",
    name: "지호",
    role: "집중 세션 메이커",
    archetype: "deep-worker",
    homeRoomId: "focus-room",
    accentClassName: "bg-sky-100 text-sky-700",
    intro: "집중 세션의 텐션을 정리하던 동료입니다.",
    mapPosition: { x: 0.78, y: 0.18 },
  },
  {
    id: "sora",
    name: "소라",
    role: "리듬 디자이너",
    archetype: "reflective-designer",
    homeRoomId: "lounge",
    accentClassName: "bg-emerald-100 text-emerald-700",
    intro: "오피스 분위기와 회고 흐름을 정리하던 동료입니다.",
    mapPosition: { x: 0.48, y: 0.88 },
  },
];
