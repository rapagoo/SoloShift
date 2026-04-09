import Link from "next/link";

import { signOutAction } from "@/app/actions/auth";

interface TopNavProps {
  nickname: string;
  current: "home" | "history" | "onboarding";
}

export function TopNav({ nickname, current }: TopNavProps) {
  return (
    <header className="mb-8 flex flex-col gap-4 rounded-[2rem] border border-[var(--line)] bg-white/70 px-5 py-4 shadow-sm backdrop-blur md:flex-row md:items-center md:justify-between">
      <div>
        <p className="font-['Space_Grotesk'] text-lg font-semibold text-slate-950">
          SoloShift
        </p>
        <p className="text-sm text-slate-500">{nickname}님의 오늘 근무 흐름</p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Link
          className={`rounded-full px-4 py-2 text-sm transition ${
            current === "home" ? "bg-slate-950 text-white" : "bg-slate-900/5 text-slate-700"
          }`}
          href="/"
        >
          대시보드
        </Link>
        <Link
          className={`rounded-full px-4 py-2 text-sm transition ${
            current === "history" ? "bg-slate-950 text-white" : "bg-slate-900/5 text-slate-700"
          }`}
          href="/history"
        >
          기록 보기
        </Link>
        <form action={signOutAction}>
          <button
            className="rounded-full bg-rose-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-rose-700"
            type="submit"
          >
            로그아웃
          </button>
        </form>
      </div>
    </header>
  );
}
