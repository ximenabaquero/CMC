/**
 * Adaptador de almacenamiento para las imágenes cargadas desde el CMS.
 *
 * Implementaciones:
 *  - r2.ts    → Cloudflare R2 mediante el binding MEDIA_BUCKET (producción).
 *  - local.ts → sistema de archivos local (.uploads-local/, solo desarrollo,
 *               sin credenciales).
 *
 * Los activos oficiales versionados en public/ (storage_provider = STATIC)
 * NO pasan por este adaptador: su URL es su propia ruta bajo /.
 */
export interface StoredObject {
  body: ReadableStream | Uint8Array;
  contentType: string;
  size?: number;
}

export interface StorageAdapter {
  /** Guarda un objeto bajo la clave dada. */
  put(key: string, data: Uint8Array, contentType: string): Promise<void>;
  /** Elimina el objeto (ignora claves inexistentes). */
  delete(key: string): Promise<void>;
  /** Recupera el objeto o null si no existe (usado por /api/media). */
  get(key: string): Promise<StoredObject | null>;
  /**
   * URL pública bajo la cual el sitio sirve el objeto.
   * Ambos drivers sirven a través de /api/media/<clave>, de modo que la
   * URL guardada en media_assets.public_url es estable entre entornos.
   */
  publicUrl(key: string): string;
}

export const MEDIA_ROUTE_PREFIX = "/api/media";

export const ALLOWED_MIME_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
};

export function maxUploadBytes(): number {
  const mb = Number(process.env.MAX_UPLOAD_MB ?? "5");
  return (Number.isFinite(mb) && mb > 0 ? mb : 5) * 1024 * 1024;
}
