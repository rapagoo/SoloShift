import { redirect } from "next/navigation";

import { getProfileByUserId } from "@/lib/data/profile";
import { getOptionalSession, isProfileComplete } from "@/lib/auth";
import { hasServerSupabaseEnv } from "@/lib/server-env";
import { AuthPanel } from "@/components/auth/auth-panel";
import { SetupCard } from "@/components/setup-card";

export default async function LoginPage() {
  if (!hasServerSupabaseEnv()) {
    return <SetupCard />;
  }

  const { user } = await getOptionalSession();

  if (user) {
    const profile = await getProfileByUserId(user.id);
    redirect(isProfileComplete(profile) ? "/" : "/onboarding");
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-6xl items-center px-4 py-8 md:px-6">
      <div className="grid w-full gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="space-y-6 rounded-[2rem] border border-[var(--line)] bg-white/60 p-8 shadow-sm backdrop-blur">
          <p className="font-['Space_Grotesk'] text-sm font-semibold uppercase tracking-[0.28em] text-[var(--accent)]">
            SoloShift MVP
          </p>
          <h1 className="font-['Space_Grotesk'] text-5xl font-bold leading-tight text-slate-950">
            출근하듯
            <br />
            하루를 시작하세요.
          </h1>
          <p className="max-w-xl text-base leading-7 text-slate-600">
            SoloShift는 혼자 공부하거나 취업을 준비하는 사람이 하루를 흐트러지지 않게 운영하도록
            도와주는 개인용 근무 대시보드입니다. 출근, 상태 기록, 집중 세션, 퇴근 회고를 한 흐름으로
            묶어줍니다.
          </p>
          <div className="grid gap-3 sm:grid-cols-3">
            <Feature title="출근 감각" body="하루를 버튼 하나로 명확하게 시작" />
            <Feature title="집중 세션" body="작업 시간을 분리해서 추적" />
            <Feature title="퇴근 회고" body="내일 첫 작업까지 이어서 저장" />
          </div>
        </section>
        <AuthPanel />
      </div>
    </main>
  );
}

function Feature({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-[1.5rem] bg-white/75 p-4 shadow-sm">
      <p className="font-medium text-slate-900">{title}</p>
      <p className="mt-2 text-sm leading-6 text-slate-500">{body}</p>
    </div>
  );
}

