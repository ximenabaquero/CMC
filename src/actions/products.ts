"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { productSchema, slugSchema } from "@/lib/validation";
import { DB_ERROR_MESSAGE, type ActionState } from "@/lib/action-state";
import { saveUploadedImage, deleteManagedAsset } from "@/lib/media-upload";
import { CACHE_TAGS, revalidatePublicContent } from "@/lib/revalidate";
import type { ProductFeature } from "@/lib/supabase/types";

function parseFeatures(raw: unknown): ProductFeature[] | { error: string } {
  if (typeof raw !== "string" || raw.trim() === "") return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    const result = productSchema.shape.features.safeParse(parsed);
    if (!result.success) {
      return { error: result.error.issues[0]?.message ?? "Características inválidas." };
    }
    return result.data;
  } catch {
    return { error: "No se pudieron leer las características." };
  }
}

export async function createProduct(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { userId } = await requireAdmin();
  const supabase = await createSupabaseServerClient();

  const name = String(formData.get("name") ?? "").trim();
  const slugResult = slugSchema.safeParse(formData.get("slug"));
  if (!name) return { success: null, error: "El nombre es obligatorio." };
  if (!slugResult.success) {
    return { success: null, error: slugResult.error.issues[0]?.message ?? "Slug inválido." };
  }

  const { data, error } = await supabase
    .from("products")
    .insert({ name, slug: slugResult.data, status: "DRAFT", updated_by: userId })
    .select("id")
    .single();

  if (error || !data) {
    if (error?.code === "23505") {
      return { success: null, error: "Ya existe un producto con ese slug." };
    }
    return { success: null, error: DB_ERROR_MESSAGE };
  }

  redirect(`/admin/productos/${data.id}?creado=1`);
}

export async function updateProduct(
  productId: string,
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const { userId } = await requireAdmin();
  const supabase = await createSupabaseServerClient();

  const features = parseFeatures(formData.get("features_json"));
  if ("error" in features && !Array.isArray(features)) {
    return { success: null, error: features.error };
  }

  const parsed = productSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    short_description: formData.get("short_description"),
    description: formData.get("description"),
    category_id: formData.get("category_id"),
    presentation: formData.get("presentation"),
    sort_order: formData.get("sort_order"),
    status: formData.get("status"),
    seo_title: formData.get("seo_title"),
    seo_description: formData.get("seo_description"),
    features,
  });

  if (!parsed.success) {
    return { success: null, error: parsed.error.issues[0]?.message ?? "Revisa los campos del formulario." };
  }

  const { error } = await supabase
    .from("products")
    .update({ ...parsed.data, updated_by: userId })
    .eq("id", productId);

  if (error) {
    if (error.code === "23505") {
      return { success: null, error: "Ya existe un producto con ese slug." };
    }
    return { success: null, error: DB_ERROR_MESSAGE };
  }

  revalidatePublicContent(CACHE_TAGS.products);
  revalidatePath(`/admin/productos/${productId}`);
  return { success: "Producto guardado. El sitio público se actualizó.", error: null };
}

export async function deleteProduct(productId: string): Promise<void> {
  await requireAdmin();
  const supabase = await createSupabaseServerClient();

  const { error } = await supabase.from("products").delete().eq("id", productId);
  if (error) {
    throw new Error("No se pudo eliminar el producto.");
  }

  revalidatePublicContent(CACHE_TAGS.products);
  redirect("/admin/productos?eliminado=1");
}

/** Sube una imagen y la agrega a la galería del producto. */
export async function uploadProductImage(
  productId: string,
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const { userId } = await requireAdmin();
  const supabase = await createSupabaseServerClient();

  const file = formData.get("file");
  const result = await saveUploadedImage(
    supabase,
    file instanceof File ? file : null,
    formData.get("alt_text"),
    userId
  );
  if (result.error || !result.mediaId) {
    return { success: null, error: result.error ?? "No se pudo subir la imagen." };
  }

  const { data: existing } = await supabase
    .from("product_media")
    .select("sort_order")
    .eq("product_id", productId)
    .order("sort_order", { ascending: false })
    .limit(1);

  const nextOrder = (existing?.[0]?.sort_order ?? 0) + 1;

  const { error } = await supabase.from("product_media").insert({
    product_id: productId,
    media_asset_id: result.mediaId,
    sort_order: nextOrder,
  });

  if (error) {
    await deleteManagedAsset(supabase, result.mediaId);
    return { success: null, error: DB_ERROR_MESSAGE };
  }

  // Si el producto no tiene imagen principal, usar esta.
  const { data: product } = await supabase
    .from("products")
    .select("main_image_id")
    .eq("id", productId)
    .maybeSingle();
  if (product && !product.main_image_id) {
    await supabase.from("products").update({ main_image_id: result.mediaId }).eq("id", productId);
  }

  revalidatePublicContent(CACHE_TAGS.products);
  revalidatePath(`/admin/productos/${productId}`);
  return { success: "Imagen agregada a la galería.", error: null };
}

/** Marca una imagen de la galería como imagen principal. */
export async function setProductMainImage(productId: string, mediaId: string): Promise<void> {
  await requireAdmin();
  const supabase = await createSupabaseServerClient();

  const { error } = await supabase
    .from("products")
    .update({ main_image_id: mediaId })
    .eq("id", productId);
  if (error) throw new Error("No se pudo actualizar la imagen principal.");

  revalidatePublicContent(CACHE_TAGS.products);
  revalidatePath(`/admin/productos/${productId}`);
}

/**
 * Quita una imagen de la galería. Si el archivo fue subido desde el
 * CMS (proveedor R2) y no se usa en otro lugar, también se elimina
 * del almacenamiento. Los activos STATIC solo se desvinculan.
 */
export async function removeProductImage(productId: string, mediaId: string): Promise<void> {
  await requireAdmin();
  const supabase = await createSupabaseServerClient();

  const { error } = await supabase
    .from("product_media")
    .delete()
    .eq("product_id", productId)
    .eq("media_asset_id", mediaId);
  if (error) throw new Error("No se pudo quitar la imagen de la galería.");

  // Si era la imagen principal, elegir otra o dejar vacío.
  const { data: product } = await supabase
    .from("products")
    .select("main_image_id")
    .eq("id", productId)
    .maybeSingle();
  if (product?.main_image_id === mediaId) {
    const { data: rest } = await supabase
      .from("product_media")
      .select("media_asset_id")
      .eq("product_id", productId)
      .order("sort_order")
      .limit(1);
    await supabase
      .from("products")
      .update({ main_image_id: rest?.[0]?.media_asset_id ?? null })
      .eq("id", productId);
  }

  // Eliminar el archivo si ya no está referenciado (solo R2).
  const [{ data: stillUsed }, { data: usedAsMain }] = await Promise.all([
    supabase.from("product_media").select("id").eq("media_asset_id", mediaId).limit(1),
    supabase.from("products").select("id").eq("main_image_id", mediaId).limit(1),
  ]);
  if ((stillUsed?.length ?? 0) === 0 && (usedAsMain?.length ?? 0) === 0) {
    await deleteManagedAsset(supabase, mediaId);
  }

  revalidatePublicContent(CACHE_TAGS.products);
  revalidatePath(`/admin/productos/${productId}`);
}
