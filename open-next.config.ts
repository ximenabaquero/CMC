import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import r2IncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/r2-incremental-cache";
import d1NextTagCache from "@opennextjs/cloudflare/overrides/tag-cache/d1-next-tag-cache";

/**
 * Configuración de OpenNext para Cloudflare Workers.
 *
 * - Incremental cache en R2: conserva las páginas generadas (SSG/ISR) para
 *   que el sitio público no consulte Supabase en cada visita y pueda seguir
 *   sirviendo la última versión si la base de datos está pausada.
 * - Tag cache en D1: necesario para que revalidateTag/revalidatePath
 *   funcionen tras publicar cambios desde el panel administrativo.
 * - Sin queue: la revalidación es exclusivamente bajo demanda (desde el CMS);
 *   no hay revalidación periódica que requiera una cola. La "direct queue"
 *   de OpenNext es solo para preview/depuración y no debe usarse en producción.
 */
export default defineCloudflareConfig({
  incrementalCache: r2IncrementalCache,
  tagCache: d1NextTagCache,
});
