# Arquitectura

## Visión general

Una sola aplicación full-stack Next.js 15 (App Router) que sirve el sitio
público y el panel administrativo. No hay backend separado.

```
Visitante ──► Cloudflare Workers (OpenNext)
                 │  páginas pre-generadas (SSG) desde R2 incremental cache
                 │  (NO consulta Supabase por visita)
                 ▼
Admin ──► /admin (dinámico) ──► Supabase (PostgreSQL + Auth, RLS)
                 │ al guardar: revalidateTag/revalidatePath
                 ▼
          regeneración bajo demanda de las páginas públicas
Imágenes CMS ──► Cloudflare R2 (binding MEDIA_BUCKET) vía /api/media/<clave>
Activos oficiales ──► public/brand y public/images/products (STATIC, versionados)
```

## Decisiones clave

### Datos y caché (anti-pausado de Supabase)

- Las rutas públicas son **estáticas** (SSG/`generateStaticParams`). Los
  fetchers (`src/lib/content.ts`) usan `unstable_cache` con tags
  (`settings`, `content`, `products`, `posts`, `faqs`) y **sin revalidación
  periódica**: la base solo se consulta al generar o regenerar una página.
- Tras cada cambio en el CMS, las Server Actions llaman
  `revalidateTag(...)` + `revalidatePath("/", "layout")`
  (`src/lib/revalidate.ts`): revalidación **exclusivamente bajo demanda**.
- En Workers esto lo soportan `r2IncrementalCache` (páginas generadas) y
  `d1NextTagCache` (tags) — ver `open-next.config.ts`. **Sin queue**: la
  «direct queue» de OpenNext es solo para preview/depuración y no hay
  revalidación periódica que la requiera.
- **Comportamiento si Supabase está pausado o caído** (probado en la
  verificación final):
  - Las rutas ya generadas pueden seguir sirviendo la última versión
    guardada en el caché incremental de R2.
  - Una ruta que nunca se generó muestra un estado de error elegante
    (componente `DataUnavailable`), no un error críptico.
  - El panel admin muestra un aviso claro con pasos para reactivar el
    proyecto (`src/app/admin/(protected)/error.tsx`).
  - No hay pings artificiales para impedir el pausado.
- Los fetchers **lanzan** ante errores (nunca se cachea un fallo); cada
  página captura y decide su estado de error.

### Autenticación y autorización

- Supabase Auth (correo + contraseña), sin registro público (deshabilitado
  en el dashboard). Rol único `ADMIN` en la tabla `profiles`.
- `src/middleware.ts` (solo `/admin/*`): refresca la sesión con
  `@supabase/ssr` y redirige a `/admin/login` sin sesión. El layout
  protegido verifica además el perfil ADMIN (`src/lib/auth.ts`).
- La autorización real la aplican las **políticas RLS**
  (`supabase/migrations/0002_rls.sql`):
  - anon: solo `SELECT` de filas `PUBLISHED`;
  - escritura: solo `public.is_admin()` (security definer endurecida:
    `search_path` fijado, `EXECUTE` restringido, exige perfil ADMIN).
- El navegador solo conoce la clave `anon`. La `service_role` no se usa en
  la operación normal (solo quedaría para scripts puntuales de servidor) y
  nunca se expone.
- Pruebas: `supabase/tests/rls_checks.sql` (autoverificables, con rollback).

### Imágenes

- **Dos proveedores explícitos** en `media_assets.storage_provider`:
  - `STATIC`: activos oficiales versionados en `public/` (importados con
    `scripts/import-assets.mjs`). Su URL es su ruta bajo `/`.
  - `R2`: archivos subidos desde el CMS a través del adaptador
    (`src/lib/storage/`): R2 en producción, sistema de archivos local en
    desarrollo. URL estable `/api/media/<clave>` en ambos entornos.
  - La resolución de URL es por proveedor (`src/lib/media.ts`); nunca se
    mezclan.
- Subidas: validación de tipo (JPEG/PNG/WebP/AVIF), tamaño configurable
  (`MAX_UPLOAD_MB`), nombre único (UUID), `alt_text` obligatorio, metadatos
  en `media_assets`, y limpieza del objeto si falla el registro.
- `next/image` con `unoptimized: true` (Workers no trae el optimizador de
  Next y Cloudflare Images es de pago). Mitigación: pre-dimensionado de los
  activos importados (WebP ≤ 1200 px) y límite de tamaño en las subidas.
- Los binarios nunca se guardan en la base de datos.

### Contenido

- Markdown almacenado en la base; render **sanitizado** con
  `react-markdown` + `rehype-sanitize` (sin HTML crudo) en
  `src/lib/markdown.tsx`.
- Bloques institucionales editables por clave (`company_content`), con
  formularios estructurados (no hay page builder).
- Galería de productos normalizada en `product_media` (FK + orden +
  unicidad), no jsonb.
- Estados `DRAFT`/`PUBLISHED` en todo el contenido; `internal_note`
  documenta el contenido en revisión editorial dentro del propio CMS.

### Estructura del código

```
src/
├─ app/(public)/…        # sitio público (SSG)
├─ app/admin/login       # login
├─ app/admin/(protected) # panel (dinámico, requiere ADMIN)
├─ app/api/media/[...key]# sirve archivos del adaptador (local/R2)
├─ actions/              # Server Actions (auth, products, posts, faqs, settings, content)
├─ components/ (admin/, public/)
└─ lib/ (supabase/, storage/, content.ts, validation/, markdown.tsx, …)
supabase/ (migrations/, seed.sql, tests/rls_checks.sql)
```

## Restricciones respetadas

Sin WordPress, Railway, MySQL, Prisma, backend separado, auth manual ni
credenciales en el código. Sin e-commerce, pagos, inventario, CRM ni
integraciones distintas de Supabase y Cloudflare. Sin formulario de correo
(no hay correo receptor definido aún).
