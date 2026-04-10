"use client";

import { useActionState, useMemo, useState } from "react";

import { signInAction, signUpAction } from "@/app/actions/auth";
import { FormPendingNotice } from "@/components/ui/form-pending-notice";
import { FormSubmitButton } from "@/components/ui/form-submit-button";
import { Input } from "@/components/ui/input";
import { MIN_PASSWORD_LENGTH, PASSWORD_HELPER_TEXT } from "@/lib/auth/password-policy";
import { ActionState } from "@/lib/types";

const initialState: ActionState = { ok: false };

export function AuthPanel() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [signInState, signInFormAction] = useActionState(signInAction, initialState);
  const [signUpState, signUpFormAction] = useActionState(signUpAction, initialState);

  const state = mode === "signin" ? signInState : signUpState;
  const action = mode === "signin" ? signInFormAction : signUpFormAction;
  const ctaLabel = mode === "signin" ? "로그인" : "계정 만들기";
  const pendingLabel = mode === "signin" ? "로그인 중..." : "가입 중...";

  const helper = useMemo(() => {
    if (state.error) {
      return <p className="text-sm text-rose-600">{state.error}</p>;
    }

    if (state.message) {
      return <p className="text-sm text-emerald-700">{state.message}</p>;
    }

    return <p className="text-sm text-slate-500">{PASSWORD_HELPER_TEXT}</p>;
  }, [state.error, state.message]);

  return (
    <div className="grain w-full rounded-[2rem] border border-[var(--line)] bg-[var(--card-strong)] p-8 shadow-[var(--shadow-lg)]">
      <div className="mb-8 flex items-center gap-3 rounded-full bg-slate-900/5 p-1">
        <button
          className={`flex-1 rounded-full px-4 py-2 text-sm font-medium transition ${
            mode === "signin" ? "bg-slate-950 text-white" : "text-slate-600"
          }`}
          onClick={() => setMode("signin")}
          type="button"
        >
          로그인
        </button>
        <button
          className={`flex-1 rounded-full px-4 py-2 text-sm font-medium transition ${
            mode === "signup" ? "bg-slate-950 text-white" : "text-slate-600"
          }`}
          onClick={() => setMode("signup")}
          type="button"
        >
          회원가입
        </button>
      </div>

      <form action={action} className="space-y-4">
        <label className="block space-y-2">
          <span className="text-sm font-medium text-slate-700">이메일</span>
          <Input name="email" placeholder="you@example.com" required type="email" />
        </label>
        <label className="block space-y-2">
          <span className="text-sm font-medium text-slate-700">비밀번호</span>
          <Input
            minLength={MIN_PASSWORD_LENGTH}
            name="password"
            placeholder={`${MIN_PASSWORD_LENGTH}자 이상`}
            required
            type="password"
          />
        </label>

        {helper}
        <FormPendingNotice
          message={
            mode === "signin"
              ? "로그인 정보를 확인하는 중입니다."
              : "계정을 만드는 중입니다."
          }
        />

        <FormSubmitButton className="w-full" idleLabel={ctaLabel} pendingLabel={pendingLabel} />
      </form>
    </div>
  );
}
