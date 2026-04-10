import { redirect } from "next/navigation";

import { HistoryPanel } from "@/components/history/history-panel";
import { SetupCard } from "@/components/setup-card";
import { TopNav } from "@/components/top-nav";
import { getOptionalSession, isProfileComplete } from "@/lib/auth";
import { getHistoryEntries, getWeeklySummary } from "@/lib/data/history";
import { getProfileByUserId } from "@/lib/data/profile";
import { hasServerSupabaseEnv } from "@/lib/server-env";

export default async function HistoryPage() {
  if (!hasServerSupabaseEnv()) {
    return <SetupCard />;
  }

  const { user } = await getOptionalSession();

  if (!user) {
    redirect("/login");
  }

  const profile = await getProfileByUserId(user.id);

  if (!profile || !isProfileComplete(profile)) {
    redirect("/onboarding");
  }

  const [weeklySummary, entries] = await Promise.all([
    getWeeklySummary(user.id, profile),
    getHistoryEntries(user.id),
  ]);

  return (
    <main className="mx-auto min-h-screen max-w-7xl px-4 py-6 md:px-6 md:py-8">
      <TopNav current="history" nickname={profile.nickname} />
      <HistoryPanel entries={entries} profile={profile} weeklySummary={weeklySummary} />
    </main>
  );
}

