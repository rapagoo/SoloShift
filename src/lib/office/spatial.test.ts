import {
  buildDefaultRoomPositions,
  clampOfficeAvatarPosition,
  projectOfficeAvatarPosition,
  resolveOfficeAvatarPosition,
} from "@/lib/office/spatial";

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

  it("projects local room coordinates into map coordinates", () => {
    expect(
      projectOfficeAvatarPosition(
        { left: 36, top: 10, width: 60, height: 36 },
        { x: 0.5, y: 0.5 },
      ),
    ).toEqual({ left: 66, top: 28 });
  });
});
