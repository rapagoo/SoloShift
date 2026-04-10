import { NextRequest } from "next/server";

import { hasServerSupabaseEnv } from "@/lib/server-env";
import { updateSession } from "@/lib/supabase/middleware";

export async function proxy(request: NextRequest) {
  if (!hasServerSupabaseEnv()) {
    return undefined;
  }

  return updateSession(request);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

