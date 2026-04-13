import { redirect } from "next/navigation";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { SetupCard } from "@/components/setup-card";
import { TopNav } from "@/components/top-nav";
import { getOptionalSession, isProfileComplete } from "@/lib/auth";
import { getTodayDashboard } from "@/lib/data/dashboard";
import { getProfileByUserId } from "@/lib/data/profile";
import { hasServerSupabaseEnv } from "@/lib/server-env";

export default async function DashboardPage() {
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

  const dashboard = await getTodayDashboard(user.id, profile);

  return (
    <main className="mx-auto min-h-screen max-w-7xl px-4 py-6 md:px-6 md:py-8">
      <TopNav current="home" nickname={profile.nickname} />
      <DashboardShell dashboard={dashboard} profile={profile} />
    </main>
  );
}
