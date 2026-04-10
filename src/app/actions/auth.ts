"use server";

import { redirect } from "next/navigation";

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
    return { ok: false, error: error.message };
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
    return { ok: false, error: error.message };
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
