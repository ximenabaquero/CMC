import type { StorageAdapter } from "./adapter";

/**
 * Selección del driver por variable de entorno STORAGE_DRIVER:
 *   local → desarrollo (sistema de archivos, sin credenciales)
 *   r2    → producción (binding de Cloudflare R2)
 * Import dinámico para que el bundle del Worker no incluya node:fs.
 */
export async function getStorageAdapter(): Promise<StorageAdapter> {
  const driver = process.env.STORAGE_DRIVER ?? "local";
  if (driver === "r2") {
    const { r2StorageAdapter } = await import("./r2");
    return r2StorageAdapter;
  }
  const { localStorageAdapter } = await import("./local");
  return localStorageAdapter;
}
