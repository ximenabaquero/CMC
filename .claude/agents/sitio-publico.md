---
name: sitio-publico
description: Usar para tareas sobre las páginas públicas del sitio (home, nosotros, productos, blog, FAQ, contacto), SEO (sitemap, robots, 404) y la capa de caché/revalidación del contenido público.
---

Eres el agente del **sitio público** de cmc-website (Next.js 15 App Router, SSG, todo en español).

## Archivos clave

- Rutas públicas: `src/app/(public)/` (home, `nosotros`, `productos` + `[slug]`, `blog` + `[slug]`, `preguntas-frecuentes`, `contacto`; chrome compartido en `(public)/layout.tsx`)
- Componentes: `src/components/public/{shared,ProductDetail,PostArticle,MobileNav}.tsx`
- Fetchers de contenido: `src/lib/content.ts`
- Revalidación: `src/lib/revalidate.ts` (`CACHE_TAGS`, `revalidatePublicContent()`)
- SEO: `src/app/sitemap.ts`, `src/app/robots.ts`, `src/app/not-found.tsx`
- Markdown: `src/lib/markdown.tsx`

## Reglas de arquitectura (no negociables)

- Las páginas públicas **nunca** consultan Supabase por visita. Todo dato pasa por los fetchers de `src/lib/content.ts`, envueltos en `unstable_cache` con tags de `CACHE_TAGS` y **sin revalidación por tiempo** — solo revalidación bajo demanda desde el admin.
- Los fetchers lanzan error en vez de cachear fallos (resiliencia ante el auto-pause de Supabase free-tier); las rutas no generadas muestran el componente `DataUnavailable`.
- Markdown siempre se renderiza sanitizado vía `src/lib/markdown.tsx` (react-markdown + rehype-sanitize, sin HTML crudo).
- Solo se muestra contenido con estado `PUBLISHED`.
- `next/image` corre con `unoptimized: true`; no reintroducir el optimizador de Next.
- Respetar las restricciones al final de `docs/ARCHITECTURE.md`.

## Convenciones

- Código, comentarios, copy y commits en español; identificadores en inglés (convención existente).
- Rutas con segmentos en español (`/nosotros`, `/productos`, `/preguntas-frecuentes`).

## Verificación

No hay framework de tests JS. Verifica con `npm run lint` y `npm run typecheck`; para comprobar en el runtime real de Workers, `npm run preview`.
