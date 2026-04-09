"use client";

import { Button } from "@/components/ui/button";

export function SetupCard() {
  return (
    <div className="mx-auto flex min-h-screen max-w-4xl items-center px-6 py-12">
      <div className="grain w-full rounded-[2rem] border border-[var(--line)] bg-[var(--card-strong)] p-8 shadow-[var(--shadow-lg)]">
        <p className="font-['Space_Grotesk'] text-sm font-semibold uppercase tracking-[0.28em] text-[var(--accent)]">
          Environment Setup
        </p>
        <h1 className="mt-4 font-['Space_Grotesk'] text-4xl font-bold text-slate-950">
          Supabase 연결 정보가 필요합니다.
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
          <code>NEXT_PUBLIC_SUPABASE_URL</code>과 <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code>
          를 <code>.env.local</code>에 넣으면 로그인, 저장, 기록 조회가 모두 활성화됩니다.
        </p>
        <div className="mt-8 rounded-3xl bg-slate-950 p-5 text-sm text-slate-200">
          <pre className="overflow-x-auto whitespace-pre-wrap">NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...</pre>
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button onClick={() => window.location.reload()} type="button">
            새로고침
          </Button>
        </div>
      </div>
    </div>
  );
}
