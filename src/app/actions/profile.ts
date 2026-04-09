"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { DEFAULT_CHECK_IN_TIME, DEFAULT_TIMEZONE } from "@/lib/constants";
import { requireUser } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ActionState } from "@/lib/types";

const profileSchema = z.object({
  nickname: z.string().trim().min(1, "닉네임을 입력해주세요."),
  timezone: z.string().trim().min(1),
  default_check_in_time: z
    .string()
    .regex(/^\d{2}:\d{2}$/, "출근 시각 형식이 올바르지 않습니다."),
});

export async function saveProfileAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();
  const parsed = profileSchema.safeParse({
    nickname: formData.get("nickname"),
    timezone: formData.get("timezone") || DEFAULT_TIMEZONE,
    default_check_in_time:
      formData.get("default_check_in_time") || DEFAULT_CHECK_IN_TIME,
  });

  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("profiles").upsert({
    id: user.id,
    ...parsed.data,
  });

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath("/");
  revalidatePath("/history");
  redirect("/");
}

export async function submitProfileAction(formData: FormData) {
  const result = await saveProfileAction({ ok: false }, formData);

  if (result.error) {
    throw new Error(result.error);
  }
}
