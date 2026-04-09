import { cookies } from "next/headers";

import { createServerClient } from "@supabase/ssr";

import { requirePublicEnv } from "@/lib/env";

export async function createSupabaseServerClient() {
  const env = requirePublicEnv();
  const cookieStore = await cookies();

  return createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Route handlers and server components can ignore cookie writes here.
          }
        },
      },
    },
  );
}
