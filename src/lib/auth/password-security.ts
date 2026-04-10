import { createHash } from "node:crypto";

import { MIN_PASSWORD_LENGTH } from "@/lib/auth/password-policy";

const PWNED_PASSWORDS_RANGE_API = "https://api.pwnedpasswords.com/range";
const PASSWORD_CHECK_TIMEOUT_MS = 5000;
const PASSWORD_CHECK_ERROR =
  "비밀번호 유출 여부를 확인하지 못했습니다. 잠시 후 다시 시도해주세요.";
const PWNED_PASSWORD_ERROR =
  "이미 유출 이력이 있는 비밀번호입니다. 다른 비밀번호를 사용해주세요.";

type PasswordValidationResult = { ok: true } | { ok: false; error: string };

export async function validatePasswordSecurity(password: string): Promise<PasswordValidationResult> {
  if (password.length < MIN_PASSWORD_LENGTH) {
    return {
      ok: false,
      error: `비밀번호는 최소 ${MIN_PASSWORD_LENGTH}자 이상이어야 합니다.`,
    };
  }

  const leakedPasswordCount = await getLeakedPasswordCount(password);

  if (leakedPasswordCount === null) {
    return { ok: false, error: PASSWORD_CHECK_ERROR };
  }

  if (leakedPasswordCount > 0) {
    return { ok: false, error: PWNED_PASSWORD_ERROR };
  }

  return { ok: true };
}

function createSha1Hash(input: string) {
  return createHash("sha1").update(input, "utf8").digest("hex").toUpperCase();
}

async function getLeakedPasswordCount(password: string) {
  const hash = createSha1Hash(password);
  const prefix = hash.slice(0, 5);
  const suffix = hash.slice(5);
  const abortController = new AbortController();
  const timeoutId = setTimeout(() => abortController.abort(), PASSWORD_CHECK_TIMEOUT_MS);

  try {
    // HIBP range queries only send the first 5 SHA-1 characters to preserve password privacy.
    const response = await fetch(`${PWNED_PASSWORDS_RANGE_API}/${prefix}`, {
      method: "GET",
      cache: "no-store",
      signal: abortController.signal,
      headers: {
        "Add-Padding": "true",
        "User-Agent": "SoloShift password security",
      },
    });

    if (!response.ok) {
      return null;
    }

    const body = await response.text();

    for (const line of body.split(/\r?\n/)) {
      const [candidateSuffix, count] = line.split(":");

      if (candidateSuffix === suffix) {
        return Number.parseInt(count ?? "0", 10) || 0;
      }
    }

    return 0;
  } catch {
    return null;
  } finally {
    clearTimeout(timeoutId);
  }
}
