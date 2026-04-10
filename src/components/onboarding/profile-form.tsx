"use client";

import { useActionState } from "react";

import { saveProfileAction } from "@/app/actions/profile";
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

interface ProfileFormProps {
  profile: Profile | null;
}

export function ProfileForm({ profile }: ProfileFormProps) {
  const [state, formAction] = useActionState(saveProfileAction, initialState);

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
        MVP에서는 이 값으로 정시 출근과 지각 판정을 계산합니다. 나중에 대시보드에서 다시 바꿀 수 있습니다.
      </div>
      {state.error ? <p className="text-sm text-rose-600">{state.error}</p> : null}
      <div className="flex justify-end">
        <FormSubmitButton idleLabel="설정 저장하고 시작하기" pendingLabel="설정 저장 중..." size="lg" />
      </div>
    </form>
  );
}

