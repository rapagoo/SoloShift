import { z } from "zod";

import { getPublicEnv } from "@/lib/env";

const serverEnvSchema = z.object({
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
});

export function getServerEnv() {
  const publicEnv = getPublicEnv();

  if (!publicEnv.success) {
    return publicEnv;
  }

  const serverEnv = serverEnvSchema.safeParse({
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  });

  if (!serverEnv.success) {
    return serverEnv;
  }

  return {
    success: true as const,
    data: {
      ...publicEnv.data,
      SUPABASE_SERVICE_ROLE_KEY: serverEnv.data.SUPABASE_SERVICE_ROLE_KEY,
    },
  };
}

export function hasServerSupabaseEnv() {
  return getServerEnv().success;
}

export function requireServerEnv() {
  const parsed = getServerEnv();

  if (!parsed.success) {
    throw new Error("Supabase server environment variables are missing.");
  }

  return parsed.data;
}

