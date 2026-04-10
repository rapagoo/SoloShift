import { ActivityFeedEntry, DashboardData } from "@/lib/types";

export type OfficeRoomId = "lobby" | "focus-room" | "lounge";
export type OfficeNpcId = "mina" | "jiho" | "sora";
export type OfficeRealtimeConnectionState = "connecting" | "live" | "error";

export interface OfficeRoomConfig {
  id: OfficeRoomId;
  name: string;
  shortLabel: string;
  description: string;
  atmosphere: string;
  themeClassName: string;
  layoutLabels: string[];
}

export interface OfficeNpcConfig {
  id: OfficeNpcId;
  name: string;
  role: string;
  archetype: string;
  homeRoomId: OfficeRoomId;
  accentClassName: string;
  intro: string;
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
  recentActivity: ActivityFeedEntry[];
}

export interface OfficePresencePayload {
  userId: string;
  nickname: string;
  roomId: OfficeRoomId;
  topLevelState: DashboardData["top_level_state"];
  statusLabel: string | null;
  onlineAt: string;
}

export interface OfficePresenceMember extends OfficePresencePayload {
  self: boolean;
  connectionCount: number;
}

export interface OfficeExperience {
  officeName: string;
  officeTagline: string;
  currentRoom: OfficeRoomConfig;
  rooms: OfficeRoomSummary[];
  npcsInRoom: OfficeNpcSummary[];
  selectedConversation: OfficeConversation | null;
  selectedNpcId: OfficeNpcId | null;
  officePulse: OfficePulse;
  dashboard: DashboardData;
}
