import { revalidatePath, revalidateTag } from "next/cache";

/**
 * Tags de caché del contenido público. Los fetchers de lib/content.ts
 * cachean con estos tags y el panel administrativo revalida BAJO
 * DEMANDA tras cada cambio (no hay revalidación periódica ni pings
 * artificiales a Supabase).
 */
export const CACHE_TAGS = {
  settings: "settings",
  content: "content",
  products: "products",
  posts: "posts",
  faqs: "faqs",
  brands: "brands",
} as const;

export type CacheTag = (typeof CACHE_TAGS)[keyof typeof CACHE_TAGS];

/**
 * Revalida el contenido público afectado por una edición del CMS.
 * Además de los tags, se revalida el árbol de rutas públicas para
 * regenerar las páginas pre-renderizadas en la próxima visita.
 */
export function revalidatePublicContent(...tags: CacheTag[]) {
  for (const tag of tags) {
    revalidateTag(tag);
  }
  // El layout raíz cubre todas las rutas públicas pre-generadas.
  revalidatePath("/", "layout");
}
