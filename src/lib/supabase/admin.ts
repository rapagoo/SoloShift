import "server-only";

import { createClient } from "@supabase/supabase-js";

import { requireServerEnv } from "@/lib/server-env";

export function createSupabaseAdminClient() {
  const env = requireServerEnv();

  return createClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_SECRET_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}


