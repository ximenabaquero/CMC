import type { MediaAsset } from "@/lib/supabase/types";

/**
 * Resuelve la URL pública de un activo según su proveedor.
 *  - STATIC: la ruta versionada bajo public/ (storage_path ya es la URL).
 *  - R2: la URL registrada al subir el archivo por el adaptador
 *    (siempre /api/media/<clave>).
 * Nunca se genera una URL de R2 para un archivo STATIC ni viceversa.
 */
export function mediaUrl(asset: Pick<MediaAsset, "storage_provider" | "storage_path" | "public_url">): string {
  if (asset.storage_provider === "STATIC") {
    return asset.storage_path;
  }
  if (!asset.public_url) {
    throw new Error(`El activo R2 "${asset.storage_path}" no tiene public_url registrada.`);
  }
  return asset.public_url;
}
