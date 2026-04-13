import {
  OfficeAvatarPosition,
  OfficeDeskConfig,
  OfficeDeskId,
  OfficePresenceMember,
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

export function moveOfficeAvatarTowards(
  current: OfficeAvatarPosition,
  target: OfficeAvatarPosition,
  step = 0.012,
) {
  const deltaX = target.x - current.x;
  const deltaY = target.y - current.y;
  const distance = Math.hypot(deltaX, deltaY);

  if (distance <= step || distance === 0) {
    return clampOfficeAvatarPosition(target);
  }

  return clampOfficeAvatarPosition({
    x: current.x + (deltaX / distance) * step,
    y: current.y + (deltaY / distance) * step,
  });
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

export function assignOfficeDesk(memberUserIds: string[], userId: string, desks: OfficeDeskConfig[]) {
  const sortedUserIds = [...new Set(memberUserIds)].sort((left, right) => left.localeCompare(right));
  const assignments = new Map<string, OfficeDeskId>();
  const occupied = new Set<OfficeDeskId>();

  for (const currentUserId of sortedUserIds) {
    const startIndex = hashStringToIndex(currentUserId, desks.length);

    for (let offset = 0; offset < desks.length; offset += 1) {
      const desk = desks[(startIndex + offset) % desks.length];

      if (!desk || occupied.has(desk.id)) {
        continue;
      }

      assignments.set(currentUserId, desk.id);
      occupied.add(desk.id);
      break;
    }
  }

  return assignments.get(userId) ?? desks[0]?.id ?? "desk-a";
}

export function getPreferredOfficeDesk(userId: string, desks: OfficeDeskConfig[]) {
  return desks[hashStringToIndex(userId, desks.length)] ?? desks[0];
}

export function buildDeskOccupancy(
  members: OfficePresenceMember[],
  desks: OfficeDeskConfig[],
) {
  return desks.map((desk) => {
    const occupant = members.find(
      (member) => assignOfficeDesk(members.map((item) => item.userId), member.userId, desks) === desk.id,
    );

    return {
      desk,
      occupant: occupant ?? null,
    };
  });
}

export function clampNumber(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) {
    return min;
  }

  return Math.min(max, Math.max(min, value));
}

function hashStringToIndex(value: string, size: number) {
  let hash = 0;

  for (const character of value) {
    hash = (hash * 31 + character.charCodeAt(0)) >>> 0;
  }

  return size === 0 ? 0 : hash % size;
}
