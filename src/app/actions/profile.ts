"use server";

import { revalidatePath } from "next/cache";

import { requireUser } from "@/lib/auth";
import { getProfileFormValues, profileSchema } from "@/lib/profile-validation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ActionState } from "@/lib/types";

export async function saveProfileAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();
  const parsed = profileSchema.safeParse(getProfileFormValues(formData));

  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message };
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("profiles")
    .upsert({
      id: user.id,
      ...parsed.data,
    })
    .select("id")
    .single();

  if (error || !data) {
    return { ok: false, error: "프로필 저장에 실패했습니다. 잠시 후 다시 시도해주세요." };
  }

  revalidatePath("/");
  revalidatePath("/office");
  revalidatePath("/dashboard");
  revalidatePath("/history");

  return { ok: true, message: "프로필 설정을 저장했습니다." };
}
