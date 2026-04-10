import { redirect } from "next/navigation";

import { Profile } from "@/lib/types";
import { hasServerSupabaseEnv } from "@/lib/server-env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function getOptionalSession() {
  if (!hasServerSupabaseEnv()) {
    return { user: null };
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { user };
}

export async function requireUser() {
  const { user } = await getOptionalSession();

  if (!user) {
    redirect("/login");
  }

  return user;
}

export function isProfileComplete(profile: Profile | null) {
  return Boolean(
    profile?.nickname && profile?.timezone && profile?.default_check_in_time,
  );
}

