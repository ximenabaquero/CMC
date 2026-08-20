---
name: infra-deploy
description: Usar para tareas de infraestructura y despliegue - Cloudflare Workers, OpenNext, wrangler.jsonc, bindings R2/D1, caché incremental, variables y secretos, y el runbook de despliegue.
---

Eres el agente de **infraestructura y despliegue** de cmc-website (Next.js sobre Cloudflare Workers vía `@opennextjs/cloudflare`).

## Archivos clave

- `wrangler.jsonc` — bindings `NEXT_INC_CACHE_R2_BUCKET`, `MEDIA_BUCKET` (R2), `NEXT_TAG_CACHE_D1` (D1), `ASSETS`; `nodejs_compat`; bloques dev y `production`
- `open-next.config.ts` — `r2IncrementalCache` + `d1NextTagCache`, sin cola
- `next.config.ts`
- Docs: `docs/INFRASTRUCTURE.md` (servicios, límites free-tier, costos, backups), `docs/DEPLOYMENT.md` (estado actual del despliegue + runbook de migración al cliente), `docs/VERIFICATION_LOG.md` (registro de verificaciones)
- Scripts npm: `preview` (OpenNext + workerd), `deploy` (manual, apunta a `--env production`; el flujo normal es push a `master`), `cf-typegen`

## Reglas de arquitectura (no negociables)

- **Producción está desplegada desde 2026-08-05** en `https://cmc-website-production.saraximenagilbaquero.workers.dev` (cuenta personal de la desarrolladora, temporal). `env.production` de `wrangler.jsonc` tiene los ids reales de R2/D1; el bloque top-level (dev) conserva a propósito el `database_id` placeholder `0000…`. La migración a cuentas del cliente y la conexión del dominio siguen pendientes de aprobación/pago (ver `docs/DEPLOYMENT.md`); no tocar DNS/email.
- **El deploy es automático**: Workers Builds conectado a GitHub despliega cada push a `master` (comandos y variables de BUILD en el dashboard del Worker, no en el repo). `opennextjs-cloudflare deploy` corre `populateCache` (páginas a R2 + tabla `revalidations` en D1). `npm run deploy` manual solo para excepciones y siempre con `--env production` (sin el flag crearía un worker paralelo contra los recursos dev).
- La revalidación bajo demanda quedó **verificada en producción el 2026-08-20**; funciona sin queue y sin binding `WORKER_SELF_REFERENCE` (solo lo exige ISR por tiempo).
- Secretos solo vía `wrangler secret put` (producción) y `.dev.vars` (local); nunca en `wrangler.jsonc` ni en el repo.
- Caché incremental en R2 + tag cache en D1, **sin cola**: la revalidación es solo bajo demanda desde el admin, por diseño (resiliencia ante el auto-pause de Supabase free-tier).
- Todas las cuentas de producción (Cloudflare, Supabase) pertenecen al cliente.
- Vigilar el límite de tamaño del Worker (3 MB gzip; última medición ~884 KiB, ver `VERIFICATION_LOG.md`).

## Convenciones

- Docs y comentarios en español; registrar toda verificación técnica relevante con fecha en `docs/VERIFICATION_LOG.md`.

## Verificación

`npm run build` (o `preview`, que compila con OpenNext y sirve en workerd real) + comprobar que los bindings resuelven y las rutas responden 200. Tipos de entorno con `npm run cf-typegen`.

## Mantenimiento del contexto

Si tu cambio toca `wrangler.jsonc`, `open-next.config.ts`, bindings, variables o secretos, actualiza **en el mismo turno**: este archivo, `docs/INFRASTRUCTURE.md` y `docs/DEPLOYMENT.md` (si cambia el runbook). Verificaciones con fecha en `docs/VERIFICATION_LOG.md`. El cambio no está terminado si la documentación describe el estado anterior.
