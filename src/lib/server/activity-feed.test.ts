import { buildOfficeActivityInsertPayload } from "@/lib/domain/office-activity";

describe("buildOfficeActivityInsertPayload", () => {
  it("redacts private task details from shared office events", () => {
    const payload = buildOfficeActivityInsertPayload({
      workdayId: "workday-1",
      userId: "user-1",
      actorNickname: "서진",
      eventType: "task_created",
      title: "작업 추가",
      meta: {
        taskId: "task-1",
      },
    });

    expect(payload.title).toBe("작업 추가");
    expect(payload.description).toBe("새 작업을 등록했습니다.");
    expect(payload.meta).toEqual({});
    expect(payload.room_id).toBe("lobby");
  });

  it("keeps safe status context while dropping memo-like details", () => {
    const payload = buildOfficeActivityInsertPayload({
      workdayId: "workday-1",
      userId: "user-1",
      actorNickname: "서진",
      eventType: "status_changed",
      title: "상태 변경",
      meta: {
        statusType: "portfolio",
        memo: "메인 페이지 문구부터",
      },
      statusType: "portfolio",
    });

    expect(payload.description).toBe("포트폴리오 개발 상태로 전환했습니다.");
    expect(payload.meta).toEqual({
      statusType: "portfolio",
    });
    expect(payload.room_id).toBe("lobby");
  });

  it("redacts goal text while preserving checkout outcome", () => {
    const payload = buildOfficeActivityInsertPayload({
      workdayId: "workday-1",
      userId: "user-1",
      actorNickname: "서진",
      eventType: "check_out",
      title: "목표 달성 퇴근",
      meta: {
        goalCompleted: true,
        dailyReview: "이력서 2개 정리 완료",
      },
    });

    expect(payload.description).toBe("오늘 회고를 저장하고 목표 달성으로 퇴근했습니다.");
    expect(payload.meta).toEqual({
      goalCompleted: true,
    });
    expect(payload.room_id).toBe("lounge");
  });
});
