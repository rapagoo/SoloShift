import { z } from "zod";

const publicEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().min(1).optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1).optional(),
});

export function getPublicEnv() {
  const parsed = publicEnvSchema.safeParse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  });

  if (!parsed.success) {
    return parsed;
  }

  const publishableKey =
    parsed.data.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    parsed.data.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!publishableKey) {
    return {
      success: false as const,
      error: new z.ZodError([
        {
          code: "custom",
          message: "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY is required.",
          path: ["NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"],
        },
      ]),
    };
  }

  return {
    success: true as const,
    data: {
      NEXT_PUBLIC_SUPABASE_URL: parsed.data.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: publishableKey,
    },
  };
}

export function hasSupabaseEnv() {
  return getPublicEnv().success;
}

export function requirePublicEnv() {
  const parsed = getPublicEnv();

  if (!parsed.success) {
    throw new Error("Supabase environment variables are missing.");
  }

  return parsed.data;
}
