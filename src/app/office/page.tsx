import { redirect } from "next/navigation";

import { OfficeShell } from "@/components/office/office-shell";
import { SetupCard } from "@/components/setup-card";
import { TopNav } from "@/components/top-nav";
import { getOptionalSession, isProfileComplete } from "@/lib/auth";
import { getOfficeExperience } from "@/lib/data/office";
import { getProfileByUserId } from "@/lib/data/profile";
import { hasServerSupabaseEnv } from "@/lib/server-env";

interface OfficePageProps {
  searchParams?: Promise<{
    room?: string | string[];
    talk?: string | string[];
  }>;
}

export default async function OfficePage({ searchParams }: OfficePageProps) {
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

  const params = searchParams ? await searchParams : undefined;
  const room = firstValue(params?.room);
  const talk = firstValue(params?.talk);
  const office = await getOfficeExperience({
    userId: user.id,
    profile,
    room,
    talk,
  });

  return (
    <main className="mx-auto min-h-screen max-w-7xl px-4 py-6 md:px-6 md:py-8">
      <TopNav current="office" nickname={profile.nickname} />
      <OfficeShell experience={office} profile={profile} />
    </main>
  );
}

function firstValue(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}
