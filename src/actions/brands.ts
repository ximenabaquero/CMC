"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { brandSchema } from "@/lib/validation";
import {
  DB_ERROR_MESSAGE,
  actionError,
  actionSuccess,
  zodActionError,
  type ActionState,
} from "@/lib/action-state";
import { saveUploadedImage, deleteManagedAsset } from "@/lib/media-upload";
import { CACHE_TAGS, revalidatePublicContent } from "@/lib/revalidate";

type SupabaseServer = Awaited<ReturnType<typeof createSupabaseServerClient>>;

/**
 * Elimina el archivo del logo si ninguna otra marca lo referencia
 * (deleteManagedAsset ya ignora los activos STATIC).
 */
async function cleanupOrphanLogo(supabase: SupabaseServer, mediaId: string | null) {
  if (!mediaId) return;
  const { data: stillUsed } = await supabase
    .from("brands")
    .select("id")
    .eq("logo_media_id", mediaId)
    .limit(1);
  if ((stillUsed?.length ?? 0) === 0) {
    await deleteManagedAsset(supabase, mediaId);
  }
}

export async function createBrand(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { userId } = await requireAdmin();
  const supabase = await createSupabaseServerClient();

  const name = String(formData.get("name") ?? "").trim();
  if (!name) {
    return actionError("El nombre es obligatorio.", { name: ["El nombre es obligatorio."] });
  }

  const { data, error } = await supabase
    .from("brands")
    .insert({ name, status: "DRAFT", updated_by: userId })
    .select("id")
    .single();
  if (error || !data) return actionError(DB_ERROR_MESSAGE);

  // Un borrador no cambia el sitio público: no hay nada que revalidar.
  redirect(`/admin/marcas/${data.id}?creado=1`);
}

export async function updateBrand(
  brandId: string,
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const { userId } = await requireAdmin();
  const supabase = await createSupabaseServerClient();

  const parsed = brandSchema.safeParse({
    name: formData.get("name"),
    website_url: formData.get("website_url"),
    sort_order: formData.get("sort_order"),
    status: formData.get("status"),
    internal_note: formData.get("internal_note"),
  });
  if (!parsed.success) {
    return zodActionError(parsed.error);
  }

  if (parsed.data.status === "PUBLISHED") {
    const { data: brand } = await supabase
      .from("brands")
      .select("logo_media_id")
      .eq("id", brandId)
      .maybeSingle();
    if (!brand?.logo_media_id) {
      return actionError("Sube el logo antes de publicar la marca.");
    }
  }

  const { error } = await supabase
    .from("brands")
    .update({ ...parsed.data, updated_by: userId })
    .eq("id", brandId);
  if (error) return actionError(DB_ERROR_MESSAGE);

  revalidatePublicContent(CACHE_TAGS.brands);
  revalidatePath(`/admin/marcas/${brandId}`);
  return actionSuccess("Marca guardada. El sitio público se actualizó.");
}

export async function deleteBrand(
  brandId: string,
  _prev: ActionState,
  _formData: FormData
): Promise<ActionState> {
  await requireAdmin();
  const supabase = await createSupabaseServerClient();

  const { data: brand } = await supabase
    .from("brands")
    .select("logo_media_id")
    .eq("id", brandId)
    .maybeSingle();

  const { error } = await supabase.from("brands").delete().eq("id", brandId);
  if (error) return actionError("No se pudo eliminar la marca. Intenta de nuevo.");

  await cleanupOrphanLogo(supabase, brand?.logo_media_id ?? null);

  revalidatePublicContent(CACHE_TAGS.brands);
  redirect("/admin/marcas?eliminado=1");
}

/** Sube el logo de la marca (reemplaza el anterior si existía). */
export async function uploadBrandLogo(
  brandId: string,
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const { userId } = await requireAdmin();
  const supabase = await createSupabaseServerClient();

  const { data: brand } = await supabase
    .from("brands")
    .select("logo_media_id")
    .eq("id", brandId)
    .maybeSingle();
  if (!brand) return actionError("La marca no existe.");

  const file = formData.get("file");
  const result = await saveUploadedImage(
    supabase,
    file instanceof File ? file : null,
    formData.get("alt_text"),
    userId
  );
  if (result.error || !result.mediaId) {
    return actionError(result.error ?? "No se pudo subir el logo.");
  }

  const { error } = await supabase
    .from("brands")
    .update({ logo_media_id: result.mediaId, updated_by: userId })
    .eq("id", brandId);
  if (error) {
    await deleteManagedAsset(supabase, result.mediaId);
    return actionError(DB_ERROR_MESSAGE);
  }

  await cleanupOrphanLogo(supabase, brand.logo_media_id);

  revalidatePublicContent(CACHE_TAGS.brands);
  revalidatePath(`/admin/marcas/${brandId}`);
  return actionSuccess("Logo actualizado.");
}

/**
 * Quita el logo de la marca. Si estaba publicada, vuelve a borrador:
 * una marca sin logo no puede seguir visible en el carrusel.
 */
export async function removeBrandLogo(
  brandId: string,
  _prev: ActionState,
  _formData: FormData
): Promise<ActionState> {
  const { userId } = await requireAdmin();
  const supabase = await createSupabaseServerClient();

  const { data: brand } = await supabase
    .from("brands")
    .select("logo_media_id")
    .eq("id", brandId)
    .maybeSingle();
  if (!brand?.logo_media_id) return actionSuccess(null);

  const { error } = await supabase
    .from("brands")
    .update({ logo_media_id: null, status: "DRAFT", updated_by: userId })
    .eq("id", brandId);
  if (error) return actionError("No se pudo quitar el logo.");

  await cleanupOrphanLogo(supabase, brand.logo_media_id);

  revalidatePublicContent(CACHE_TAGS.brands);
  revalidatePath(`/admin/marcas/${brandId}`);
  return actionSuccess("Logo eliminado. La marca volvió a borrador.");
}
