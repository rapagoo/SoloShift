"use server";

import { redirect } from "next/navigation";

import { MIN_PASSWORD_LENGTH } from "@/lib/auth/password-policy";
import { validatePasswordSecurity } from "@/lib/auth/password-security";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ActionState } from "@/lib/types";

const initialState: ActionState = { ok: false };

export async function signInAction(
  _prevState: ActionState = initialState,
  formData: FormData,
): Promise<ActionState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "").trim();

  if (!email || !password) {
    return { ok: false, error: "이메일과 비밀번호를 입력해주세요." };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { ok: false, error: getAuthErrorMessage(error) };
  }

  redirect("/");
}

export async function signUpAction(
  _prevState: ActionState = initialState,
  formData: FormData,
): Promise<ActionState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "").trim();

  if (!email || !password) {
    return { ok: false, error: "이메일과 비밀번호를 입력해주세요." };
  }

  const passwordValidation = await validatePasswordSecurity(password);

  if (!passwordValidation.ok) {
    return { ok: false, error: passwordValidation.error };
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    return { ok: false, error: getAuthErrorMessage(error) };
  }

  if (!data.session) {
    return {
      ok: true,
      message: "가입이 완료되었습니다. 이메일 인증이 켜져 있다면 확인 후 로그인해주세요.",
    };
  }

  redirect("/onboarding");
}

export async function signOutAction() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/login");
}

function getAuthErrorMessage(error: { message: string; code?: string | null }) {
  const code = error.code ?? "";
  const message = error.message ?? "";

  if (code === "invalid_credentials" || /invalid login credentials/i.test(message)) {
    return "이메일 또는 비밀번호가 올바르지 않습니다.";
  }

  if (code === "email_not_confirmed" || /email not confirmed/i.test(message)) {
    return "이메일 인증을 완료한 뒤 로그인해주세요.";
  }

  if (code === "user_already_exists" || /user already registered/i.test(message)) {
    return "이미 가입된 이메일입니다. 로그인해보세요.";
  }

  if (/password should be at least/i.test(message)) {
    return `비밀번호는 최소 ${MIN_PASSWORD_LENGTH}자 이상이어야 합니다.`;
  }

  if (/signup is disabled/i.test(message)) {
    return "현재 회원가입이 비활성화되어 있습니다.";
  }

  if (/invalid email/i.test(message) || /unable to validate email/i.test(message)) {
    return "올바른 이메일 주소를 입력해주세요.";
  }

  return "로그인 또는 회원가입 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
}
