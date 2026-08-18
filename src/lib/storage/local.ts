import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { MEDIA_ROUTE_PREFIX, type StorageAdapter, type StoredObject } from "./adapter";

/**
 * Adaptador local para DESARROLLO: guarda los archivos en
 * .uploads-local/ (fuera de git) y los sirve por /api/media.
 * No requiere credenciales productivas.
 */
const BASE_DIR = path.join(process.cwd(), ".uploads-local");

function resolveSafe(key: string): string {
  const target = path.normalize(path.join(BASE_DIR, key));
  if (!target.startsWith(BASE_DIR)) {
    throw new Error("Clave de archivo inválida.");
  }
  return target;
}

const contentTypeByExt: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".pdf": "application/pdf",
};

export const localStorageAdapter: StorageAdapter = {
  // El contentType se infiere por extensión al servir; no se necesita aquí.
  async put(key, data) {
    const target = resolveSafe(key);
    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(target, data);
  },

  async delete(key) {
    const target = resolveSafe(key);
    if (existsSync(target)) {
      await unlink(target);
    }
  },

  async get(key): Promise<StoredObject | null> {
    const target = resolveSafe(key);
    if (!existsSync(target)) return null;
    const body = new Uint8Array(await readFile(target));
    const contentType = contentTypeByExt[path.extname(target).toLowerCase()] ?? "application/octet-stream";
    return { body, contentType, size: body.byteLength };
  },

  publicUrl(key) {
    return `${MEDIA_ROUTE_PREFIX}/${key}`;
  },
};
