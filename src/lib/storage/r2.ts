import type { R2Bucket } from "@cloudflare/workers-types/experimental";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { MEDIA_ROUTE_PREFIX, type StorageAdapter, type StoredObject } from "./adapter";

/**
 * Adaptador de producción: Cloudflare R2 mediante el binding
 * MEDIA_BUCKET declarado en wrangler.jsonc. No usa credenciales en
 * código: el binding lo inyecta el runtime de Workers.
 */
function getBucket(): R2Bucket {
  const { env } = getCloudflareContext();
  const bucket = (env as unknown as { MEDIA_BUCKET?: R2Bucket }).MEDIA_BUCKET;
  if (!bucket) {
    throw new Error(
      "El binding MEDIA_BUCKET de R2 no está disponible. Revisa wrangler.jsonc y el entorno de despliegue."
    );
  }
  return bucket;
}

export const r2StorageAdapter: StorageAdapter = {
  async put(key, data, contentType) {
    await getBucket().put(key, data, {
      httpMetadata: { contentType, cacheControl: "public, max-age=31536000, immutable" },
    });
  },

  async delete(key) {
    await getBucket().delete(key);
  },

  async get(key): Promise<StoredObject | null> {
    const object = await getBucket().get(key);
    if (!object) return null;
    return {
      // El ReadableStream de workers-types es el mismo objeto en runtime
      // que el del DOM; solo difieren las declaraciones.
      body: object.body as unknown as ReadableStream,
      contentType: object.httpMetadata?.contentType ?? "application/octet-stream",
      size: object.size,
    };
  },

  publicUrl(key) {
    return `${MEDIA_ROUTE_PREFIX}/${key}`;
  },
};
