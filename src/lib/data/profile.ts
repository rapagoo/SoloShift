import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Profile } from "@/lib/types";

export async function getProfileByUserId(userId: string) {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  return (data as Profile | null) ?? null;
}
