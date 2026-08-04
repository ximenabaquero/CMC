import "server-only";
import { ALLOWED_MIME_TYPES, maxUploadBytes } from "@/lib/storage/adapter";
import { getStorageAdapter } from "@/lib/storage";
import { altTextSchema } from "@/lib/validation";
import type { createSupabaseServerClient } from "@/lib/supabase/server";

type SupabaseServer = Awaited<ReturnType<typeof createSupabaseServerClient>>;

export interface UploadResult {
  mediaId?: string;
  error?: string;
}

/**
 * Valida y guarda una imagen subida desde el CMS:
 * tipo permitido (JPEG/PNG/WebP/AVIF), tamaño máximo configurable,
 * nombre único, texto alternativo obligatorio y registro de
 * metadatos en media_assets (proveedor R2 — gestionado por el
 * adaptador; en desarrollo el driver local usa la misma vía).
 */
export async function saveUploadedImage(
  supabase: SupabaseServer,
  file: File | null,
  altTextRaw: unknown,
  userId: string
): Promise<UploadResult> {
  if (!file || file.size === 0) {
    return { error: "Selecciona un archivo de imagen." };
  }

  const alt = altTextSchema.safeParse(altTextRaw);
  if (!alt.success) {
    return { error: alt.error.issues[0]?.message ?? "Texto alternativo inválido." };
  }

  const extension = ALLOWED_MIME_TYPES[file.type];
  if (!extension) {
    return { error: "Formato no permitido. Usa JPEG, PNG, WebP o AVIF." };
  }

  const limit = maxUploadBytes();
  if (file.size > limit) {
    return {
      error: `El archivo pesa ${(file.size / 1024 / 1024).toFixed(1)} MB y el máximo es ${Math.round(limit / 1024 / 1024)} MB. Reduce la imagen e inténtalo de nuevo.`,
    };
  }

  const key = `${crypto.randomUUID()}.${extension}`;
  const adapter = await getStorageAdapter();
  const bytes = new Uint8Array(await file.arrayBuffer());

  try {
    await adapter.put(key, bytes, file.type);
  } catch {
    return { error: "No se pudo guardar el archivo en el almacenamiento. Inténtalo de nuevo." };
  }

  const { data, error } = await supabase
    .from("media_assets")
    .insert({
      storage_provider: "R2",
      storage_path: key,
      public_url: adapter.publicUrl(key),
      file_name: file.name,
      mime_type: file.type,
      size_bytes: file.size,
      alt_text: alt.data,
      updated_by: userId,
    })
    .select("id")
    .single();

  if (error || !data) {
    // Evitar archivos huérfanos si falla el registro en la base.
    await adapter.delete(key).catch(() => undefined);
    return { error: "El archivo se subió pero no se pudo registrar. Inténtalo de nuevo." };
  }

  return { mediaId: data.id };
}

/**
 * Elimina un activo gestionado por el CMS (proveedor R2): borra el
 * objeto del almacenamiento y su registro. Los activos STATIC son
 * parte del proyecto: se pueden desvincular pero no eliminar aquí.
 */
export async function deleteManagedAsset(
  supabase: SupabaseServer,
  mediaId: string
): Promise<{ error?: string }> {
  const { data: asset, error } = await supabase
    .from("media_assets")
    .select("*")
    .eq("id", mediaId)
    .maybeSingle();

  if (error) return { error: "No se pudo consultar el archivo." };
  if (!asset) return {};

  if (asset.storage_provider === "STATIC") {
    return {
      error:
        "Esta imagen es un activo original del proyecto y no puede eliminarse desde el panel; solo puede desvincularse.",
    };
  }

  const adapter = await getStorageAdapter();
  await adapter.delete(asset.storage_path).catch(() => undefined);

  const { error: deleteError } = await supabase.from("media_assets").delete().eq("id", mediaId);
  if (deleteError) return { error: "No se pudo eliminar el registro del archivo." };
  return {};
}
