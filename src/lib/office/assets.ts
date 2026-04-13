import { OfficeAssetSlot } from "@/lib/office/types";

export const OFFICE_ASSET_PATHS: Partial<Record<OfficeAssetSlot, string>> = {
  // Example:
  // "office-background": "/assets/office/background/main-office.png",
  // desk: "/assets/office/props/desk.png",
  // chair: "/assets/office/props/chair.png",
  // avatar: "/assets/office/avatars/avatar-idle-front.png",
};

export function getOfficeAssetPath(slot: OfficeAssetSlot) {
  return OFFICE_ASSET_PATHS[slot] ?? null;
}
