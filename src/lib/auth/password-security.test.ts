import { validatePasswordSecurity } from "@/lib/auth/password-security";

describe("password security", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("rejects short passwords before calling HIBP", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const result = await validatePasswordSecurity("short7");

    expect(result).toEqual({
      ok: false,
      error: "비밀번호는 최소 8자 이상이어야 합니다.",
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("rejects leaked passwords reported by HIBP", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response("1E4C9B93F3F0682250B6CF8331B7EE68FD8:42\r\nABCDEF:0"));
    vi.stubGlobal("fetch", fetchMock);

    const result = await validatePasswordSecurity("password");

    expect(result).toEqual({
      ok: false,
      error: "이미 유출 이력이 있는 비밀번호입니다. 다른 비밀번호를 사용해주세요.",
    });
    expect(fetchMock).toHaveBeenCalledOnce();
    expect(fetchMock.mock.calls[0]?.[0]).toBe("https://api.pwnedpasswords.com/range/5BAA6");
  });

  it("accepts passwords not present in the returned range", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response("ABCDEF:1\r\n123456:2"));
    vi.stubGlobal("fetch", fetchMock);

    const result = await validatePasswordSecurity("BetterPass123!");

    expect(result).toEqual({ ok: true });
  });

  it("fails closed when the password check service is unavailable", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response("service unavailable", { status: 503 }));
    vi.stubGlobal("fetch", fetchMock);

    const result = await validatePasswordSecurity("BetterPass123!");

    expect(result).toEqual({
      ok: false,
      error: "비밀번호 유출 여부를 확인하지 못했습니다. 잠시 후 다시 시도해주세요.",
    });
  });
});
