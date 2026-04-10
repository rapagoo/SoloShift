import { redirect } from "next/navigation";

import { ProfileForm } from "@/components/onboarding/profile-form";
import { SetupCard } from "@/components/setup-card";
import { TopNav } from "@/components/top-nav";
import { getOptionalSession, isProfileComplete } from "@/lib/auth";
import { getProfileByUserId } from "@/lib/data/profile";
import { hasServerSupabaseEnv } from "@/lib/server-env";

export default async function OnboardingPage() {
  if (!hasServerSupabaseEnv()) {
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

        <ProfileForm profile={profile} />
      </section>
    </main>
  );
}

