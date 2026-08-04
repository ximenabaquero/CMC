"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { companyContentSchema } from "@/lib/validation";
import { DB_ERROR_MESSAGE, type ActionState } from "@/lib/action-state";
import { CACHE_TAGS, revalidatePublicContent } from "@/lib/revalidate";

export async function updateCompanySection(
  sectionKey: string,
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const { userId } = await requireAdmin();
  const supabase = await createSupabaseServerClient();

  let pillars: unknown;
  const pillarsRaw = formData.get("pillars_json");
  if (typeof pillarsRaw === "string" && pillarsRaw.trim() !== "") {
    try {
      pillars = JSON.parse(pillarsRaw);
    } catch {
      return { success: null, error: "No se pudo leer la lista de pilares." };
    }
  }

  const parsed = companyContentSchema.safeParse({
    title: formData.get("title"),
    body: formData.get("body"),
    status: formData.get("status"),
    pillars,
  });

  if (!parsed.success) {
    return { success: null, error: parsed.error.issues[0]?.message ?? "Revisa los campos." };
  }

  const update: {
    title: string | null;
    body: string | null;
    status: "DRAFT" | "PUBLISHED";
    updated_by: string;
    data?: { items: { title: string; description: string }[] };
  } = {
    title: parsed.data.title ?? null,
    body: parsed.data.body ?? null,
    status: parsed.data.status,
    updated_by: userId,
  };
  if (parsed.data.pillars) {
    update.data = { items: parsed.data.pillars };
  }

  const { error } = await supabase
    .from("company_content")
    .update(update)
    .eq("section_key", sectionKey);

  if (error) return { success: null, error: DB_ERROR_MESSAGE };

  revalidatePublicContent(CACHE_TAGS.content);
  revalidatePath(`/admin/empresa/${sectionKey}`);
  return { success: "Sección guardada. El sitio público se actualizó.", error: null };
}
