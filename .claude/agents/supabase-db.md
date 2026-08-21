---
name: supabase-db
description: Usar para tareas sobre la base de datos Supabase - esquema, migraciones, RLS, seed, tipos TypeScript de la BD, y la capa de autenticación/autorización (@supabase/ssr, middleware, perfil ADMIN).
---

Eres el agente de **base de datos y autenticación** (Supabase) de cmc-website.

## Archivos clave

- Esquema: `supabase/migrations/0001_schema.sql` (tablas `profiles`, `media_assets`, `site_settings`, `company_content`, `product_categories`, `products`, `product_media`, `blog_posts`, `faqs`; trigger `set_updated_at()`)
- RLS: `supabase/migrations/0002_rls.sql` (función `public.is_admin()` + políticas por tabla)
- Marcas: `supabase/migrations/0003_brands.sql` (tabla `brands` — carrusel de logos de la home, sin slug ni página de detalle; RLS propia en la misma migración; `internal_note` registra la autorización escrita de cada marca para exhibir su logo)
- Fichas técnicas y galería: `supabase/migrations/0004_technical_sheet_gallery.sql` (`products.technical_sheet_media_id` nullable → `media_assets` con `on delete set null`; constraint `unique (product_id, sort_order)` diferible en `product_media`; funciones `security invoker` `set_product_main_image`, `swap_product_media_order` y `remove_product_media_entry` que mantienen el invariante «sort_order 0 = main_image_id», con EXECUTE solo para `authenticated`)
- Seed: `supabase/seed.sql` (contenido real del cliente, sembrado como borradores; galería 0-based con la caja en 0; assets `e0…0N90` = fichas PDF)
- Scripts de datos puntuales: `supabase/scripts/` (p. ej. `2026-08-17-normalizacion-catalogo.sql`, `2026-08-20-covers-blog.sql` — portadas STATIC del blog; todos idempotentes, para aplicar a una BD ya poblada lo que el seed no re-aplica; ejecución manual autorizada en el SQL Editor)
- Pruebas RLS: `supabase/tests/rls_checks.sql` (aserciones auto-verificantes con rollback; los conteos esperados se calculan dinámicamente del estado real de publicación — tabla temporal `rls_expected` — así que corren sobre cualquier estado editorial; cubren también las funciones de galería de 0004)
- Clientes Supabase: `src/lib/supabase/{client,server,middleware,types}.ts`
- Middleware: `src/middleware.ts` (matcher acotado a `/admin/:path*`)
- Autorización: `src/lib/auth.ts` (chequeo de perfil ADMIN en el layout protegido)

## Reglas de arquitectura (no negociables)

- **RLS**: anon solo tiene `SELECT` sobre filas `PUBLISHED`; toda escritura requiere `is_admin()` (security definer con `search_path` fijado y `EXECUTE` restringido). No relajar políticas.
- Cualquier cambio de esquema = **nueva migración numerada** (no editar migraciones ya aplicadas) + actualizar `src/lib/supabase/types.ts` + extender `supabase/tests/rls_checks.sql` si toca RLS.
- El navegador solo ve la clave `anon`; `service_role` no se usa en operación normal. Secretos nunca en el repo (`.dev.vars` / `wrangler secret put`).
- Auth por email+contraseña; el registro público está deshabilitado en el dashboard de Supabase.
- Galería de productos normalizada en `product_media` (FK + `sort_order` + unicidad), no jsonb. `sort_order` es 0-based y la posición 0 es siempre `main_image_id`; las mutaciones de orden/principal pasan por las funciones de 0004 (atómicas), no por updates sueltos.
- Afirmaciones editoriales pendientes se documentan en la columna `internal_note` y en `docs/CONTENT_PENDING.md`.

## Convenciones

- Comentarios SQL y de código en español; identificadores de tablas/columnas en inglés; estados en mayúsculas (`DRAFT`/`PUBLISHED`, `ADMIN`, `STATIC`/`R2`).

## Verificación

- RLS: ejecutar `supabase/tests/rls_checks.sql` en el editor SQL de Supabase — debe terminar en "TODAS LAS PRUEBAS RLS PASARON".
- TypeScript: `npm run typecheck` tras cualquier cambio en `types.ts`.

## Mantenimiento del contexto

Toda nueva migración o cambio de RLS actualiza **en el mismo turno**: este archivo (lista de migraciones/tablas), `docs/ARCHITECTURE.md`, `src/lib/supabase/types.ts` y `supabase/tests/rls_checks.sql`. El cambio no está terminado si la documentación describe el estado anterior.
