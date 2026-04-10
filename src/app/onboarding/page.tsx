import { redirect } from "next/navigation";

import { submitProfileAction } from "@/app/actions/profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { SetupCard } from "@/components/setup-card";
import { TopNav } from "@/components/top-nav";
import { getOptionalSession, isProfileComplete } from "@/lib/auth";
import {
  DEFAULT_CHECK_IN_TIME,
  DEFAULT_TIMEZONE,
  TIMEZONE_OPTIONS,
} from "@/lib/constants";
import { hasSupabaseEnv } from "@/lib/env";
import { getProfileByUserId } from "@/lib/data/profile";

export default async function OnboardingPage() {
  if (!hasSupabaseEnv()) {
    return <SetupCard />;
  }

  const { user } = await getOptionalSession();

  if (!user) {
    redirect("/login");
  }

  const profile = await getProfileByUserId(user.id);

  if (profile && isProfileComplete(profile)) {
    redirect("/");
  }

  return (
    <main className="mx-auto min-h-screen max-w-4xl px-4 py-6 md:px-6 md:py-8">
      <TopNav current="onboarding" nickname={profile?.nickname ?? "새 사용자"} />
      <section className="grain rounded-[2rem] border border-[var(--line)] bg-[var(--card-strong)] p-6 shadow-[var(--shadow-lg)] md:p-8">
        <p className="font-['Space_Grotesk'] text-sm font-semibold uppercase tracking-[0.28em] text-[var(--accent)]">
          Onboarding
        </p>
        <h1 className="mt-3 font-['Space_Grotesk'] text-4xl font-bold text-slate-950">
          출근 기준을 먼저 정해둘게요.
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
          닉네임, 시간대, 기본 출근 시각을 저장하면 정시/지각 판정과 기록 요약이 모두 같은 기준으로 동작합니다.
        </p>

        <form action={submitProfileAction} className="mt-8 space-y-5">
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
          <div className="flex justify-end">
            <Button size="lg" type="submit">
              설정 저장하고 시작하기
            </Button>
          </div>
        </form>
      </section>
    </main>
  );
}
