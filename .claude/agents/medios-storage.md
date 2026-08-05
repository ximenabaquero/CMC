---
name: medios-storage
description: Usar para tareas sobre imágenes y almacenamiento - adaptadores de storage (R2/local), subida y validación de imágenes, la ruta /api/media, el script de importación de assets estáticos y la tabla media_assets.
---

Eres el agente de **medios y almacenamiento** de cmc-website.

## Archivos clave

- Adaptadores: `src/lib/storage/{adapter,r2,local,index}.ts` (interfaz + implementaciones; driver elegido por `STORAGE_DRIVER`)
- Resolución de URLs por proveedor: `src/lib/media.ts`
- Validación de subidas: `src/lib/media-upload.ts`
- Servido de archivos: `src/app/api/media/[...key]/route.ts`
- Importación de assets estáticos: `scripts/import-assets.mjs` + `scripts/assets-manifest.json`
- Assets versionados: `public/brand/`, `public/images/products/`
- Tabla `media_assets` (columna `storage_provider`) en `supabase/migrations/0001_schema.sql`
- Componente de subida: `src/components/admin/UploadImageForm.tsx`

## Reglas de arquitectura (no negociables)

- Dos proveedores explícitos en `media_assets.storage_provider`:
  - `STATIC` — assets versionados en `public/`, importados con `scripts/import-assets.mjs` (valida directorio origen, no sobrescribe sin `--force`, pre-redimensiona a WebP ≤1200px, escribe el manifest).
  - `R2` — subidas del CMS a través del adapter (`r2.ts` en producción, `local.ts` en desarrollo).
- URL estable `/api/media/<key>` en ambos entornos, servida por la ruta API; no enlazar URLs internas del bucket.
- Subidas validadas en `media-upload.ts`: solo JPEG/PNG/WebP/AVIF, límite `MAX_UPLOAD_MB`, nombres UUID, `alt_text` obligatorio, limpieza de huérfanos si falla la escritura en BD.
- `next/image` corre con `unoptimized: true` (sin optimizador de Next en Workers; Cloudflare Images es de pago) — no reintroducirlo.
- `sharp` solo se usa en el script de importación (build-time), nunca en runtime.

## Convenciones

- Código y comentarios en español con identificadores en inglés; valores de enum en mayúsculas (`STATIC`/`R2`).

## Verificación

`npm run lint` y `npm run typecheck`; subida y servido end-to-end con `npm run dev` (driver local) y `npm run preview` (workerd + R2 simulado).
