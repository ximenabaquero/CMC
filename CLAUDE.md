# cmc-website — Compañía Mundial de Comercio S.A.S.

Sitio corporativo + CMS propio. Una sola app **Next.js 15 (App Router)** desplegada en
**Cloudflare Workers** vía `@opennextjs/cloudflare`, con **Supabase** (PostgreSQL + Auth + RLS)
como base de datos y **R2** para medios. Todo el contenido, copy, comentarios y commits en
**español**; identificadores de código en inglés.

## Arquitectura en una página

- **Sitio público** (`src/app/(public)/`): 100 % SSG. **Nunca** consulta Supabase por visita.
  Todo dato pasa por los fetchers de `src/lib/content.ts` envueltos en `unstable_cache` con tags
  de `CACHE_TAGS` (`settings`, `content`, `products`, `posts`, `faqs`, `brands`) y **sin
  revalidación por tiempo** — solo bajo demanda desde el admin.
- **Panel admin** (`src/app/admin/(protected)/`): dinámico, requiere perfil `ADMIN`. Toda
  mutación es una Server Action (`src/actions/`) que valida con Zod
  (`src/lib/validation/index.ts`) y termina llamando `revalidatePublicContent()`
  (`src/lib/revalidate.ts`).
- **Autorización real** = políticas RLS (`supabase/migrations/0002_rls.sql` + `0003_brands.sql`):
  anon solo `SELECT` de filas `PUBLISHED`; escritura solo con `public.is_admin()`.
- **Medios**: dos proveedores en `media_assets.storage_provider` — `STATIC` (versionado en
  `public/`, importado con `scripts/import-assets.mjs` desde `content-source/`, carpeta
  gitignored con los originales del cliente) y `R2` (subidas CMS vía `src/lib/storage/`,
  servidas por `/api/media/<key>`). Dos clases de medio con validación separada: imágenes
  (`src/lib/media-upload.ts`) y documentos PDF/fichas técnicas (`src/lib/document-upload.ts`;
  `products.technical_sheet_media_id`, migración 0004). `next/image` con `unoptimized: true`.
- **Infra**: caché incremental en R2 + tag cache en D1, sin cola (`open-next.config.ts`,
  `wrangler.jsonc`). Producción corre en Cloudflare Workers (workers.dev, cuenta personal de la
  desarrolladora) con **deploy automático por push a `master`** (Workers Builds); la conexión del
  dominio del cliente y la migración de cuentas siguen **bloqueadas** hasta su aprobación
  (`docs/DEPLOYMENT.md`).
- Detalle completo en `docs/ARCHITECTURE.md` (incluye las restricciones no negociables al final).
- **Diseño**: `PRODUCT.md` (verdad de producto) y `DESIGN.md` (sistema visual, North Star
  "El Obrador Editorial" y reglas nombradas) en la raíz son la autoridad de criterio para
  cualquier cambio visual del sitio público. Skills de diseño instaladas en `.agents/skills/`
  (impeccable, emil-design-eng + sub-skills de animación, design-taste-frontend). Motion
  CSS-first únicamente (SSG): vocabulario al final de `src/app/globals.css`.

## Comandos

- `npm run lint` y `npm run typecheck` — verificación mínima tras cualquier cambio (no hay tests JS).
- `npm run dev` — desarrollo local (storage driver local).
- `npm run preview` — build OpenNext + workerd real (R2/D1 simulados).
- RLS: pegar `supabase/tests/rls_checks.sql` **completo** en el SQL Editor de Supabase. Es una
  sola sentencia `do $$ … $$` a propósito (el editor no conserva tablas temporales entre
  sentencias): no trocearlo ni reintroducir estado compartido entre sentencias.

## Agentes especializados

Delegar al agente que corresponda: `sitio-publico` (páginas públicas, SEO, caché),
`panel-admin` (CRUDs, Server Actions, formularios), `supabase-db` (esquema, migraciones, RLS,
auth), `medios-storage` (imágenes, adaptadores, /api/media), `infra-deploy` (Workers, OpenNext,
wrangler), `contexto-docs` (auditar/sincronizar documentación y agentes).

## Mantenimiento del contexto (obligatorio)

Cada vez que un cambio altere la arquitectura, actualiza **en el mismo turno** la documentación
y los agentes afectados. Mapa de sincronización:

| Si el cambio toca… | Actualizar… |
|---|---|
| Esquema/BD (nueva migración, tabla, RLS) | `docs/ARCHITECTURE.md`, `.claude/agents/supabase-db.md`, `src/lib/supabase/types.ts`, `supabase/tests/rls_checks.sql` |
| Rutas públicas, componentes públicos, tags de caché | `docs/ARCHITECTURE.md`, `.claude/agents/sitio-publico.md` (y `sitemap.ts` si hay ruta nueva) |
| Rutas admin, Server Actions, schemas Zod | `.claude/agents/panel-admin.md` (y `docs/CMS_GUIDE.md` si cambia el flujo del editor) |
| Storage, subidas, /api/media, assets estáticos | `.claude/agents/medios-storage.md`, `docs/ARCHITECTURE.md` |
| wrangler.jsonc, open-next.config.ts, bindings, secretos | `.claude/agents/infra-deploy.md`, `docs/INFRASTRUCTURE.md`, `docs/DEPLOYMENT.md` |
| Nueva funcionalidad completa (ej. marcas) | Todos los anteriores que aplique + este `CLAUDE.md` si cambia el mapa mental |

Reglas:

- Un cambio de código **no está terminado** si dejó la documentación o un agente describiendo
  el estado anterior. Trátalo como parte del diff, no como tarea aparte.
- Verificaciones técnicas relevantes (medidas, pruebas manuales) se registran con fecha en
  `docs/VERIFICATION_LOG.md`.
- Contenido editorial pendiente se registra en `docs/CONTENT_PENDING.md`.
- Ante la duda de si el contexto quedó desfasado, invocar el agente `contexto-docs` para auditar.
