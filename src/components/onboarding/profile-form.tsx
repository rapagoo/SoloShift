"use client";

import { useActionState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

import { saveProfileAction } from "@/app/actions/profile";
import { FormPendingNotice } from "@/components/ui/form-pending-notice";
import { FormSubmitButton } from "@/components/ui/form-submit-button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  DEFAULT_CHECK_IN_TIME,
  DEFAULT_TIMEZONE,
  TIMEZONE_OPTIONS,
} from "@/lib/constants";
import { ActionState, Profile } from "@/lib/types";

const initialState: ActionState = { ok: false };
const DEFAULT_HELPER_TEXT =
  "시간대와 기본 출근 시각은 정시/지각 판정과 일간/주간 요약의 기준으로 사용됩니다.";

interface ProfileFormProps {
  profile: Profile | null;
  submitLabel?: string;
  pendingLabel?: string;
  helperText?: string;
  successRedirectTo?: string | null;
  onSaved?: () => void;
}

export function ProfileForm({
  profile,
  submitLabel = "설정 저장하고 시작하기",
  pendingLabel = "설정 저장 중...",
  helperText = DEFAULT_HELPER_TEXT,
  successRedirectTo = "/",
  onSaved,
}: ProfileFormProps) {
  const router = useRouter();
  const handledSuccessRef = useRef(false);
  const [state, formAction] = useActionState(saveProfileAction, initialState);

  useEffect(() => {
    if (!state.ok || handledSuccessRef.current) {
      return;
    }

    handledSuccessRef.current = true;

    if (onSaved) {
      onSaved();
    }

    if (successRedirectTo) {
      router.replace(successRedirectTo);
    }

    router.refresh();
  }, [onSaved, router, state.ok, successRedirectTo]);

  useEffect(() => {
    if (!state.ok) {
      handledSuccessRef.current = false;
    }
  }, [state.ok]);

  return (
    <form action={formAction} className="mt-8 space-y-5">
      <label className="block space-y-2">
        <span className="text-sm font-medium text-slate-700">닉네임</span>
        <Input defaultValue={profile?.nickname ?? ""} name="nickname" placeholder="예: Rapagoo" required />
      </label>
      <div className="grid gap-5 md:grid-cols-2">
        <label className="block space-y-2">
          <span className="text-sm font-medium text-slate-700">시간대</span>
          <Select defaultValue={profile?.timezone ?? DEFAULT_TIMEZONE} name="timezone" required>
            {TIMEZONE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </label>
        <label className="block space-y-2">
          <span className="text-sm font-medium text-slate-700">기본 출근 시각</span>
          <Input
            defaultValue={profile?.default_check_in_time ?? DEFAULT_CHECK_IN_TIME}
            name="default_check_in_time"
            required
            type="time"
          />
        </label>
      </div>
      <div className="rounded-[1.5rem] bg-slate-900/5 px-4 py-4 text-sm leading-7 text-slate-600">
        {helperText}
      </div>
      {state.error ? <p className="text-sm text-rose-600">{state.error}</p> : null}
      {state.message && !successRedirectTo ? (
        <p className="text-sm text-emerald-700">{state.message}</p>
      ) : null}
      <FormPendingNotice message="프로필 설정을 저장하는 중입니다." />
      <div className="flex justify-end">
        <FormSubmitButton idleLabel={submitLabel} pendingLabel={pendingLabel} size="lg" />
      </div>
    </form>
  );
}
