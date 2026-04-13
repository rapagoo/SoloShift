import { OfficeNpcConfig, OfficeRoomConfig } from "@/lib/office/types";

export const OFFICE_SLUG = "soloshift-commons";
export const OFFICE_NAME = "SoloShift Commons";
export const OFFICE_TAGLINE = "혼자 일해도, 공간은 함께 쓰는 감각으로.";
export const OFFICE_REALTIME_TOPIC = `office:${OFFICE_SLUG}:presence`;

export const OFFICE_ROOMS: OfficeRoomConfig[] = [
  {
    id: "lobby",
    name: "로비 데스크",
    shortLabel: "로비",
    description: "하루를 열고, 현재 리듬을 정리하고, 다음 움직임을 결정하는 진입 공간입니다.",
    atmosphere: "출근과 상태 전환이 가장 또렷하게 보이는 곳",
    themeClassName: "from-amber-100 via-white to-rose-50",
    layoutLabels: ["출근 보드", "업무 알림판", "상태 데스크"],
    mapRect: { left: 4, top: 10, width: 28, height: 76 },
    defaultAvatarPosition: { x: 0.48, y: 0.52 },
  },
  {
    id: "focus-room",
    name: "포커스 룸",
    shortLabel: "집중",
    description: "타이머를 걸고 세션 하나에 몰입하기 좋은 조용한 공간입니다.",
    atmosphere: "잡음을 낮추고 한 세션에 깊게 잠수하는 구역",
    themeClassName: "from-sky-100 via-white to-cyan-50",
    layoutLabels: ["세션 부스", "집중 타이머", "완료 기록판"],
    mapRect: { left: 36, top: 10, width: 60, height: 36 },
    defaultAvatarPosition: { x: 0.24, y: 0.5 },
  },
  {
    id: "lounge",
    name: "라운지",
    shortLabel: "라운지",
    description: "호흡을 고르고 회고를 정리하면서 다음 문장을 다듬는 공간입니다.",
    atmosphere: "휴식, 회고, 문장 정리를 가볍게 풀어내는 구역",
    themeClassName: "from-emerald-100 via-white to-lime-50",
    layoutLabels: ["리뷰 소파", "브레이크 바", "내일 첫 작업 메모"],
    mapRect: { left: 36, top: 52, width: 60, height: 34 },
    defaultAvatarPosition: { x: 0.72, y: 0.5 },
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
    intro: "하루의 시작과 마감을 매끄럽게 정리해주는 팀 리드입니다.",
    mapPosition: { x: 0.26, y: 0.32 },
  },
  {
    id: "jiho",
    name: "지호",
    role: "포커스 엔지니어",
    archetype: "deep-worker",
    homeRoomId: "focus-room",
    accentClassName: "bg-sky-100 text-sky-700",
    intro: "집중 세션과 작업 템포를 날카롭게 챙기는 동료입니다.",
    mapPosition: { x: 0.72, y: 0.28 },
  },
  {
    id: "sora",
    name: "소라",
    role: "리듬 디자이너",
    archetype: "reflective-designer",
    homeRoomId: "lounge",
    accentClassName: "bg-emerald-100 text-emerald-700",
    intro: "휴식과 회고, 표현의 톤을 자연스럽게 정리해주는 동료입니다.",
    mapPosition: { x: 0.36, y: 0.68 },
  },
];
