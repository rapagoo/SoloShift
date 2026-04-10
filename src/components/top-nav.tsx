import Link from "next/link";

import { signOutAction } from "@/app/actions/auth";

interface TopNavProps {
  nickname: string;
  current: "home" | "history" | "onboarding";
}

const baseNavItems = [
  { href: "/", label: "대시보드", key: "home" },
  { href: "/history", label: "기록 보기", key: "history" },
] as const;

export function TopNav({ nickname, current }: TopNavProps) {
  const navItems = current === "onboarding"
    ? [{ href: "/onboarding", label: "초기 설정", key: "onboarding" }, ...baseNavItems]
    : baseNavItems;

  return (
    <header className="mb-8 flex flex-col gap-4 rounded-[2rem] border border-[var(--line)] bg-white/70 px-5 py-4 shadow-sm backdrop-blur md:flex-row md:items-center md:justify-between">
      <div>
        <p className="font-['Space_Grotesk'] text-lg font-semibold text-slate-950">
          SoloShift
        </p>
        <p className="text-sm text-slate-500">{nickname}님의 오늘 근무 흐름</p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {navItems.map((item) => {
          const isCurrent = current === item.key;

          return (
            <Link
              aria-current={isCurrent ? "page" : undefined}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                isCurrent
                  ? "border border-orange-200 bg-orange-100 text-slate-950 shadow-sm"
                  : "border border-[var(--line)] bg-white text-slate-700 hover:bg-slate-50"
              }`}
              href={item.href}
              key={item.key}
            >
              {item.label}
            </Link>
          );
        })}
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
