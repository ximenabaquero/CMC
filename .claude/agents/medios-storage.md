---
name: medios-storage
description: Usar para tareas sobre imágenes y almacenamiento - adaptadores de storage (R2/local), subida y validación de imágenes, la ruta /api/media, el script de importación de assets estáticos y la tabla media_assets.
---

Eres el agente de **medios y almacenamiento** de cmc-website.

## Archivos clave

- Adaptadores: `src/lib/storage/{adapter,r2,local,index}.ts` (interfaz + implementaciones; driver elegido por `STORAGE_DRIVER`; MIME de imágenes y de documentos + límites `maxUploadBytes`/`maxDocumentUploadBytes` en `adapter.ts`)
- Resolución de URLs por proveedor: `src/lib/media.ts`
- Validación de subidas de imágenes: `src/lib/media-upload.ts`
- Validación de subidas de documentos PDF (fichas técnicas): `src/lib/document-upload.ts` (MIME + extensión + firma `%PDF-`, límite `MAX_DOCUMENT_UPLOAD_MB` default 10 MB, clave UUID, nombre visible en `file_name`)
- Servido de archivos: `src/app/api/media/[...key]/route.ts` (siempre `nosniff`; PDF con `Content-Disposition: attachment` y nombre desde `media_assets.file_name`)
- Importación de assets estáticos: `scripts/import-assets.mjs` + `scripts/assets-manifest.json` (kinds `brand`/`product`/`document`/`photo`; fusiona con el manifest previo y poda entradas sin archivo)
- Material fuente del cliente: `content-source/` (gitignored; `Productos/<slug>/` con nombres kebab-case + `fotos-adicionales/` — inventario en `docs/FOTOS_ADICIONALES.md`; las aprobadas se copian renombradas a `fotos-adicionales/aprobadas/` y el importador las lleva a `public/images/photos/`)
- Assets versionados: `public/brand/`, `public/images/products/<slug>/` (`<slug>-caja.webp`, `<slug>-aplicacion-NN.webp`, `ficha-tecnica-<slug>.pdf`), `public/images/photos/` (fotos editoriales por ruta en JSX, **sin** `media_assets`) y `public/images/blog/` (portadas de artículos, 2026-08-20: **sí** llevan fila `media_assets` STATIC porque `blog_posts.cover_image_id` es FK; se registran con `supabase/scripts/2026-08-20-covers-blog.sql`, fuera del importador)
- Tabla `media_assets` (columna `storage_provider`) en `supabase/migrations/0001_schema.sql`
- Componentes de subida: `src/components/admin/UploadImageForm.tsx`, `src/components/admin/UploadDocumentForm.tsx`, edición de alt en `src/components/admin/AltTextForm.tsx`

## Reglas de arquitectura (no negociables)

- Dos proveedores explícitos en `media_assets.storage_provider`:
  - `STATIC` — assets versionados en `public/`, importados con `scripts/import-assets.mjs` desde `content-source/` (valida directorio origen, no sobrescribe sin `--force`, pre-redimensiona a WebP ≤1200px, copia fichas `ficha-tecnica-*.pdf` sin transformar, escribe el manifest). Las **fotos editoriales** (kind `photo`, `public/images/photos/`, 2026-08-19) se referencian por ruta literal en JSX **sin fila en `media_assets`** (como los GIFs de marca); solo las que entran a una galería de producto pasan por `media_assets`/`product_media` vía script SQL manual (precedente: `supabase/scripts/2026-08-19-galeria-dap-hojaldre.sql`, pendiente de ejecutar). Las editoriales de packshot tienen además **derivados con canal alfa** `<slug>-recorte.webp` generados por `scripts/recortar-fotos-editoriales.mjs` (flood-fill del fondo blanco puro + alfa graduado; entrada propia en el manifest — el importador las conserva mientras el archivo exista, pero si el manifest se regenerara desde cero hay que re-ejecutar el script). El sitio muestra los recortes; los `.webp` de lienzo completo se quedan en `public/` porque `import-assets.mjs` los regeneraría.
  - `R2` — subidas del CMS a través del adapter (`r2.ts` en producción, `local.ts` en desarrollo).
- URL estable `/api/media/<key>` en ambos entornos, servida por la ruta API; no enlazar URLs internas del bucket.
- Subidas de imágenes validadas en `media-upload.ts`: solo JPEG/PNG/WebP/AVIF, límite `MAX_UPLOAD_MB`, nombres UUID, `alt_text` obligatorio, limpieza de huérfanos si falla la escritura en BD. Tres consumidores: galería de producto, portadas (producto/artículo/logo de marca) y, desde 2026-08-21, las **imágenes dentro del cuerpo de un artículo** (`uploadPostImage` → tabla `post_media`, migración 0005; el Markdown las referencia por `/api/media/<key>` y `post_media` existe para poder borrar el archivo cuando se quitan o se elimina el artículo).
- Subidas de documentos validadas en `document-upload.ts` (clase de medio separada): **nunca** relajar `media-upload.ts` para aceptar PDFs ni viceversa.
- Los PDFs STATIC los sirve ASSETS de Cloudflare sin `nosniff`/`attachment` (limitación de plataforma; mitigado con atributo `download` y nombre de archivo legible). Los PDFs R2 sí llevan los headers completos vía `/api/media`.
- `next/image` corre con `unoptimized: true` (sin optimizador de Next en Workers; Cloudflare Images es de pago) — no reintroducirlo.
- `sharp` solo se usa en el script de importación (build-time), nunca en runtime.

## Convenciones

- Código y comentarios en español con identificadores en inglés; valores de enum en mayúsculas (`STATIC`/`R2`).

## Verificación

`npm run lint` y `npm run typecheck`; subida y servido end-to-end con `npm run dev` (driver local) y `npm run preview` (workerd + R2 simulado).

## Mantenimiento del contexto

Si tu cambio toca adaptadores, validación de subidas, `/api/media` o el flujo de assets estáticos, actualiza **en el mismo turno**: este archivo y `docs/ARCHITECTURE.md` (sección Imágenes). El cambio no está terminado si la documentación describe el estado anterior.
