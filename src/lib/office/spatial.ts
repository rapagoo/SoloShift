import {
  OfficeAvatarPosition,
  OfficeRoomConfig,
  OfficeRoomId,
  OfficeRoomMapRect,
} from "@/lib/office/types";

const DEFAULT_PADDING = 0.08;

export function clampOfficeAvatarPosition(
  position: OfficeAvatarPosition,
  padding = DEFAULT_PADDING,
): OfficeAvatarPosition {
  const min = padding;
  const max = 1 - padding;

  return {
    x: clampNumber(position.x, min, max),
    y: clampNumber(position.y, min, max),
  };
}

export function resolveOfficeAvatarPosition(
  position: Partial<OfficeAvatarPosition> | null | undefined,
  fallback: OfficeAvatarPosition,
): OfficeAvatarPosition {
  return clampOfficeAvatarPosition({
    x: typeof position?.x === "number" ? position.x : fallback.x,
    y: typeof position?.y === "number" ? position.y : fallback.y,
  });
}

export function projectOfficeAvatarPosition(
  roomRect: OfficeRoomMapRect,
  position: OfficeAvatarPosition,
) {
  const safe = clampOfficeAvatarPosition(position);

  return {
    left: roomRect.left + roomRect.width * safe.x,
    top: roomRect.top + roomRect.height * safe.y,
  };
}

export function buildDefaultRoomPositions(
  rooms: Pick<OfficeRoomConfig, "id" | "defaultAvatarPosition">[],
) {
  return rooms.reduce<Record<OfficeRoomId, OfficeAvatarPosition>>(
    (positions, room) => {
      positions[room.id] = clampOfficeAvatarPosition(room.defaultAvatarPosition);
      return positions;
    },
    {
      lobby: { x: 0.5, y: 0.5 },
      "focus-room": { x: 0.5, y: 0.5 },
      lounge: { x: 0.5, y: 0.5 },
    },
  );
}

export function clampNumber(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) {
    return min;
  }

  return Math.min(max, Math.max(min, value));
}
