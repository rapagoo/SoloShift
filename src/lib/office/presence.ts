import {
  OfficePresenceMember,
  OfficePresencePayload,
  OfficeRoomId,
} from "@/lib/office/types";
import { resolveOfficeAvatarPosition } from "@/lib/office/spatial";

type RawPresenceState = Record<string, OfficePresencePayload[]>;

export function listOfficePresenceMembers(
  state: RawPresenceState,
  selfUserId: string,
) {
  return Object.entries(state)
    .map(([presenceKey, entries]) => {
      const latestEntry = [...entries].sort((left, right) =>
        right.onlineAt.localeCompare(left.onlineAt),
      )[0];

      if (!latestEntry) {
        return null;
      }

      return {
        ...latestEntry,
        self: latestEntry.userId === selfUserId,
        connectionCount: entries.length,
        presenceKey,
        position: resolveOfficeAvatarPosition(
          { x: latestEntry.posX, y: latestEntry.posY },
          { x: 0.5, y: 0.5 },
        ),
      };
    })
    .filter((entry): entry is OfficePresenceMember & { presenceKey: string } => Boolean(entry))
    .sort((left, right) => {
      if (left.self !== right.self) {
        return left.self ? -1 : 1;
      }

      if (left.roomId !== right.roomId) {
        return left.roomId.localeCompare(right.roomId);
      }

      return left.nickname.localeCompare(right.nickname, "ko");
    });
}

export function countOfficePresenceByRoom(
  roomIds: OfficeRoomId[],
  members: OfficePresenceMember[],
) {
  return roomIds.reduce<Record<OfficeRoomId, number>>(
    (counts, roomId) => {
      counts[roomId] = members.filter((member) => member.roomId === roomId).length;
      return counts;
    },
    {
      lobby: 0,
      "focus-room": 0,
      lounge: 0,
    },
  );
}
