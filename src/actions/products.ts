"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { altTextSchema, productSchema, slugSchema } from "@/lib/validation";
import {
  DB_ERROR_MESSAGE,
  actionError,
  actionSuccess,
  zodActionError,
  type ActionState,
} from "@/lib/action-state";
import { saveUploadedImage, deleteManagedAsset } from "@/lib/media-upload";
import { saveUploadedDocument } from "@/lib/document-upload";
import { CACHE_TAGS, revalidatePublicContent } from "@/lib/revalidate";
import type { ProductFeature } from "@/lib/supabase/types";

type SupabaseServer = Awaited<ReturnType<typeof createSupabaseServerClient>>;

/**
 * Elimina un asset del almacenamiento si ya no lo referencia ninguna
 * galería, imagen principal ni ficha técnica (los STATIC nunca se
 * borran: deleteManagedAsset los rechaza y aquí solo se desvinculan).
 */
async function deleteAssetIfOrphan(supabase: SupabaseServer, mediaId: string): Promise<void> {
  const [{ data: inGalleries }, { data: usedAsMain }, { data: usedAsSheet }] = await Promise.all([
    supabase.from("product_media").select("id").eq("media_asset_id", mediaId).limit(1),
    supabase.from("products").select("id").eq("main_image_id", mediaId).limit(1),
    supabase.from("products").select("id").eq("technical_sheet_media_id", mediaId).limit(1),
  ]);
  if (
    (inGalleries?.length ?? 0) === 0 &&
    (usedAsMain?.length ?? 0) === 0 &&
    (usedAsSheet?.length ?? 0) === 0
  ) {
    await deleteManagedAsset(supabase, mediaId);
  }
}

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
  if (!name) {
    return actionError("El nombre es obligatorio.", { name: ["El nombre es obligatorio."] });
  }
  if (!slugResult.success) {
    const message = slugResult.error.issues[0]?.message ?? "Slug inválido.";
    return actionError(message, { slug: [message] });
  }

  const { data, error } = await supabase
    .from("products")
    .insert({ name, slug: slugResult.data, status: "DRAFT", updated_by: userId })
    .select("id")
    .single();

  if (error || !data) {
    if (error?.code === "23505") {
      return actionError("Ya existe un producto con ese slug.", {
        slug: ["Ya existe un producto con ese slug."],
      });
    }
    return actionError(DB_ERROR_MESSAGE);
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
    return actionError(features.error);
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
    return zodActionError(parsed.error);
  }

  const { error } = await supabase
    .from("products")
    .update({ ...parsed.data, updated_by: userId })
    .eq("id", productId);

  if (error) {
    if (error.code === "23505") {
      return actionError("Ya existe un producto con ese slug.", {
        slug: ["Ya existe un producto con ese slug."],
      });
    }
    return actionError(DB_ERROR_MESSAGE);
  }

  revalidatePublicContent(CACHE_TAGS.products);
  revalidatePath(`/admin/productos/${productId}`);
  return actionSuccess("Producto guardado. El sitio público se actualizó.");
}

export async function deleteProduct(
  productId: string,
  _prev: ActionState,
  _formData: FormData
): Promise<ActionState> {
  await requireAdmin();
  const supabase = await createSupabaseServerClient();

  const { error } = await supabase.from("products").delete().eq("id", productId);
  if (error) {
    return actionError("No se pudo eliminar el producto. Intenta de nuevo.");
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
    return actionError(result.error ?? "No se pudo subir la imagen.");
  }

  const { data: existing } = await supabase
    .from("product_media")
    .select("sort_order")
    .eq("product_id", productId)
    .order("sort_order", { ascending: false })
    .limit(1);

  // Galería 0-based: la posición 0 es la imagen principal.
  const nextOrder = existing?.length ? existing[0].sort_order + 1 : 0;

  const { error } = await supabase.from("product_media").insert({
    product_id: productId,
    media_asset_id: result.mediaId,
    sort_order: nextOrder,
  });

  if (error) {
    await deleteManagedAsset(supabase, result.mediaId);
    return actionError(DB_ERROR_MESSAGE);
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
  return actionSuccess("La imagen se cargó correctamente.");
}

/**
 * Marca una imagen de la galería como imagen principal. Operación
 * atómica en la base (rpc set_product_main_image): actualiza
 * main_image_id, valida que la imagen pertenezca a la galería y
 * renumera la galería (elegida = 0, resto 1..n) sin posibilidad de
 * dos imágenes en la posición 0.
 */
export async function setProductMainImage(
  productId: string,
  mediaId: string,
  _prev: ActionState,
  _formData: FormData
): Promise<ActionState> {
  await requireAdmin();
  const supabase = await createSupabaseServerClient();

  const { error } = await supabase.rpc("set_product_main_image", {
    p_product_id: productId,
    p_media_asset_id: mediaId,
  });
  if (error) return actionError("No se pudo actualizar la imagen principal.");

  revalidatePublicContent(CACHE_TAGS.products);
  revalidatePath(`/admin/productos/${productId}`);
  return actionSuccess("La imagen principal fue actualizada.");
}

/**
 * Sube o baja una imagen secundaria de la galería (posiciones >= 1).
 * La posición 0 solo cambia con "Usar como principal".
 */
export async function moveProductImage(
  productId: string,
  mediaId: string,
  direction: "up" | "down",
  _prev: ActionState,
  _formData: FormData
): Promise<ActionState> {
  await requireAdmin();
  const supabase = await createSupabaseServerClient();

  const { error } = await supabase.rpc("swap_product_media_order", {
    p_product_id: productId,
    p_media_asset_id: mediaId,
    p_direction: direction,
  });
  if (error) return actionError("No se pudo reordenar la galería.");

  revalidatePublicContent(CACHE_TAGS.products);
  revalidatePath(`/admin/productos/${productId}`);
  // Éxito silencioso: el nuevo orden es visible de inmediato.
  return actionSuccess(null);
}

/** Actualiza el texto alternativo de una imagen de la galería. */
export async function updateMediaAltText(
  mediaId: string,
  productId: string,
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const { userId } = await requireAdmin();
  const supabase = await createSupabaseServerClient();

  const alt = altTextSchema.safeParse(formData.get("alt_text"));
  if (!alt.success) {
    const message = alt.error.issues[0]?.message ?? "Texto alternativo inválido.";
    return actionError(message, { alt_text: [message] });
  }

  const { error } = await supabase
    .from("media_assets")
    .update({ alt_text: alt.data, updated_by: userId })
    .eq("id", mediaId);
  if (error) return actionError(DB_ERROR_MESSAGE);

  revalidatePublicContent(CACHE_TAGS.products);
  revalidatePath(`/admin/productos/${productId}`);
  return actionSuccess("Texto alternativo actualizado.");
}

/**
 * Quita una imagen de la galería (rpc remove_product_media_entry:
 * borra, renumera 0..n y promueve nueva principal si hacía falta).
 * Si el archivo fue subido desde el CMS (proveedor R2) y no se usa
 * en otro lugar, también se elimina del almacenamiento; los activos
 * STATIC solo se desvinculan.
 */
export async function removeProductImage(
  productId: string,
  mediaId: string,
  _prev: ActionState,
  _formData: FormData
): Promise<ActionState> {
  await requireAdmin();
  const supabase = await createSupabaseServerClient();

  const { error } = await supabase.rpc("remove_product_media_entry", {
    p_product_id: productId,
    p_media_asset_id: mediaId,
  });
  if (error) return actionError("No se pudo quitar la imagen de la galería.");

  await deleteAssetIfOrphan(supabase, mediaId);

  revalidatePublicContent(CACHE_TAGS.products);
  revalidatePath(`/admin/productos/${productId}`);
  return actionSuccess("Imagen quitada de la galería.");
}

/** Sube (o reemplaza) la ficha técnica PDF del producto. */
export async function uploadTechnicalSheet(
  productId: string,
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const { userId } = await requireAdmin();
  const supabase = await createSupabaseServerClient();

  const { data: product } = await supabase
    .from("products")
    .select("name, technical_sheet_media_id")
    .eq("id", productId)
    .maybeSingle();
  if (!product) {
    return actionError("El producto no existe.");
  }

  const rawName = formData.get("display_name");
  const displayName =
    typeof rawName === "string" && rawName.trim() !== ""
      ? rawName
      : `Ficha técnica de ${product.name}`;

  const file = formData.get("file");
  const result = await saveUploadedDocument(
    supabase,
    file instanceof File ? file : null,
    displayName,
    userId
  );
  if (result.error || !result.mediaId) {
    return actionError(result.error ?? "No se pudo subir la ficha técnica.");
  }

  const { error } = await supabase
    .from("products")
    .update({ technical_sheet_media_id: result.mediaId, updated_by: userId })
    .eq("id", productId);
  if (error) {
    await deleteManagedAsset(supabase, result.mediaId);
    return actionError(DB_ERROR_MESSAGE);
  }

  // Limpiar la ficha anterior si quedó huérfana (los STATIC solo se desvinculan).
  const previousSheetId = product.technical_sheet_media_id;
  const replaced = previousSheetId !== null && previousSheetId !== result.mediaId;
  if (replaced) {
    await deleteAssetIfOrphan(supabase, previousSheetId);
  }

  revalidatePublicContent(CACHE_TAGS.products);
  revalidatePath(`/admin/productos/${productId}`);
  return actionSuccess(
    replaced
      ? "La ficha técnica fue reemplazada. El sitio público se actualizó."
      : "Ficha técnica guardada. El sitio público se actualizó."
  );
}

/** Quita la ficha técnica del producto (y borra el PDF huérfano si era del CMS). */
export async function removeTechnicalSheet(
  productId: string,
  _prev: ActionState,
  _formData: FormData
): Promise<ActionState> {
  const { userId } = await requireAdmin();
  const supabase = await createSupabaseServerClient();

  const { data: product } = await supabase
    .from("products")
    .select("technical_sheet_media_id")
    .eq("id", productId)
    .maybeSingle();
  if (!product?.technical_sheet_media_id) return actionSuccess(null);

  const previousId = product.technical_sheet_media_id;
  const { error } = await supabase
    .from("products")
    .update({ technical_sheet_media_id: null, updated_by: userId })
    .eq("id", productId);
  if (error) return actionError("No se pudo quitar la ficha técnica.");

  await deleteAssetIfOrphan(supabase, previousId);

  revalidatePublicContent(CACHE_TAGS.products);
  revalidatePath(`/admin/productos/${productId}`);
  return actionSuccess("Ficha técnica eliminada.");
}
