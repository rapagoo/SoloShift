import {
  countOfficePresenceByRoom,
  listOfficePresenceMembers,
} from "@/lib/office/presence";

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
            statusLabel: "포트폴리오 개발",
            onlineAt: "2026-04-10T10:00:00.000Z",
          },
          {
            userId: "user-1",
            nickname: "서진",
            roomId: "focus-room",
            topLevelState: "working",
            statusLabel: "알고리즘 공부",
            onlineAt: "2026-04-10T10:05:00.000Z",
          },
        ],
        "user-2": [
          {
            userId: "user-2",
            nickname: "민아",
            roomId: "lounge",
            topLevelState: "resting",
            statusLabel: "휴식",
            onlineAt: "2026-04-10T10:03:00.000Z",
          },
        ],
      },
      "user-1",
    );

    expect(members).toHaveLength(2);
    expect(members[0]?.self).toBe(true);
    expect(members[0]?.roomId).toBe("focus-room");
    expect(members[0]?.connectionCount).toBe(2);
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
          statusLabel: "포트폴리오 개발",
          onlineAt: "2026-04-10T10:00:00.000Z",
          self: true,
          connectionCount: 1,
        },
        {
          userId: "user-2",
          nickname: "민아",
          roomId: "focus-room",
          topLevelState: "working",
          statusLabel: "알고리즘 공부",
          onlineAt: "2026-04-10T10:01:00.000Z",
          self: false,
          connectionCount: 1,
        },
        {
          userId: "user-3",
          nickname: "지수",
          roomId: "lounge",
          topLevelState: "resting",
          statusLabel: "휴식",
          onlineAt: "2026-04-10T10:02:00.000Z",
          self: false,
          connectionCount: 1,
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
