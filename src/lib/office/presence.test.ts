import { countOfficePresenceByRoom, listOfficePresenceMembers } from "@/lib/office/presence";

describe("office presence helpers", () => {
  it("deduplicates raw presence state into one member per presence key", () => {
    const members = listOfficePresenceMembers(
      {
        "user-1": [
          {
            userId: "user-1",
            nickname: "서진",
            roomId: "lobby",
            topLevelState: "working",
            statusLabel: "포트폴리오",
            onlineAt: "2026-04-10T10:00:00.000Z",
            posX: 0.18,
            posY: 0.3,
          },
          {
            userId: "user-1",
            nickname: "서진",
            roomId: "focus-room",
            topLevelState: "working",
            statusLabel: "알고리즘 공부",
            onlineAt: "2026-04-10T10:05:00.000Z",
            posX: 0.72,
            posY: 0.48,
          },
        ],
        "user-2": [
          {
            userId: "user-2",
            nickname: "미아",
            roomId: "lounge",
            topLevelState: "resting",
            statusLabel: "휴식",
            onlineAt: "2026-04-10T10:03:00.000Z",
            posX: 0.2,
            posY: 0.6,
          },
        ],
      },
      "user-1",
    );

    expect(members).toHaveLength(2);
    expect(members[0]?.self).toBe(true);
    expect(members[0]?.roomId).toBe("focus-room");
    expect(members[0]?.connectionCount).toBe(2);
    expect(members[0]?.position).toEqual({ x: 0.72, y: 0.48 });
  });

  it("clamps malformed positions into the room bounds", () => {
    const members = listOfficePresenceMembers(
      {
        "user-3": [
          {
            userId: "user-3",
            nickname: "지후",
            roomId: "lounge",
            topLevelState: "working",
            statusLabel: "회고 정리",
            onlineAt: "2026-04-10T10:09:00.000Z",
            posX: 2,
            posY: -3,
          },
        ],
      },
      "user-1",
    );

    expect(members[0]?.position).toEqual({ x: 0.92, y: 0.08 });
  });

  it("counts members by room", () => {
    const counts = countOfficePresenceByRoom(
      ["lobby", "focus-room", "lounge"],
      [
        {
          userId: "user-1",
          nickname: "서진",
          roomId: "focus-room",
          topLevelState: "working",
          statusLabel: "포트폴리오",
          onlineAt: "2026-04-10T10:00:00.000Z",
          posX: 0.5,
          posY: 0.5,
          self: true,
          connectionCount: 1,
          presenceKey: "user-1",
          position: { x: 0.5, y: 0.5 },
        },
        {
          userId: "user-2",
          nickname: "미아",
          roomId: "focus-room",
          topLevelState: "working",
          statusLabel: "알고리즘 공부",
          onlineAt: "2026-04-10T10:01:00.000Z",
          posX: 0.4,
          posY: 0.35,
          self: false,
          connectionCount: 1,
          presenceKey: "user-2",
          position: { x: 0.4, y: 0.35 },
        },
        {
          userId: "user-3",
          nickname: "지후",
          roomId: "lounge",
          topLevelState: "resting",
          statusLabel: "휴식",
          onlineAt: "2026-04-10T10:02:00.000Z",
          posX: 0.55,
          posY: 0.45,
          self: false,
          connectionCount: 1,
          presenceKey: "user-3",
          position: { x: 0.55, y: 0.45 },
        },
      ],
    );

    expect(counts).toEqual({
      lobby: 0,
      "focus-room": 2,
      lounge: 1,
    });
  });
});
