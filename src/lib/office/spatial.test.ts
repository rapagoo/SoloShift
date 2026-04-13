import {
  assignOfficeDesk,
  buildDeskOccupancy,
  buildDefaultRoomPositions,
  clampOfficeAvatarPosition,
  getPreferredOfficeDesk,
  moveOfficeAvatarTowards,
  projectOfficeAvatarPosition,
  resolveOfficeAvatarPosition,
} from "@/lib/office/spatial";
import { OFFICE_DESKS } from "@/lib/office/config";

describe("office spatial helpers", () => {
  it("builds initial room positions from room defaults", () => {
    const positions = buildDefaultRoomPositions([
      { id: "lobby", defaultAvatarPosition: { x: 0.48, y: 0.52 } },
      { id: "focus-room", defaultAvatarPosition: { x: 0.24, y: 0.5 } },
      { id: "lounge", defaultAvatarPosition: { x: 0.72, y: 0.5 } },
    ]);

    expect(positions).toEqual({
      lobby: { x: 0.48, y: 0.52 },
      "focus-room": { x: 0.24, y: 0.5 },
      lounge: { x: 0.72, y: 0.5 },
    });
  });

  it("clamps avatar positions away from the walls", () => {
    expect(clampOfficeAvatarPosition({ x: -1, y: 4 })).toEqual({ x: 0.08, y: 0.92 });
  });

  it("falls back to a default position when payload data is missing", () => {
    expect(resolveOfficeAvatarPosition(undefined, { x: 0.48, y: 0.52 })).toEqual({
      x: 0.48,
      y: 0.52,
    });
  });

  it("moves an avatar smoothly toward the target", () => {
    expect(
      moveOfficeAvatarTowards({ x: 0.2, y: 0.2 }, { x: 0.3, y: 0.2 }, 0.05),
    ).toEqual({
      x: 0.25,
      y: 0.2,
    });
  });

  it("projects local room coordinates into map coordinates", () => {
    expect(
      projectOfficeAvatarPosition(
        { left: 36, top: 10, width: 60, height: 36 },
        { x: 0.5, y: 0.5 },
      ),
    ).toEqual({ left: 66, top: 28 });
  });

  it("returns a stable preferred desk for a user", () => {
    expect(getPreferredOfficeDesk("user-1", OFFICE_DESKS)?.id).toBe(
      getPreferredOfficeDesk("user-1", OFFICE_DESKS)?.id,
    );
  });

  it("assigns online users across the four desks without duplicates", () => {
    const deskIds = [
      assignOfficeDesk(["user-1", "user-2", "user-3"], "user-1", OFFICE_DESKS),
      assignOfficeDesk(["user-1", "user-2", "user-3"], "user-2", OFFICE_DESKS),
      assignOfficeDesk(["user-1", "user-2", "user-3"], "user-3", OFFICE_DESKS),
    ];

    expect(new Set(deskIds).size).toBe(3);
  });

  it("builds desk occupancy rows from presence members", () => {
    const occupancy = buildDeskOccupancy(
      [
        {
          userId: "user-1",
          nickname: "서진",
          roomId: "lobby",
          topLevelState: "working",
          statusLabel: "포트폴리오",
          onlineAt: "2026-04-13T06:00:00.000Z",
          posX: 0.24,
          posY: 0.34,
          self: true,
          connectionCount: 1,
          presenceKey: "user-1",
          position: { x: 0.24, y: 0.34 },
        },
        {
          userId: "user-2",
          nickname: "유나",
          roomId: "lobby",
          topLevelState: "working",
          statusLabel: "집중 중",
          onlineAt: "2026-04-13T06:01:00.000Z",
          posX: 0.72,
          posY: 0.34,
          self: false,
          connectionCount: 1,
          presenceKey: "user-2",
          position: { x: 0.72, y: 0.34 },
        },
      ],
      OFFICE_DESKS,
    );

    expect(occupancy).toHaveLength(4);
    expect(occupancy.filter((entry) => entry.occupant)).toHaveLength(2);
  });
});
