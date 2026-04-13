import { DashboardData, OfficeActivityEvent, TopLevelState } from "@/lib/types";

export type OfficeRoomId = "lobby" | "focus-room" | "lounge";
export type OfficeNpcId = "mina" | "jiho" | "sora";
export type OfficeDeskId = "desk-a" | "desk-b" | "desk-c" | "desk-d";
export type OfficeRealtimeConnectionState = "connecting" | "live" | "error";
export type OfficeAssetSlot =
  | "office-background"
  | "desk"
  | "chair"
  | "whiteboard"
  | "window-strip"
  | "plant"
  | "locker"
  | "coffee-bar"
  | "avatar";

export interface OfficeAvatarPosition {
  x: number;
  y: number;
}

export interface OfficeRoomMapRect {
  left: number;
  top: number;
  width: number;
  height: number;
}

export interface OfficeDeskConfig {
  id: OfficeDeskId;
  label: string;
  neighborhood: string;
  position: OfficeAvatarPosition;
  accentClassName: string;
}

export interface OfficeDecorConfig {
  id: string;
  label: string;
  assetSlot: OfficeAssetSlot;
  position: OfficeAvatarPosition;
  widthPercent: number;
  heightPercent: number;
  accentClassName: string;
  zIndex?: number;
}

export interface OfficeRoomConfig {
  id: OfficeRoomId;
  name: string;
  shortLabel: string;
  description: string;
  atmosphere: string;
  themeClassName: string;
  layoutLabels: string[];
  mapRect: OfficeRoomMapRect;
  defaultAvatarPosition: OfficeAvatarPosition;
}

export interface OfficeNpcConfig {
  id: OfficeNpcId;
  name: string;
  role: string;
  archetype: string;
  homeRoomId: OfficeRoomId;
  accentClassName: string;
  intro: string;
  mapPosition: OfficeAvatarPosition;
}

export interface OfficeRoomSummary extends OfficeRoomConfig {
  isCurrent: boolean;
  occupancyLabel: string;
  hint: string;
}

export interface OfficeNpcSummary extends OfficeNpcConfig {
  moodLabel: string;
  reactionSummary: string;
  actionLabel: string;
}

export interface OfficeConversationMessage {
  speaker: "user" | "npc";
  body: string;
}

export interface OfficeConversation {
  npcId: OfficeNpcId;
  title: string;
  subtitle: string;
  messages: OfficeConversationMessage[];
}

export interface OfficePulseStat {
  label: string;
  value: string;
}

export interface OfficePulse {
  headline: string;
  detail: string;
  stats: OfficePulseStat[];
  recentActivity: OfficeActivityEvent[];
}

export interface OfficePresencePayload {
  userId: string;
  nickname: string;
  roomId: OfficeRoomId;
  topLevelState: TopLevelState;
  statusLabel: string | null;
  onlineAt: string;
  posX: number;
  posY: number;
}

export interface OfficePresenceMember extends OfficePresencePayload {
  self: boolean;
  connectionCount: number;
  presenceKey: string;
  position: OfficeAvatarPosition;
}

export interface OfficeChatMessage {
  id: string;
  userId: string;
  nickname: string;
  message: string;
  createdAt: string;
  self: boolean;
}

export interface OfficeChatBubble {
  id: string;
  userId: string;
  nickname: string;
  message: string;
  self: boolean;
}

export interface OfficeExperience {
  officeName: string;
  officeTagline: string;
  currentRoom: OfficeRoomSummary;
  rooms: OfficeRoomSummary[];
  npcsInRoom: OfficeNpcSummary[];
  npcDirectory: OfficeNpcSummary[];
  selectedConversation: OfficeConversation | null;
  selectedNpcId: OfficeNpcId | null;
  officePulse: OfficePulse;
  dashboard: DashboardData;
}
