"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { faqSchema } from "@/lib/validation";
import {
  DB_ERROR_MESSAGE,
  actionError,
  actionSuccess,
  zodActionError,
  type ActionState,
} from "@/lib/action-state";
import { CACHE_TAGS, revalidatePublicContent } from "@/lib/revalidate";

function parseFaqForm(formData: FormData) {
  return faqSchema.safeParse({
    question: formData.get("question"),
    answer: formData.get("answer"),
    sort_order: formData.get("sort_order"),
    status: formData.get("status"),
    featured: formData.get("featured") === "on",
  });
}

export async function createFaq(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { userId } = await requireAdmin();
  const supabase = await createSupabaseServerClient();

  const parsed = parseFaqForm(formData);
  if (!parsed.success) {
    return zodActionError(parsed.error);
  }

  const { error } = await supabase.from("faqs").insert({ ...parsed.data, updated_by: userId });
  if (error) return actionError(DB_ERROR_MESSAGE);

  revalidatePublicContent(CACHE_TAGS.faqs);
  redirect("/admin/preguntas-frecuentes?creado=1");
}

export async function updateFaq(
  faqId: string,
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const { userId } = await requireAdmin();
  const supabase = await createSupabaseServerClient();

  const parsed = parseFaqForm(formData);
  if (!parsed.success) {
    return zodActionError(parsed.error);
  }

  const { error } = await supabase
    .from("faqs")
    .update({ ...parsed.data, updated_by: userId })
    .eq("id", faqId);
  if (error) return actionError(DB_ERROR_MESSAGE);

  revalidatePublicContent(CACHE_TAGS.faqs);
  revalidatePath(`/admin/preguntas-frecuentes/${faqId}`);
  return actionSuccess("Pregunta guardada. El sitio público se actualizó.");
}

export async function deleteFaq(
  faqId: string,
  _prev: ActionState,
  _formData: FormData
): Promise<ActionState> {
  await requireAdmin();
  const supabase = await createSupabaseServerClient();

  const { error } = await supabase.from("faqs").delete().eq("id", faqId);
  if (error) return actionError("No se pudo eliminar la pregunta. Intenta de nuevo.");

  revalidatePublicContent(CACHE_TAGS.faqs);
  redirect("/admin/preguntas-frecuentes?eliminado=1");
}
