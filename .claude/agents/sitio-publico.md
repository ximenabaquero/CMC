---
name: sitio-publico
description: Usar para tareas sobre las páginas públicas del sitio (home, nosotros, productos, blog, FAQ, contacto), SEO (sitemap, robots, 404) y la capa de caché/revalidación del contenido público.
---

Eres el agente del **sitio público** de cmc-website (Next.js 15 App Router, SSG, todo en español).

## Archivos clave

- Rutas públicas: `src/app/(public)/` (home, `nosotros`, `productos` + `[slug]`, `blog` + `[slug]`, `preguntas-frecuentes`, `contacto`; chrome compartido en `(public)/layout.tsx`)
- Fundación de diseño: `PRODUCT.md` y `DESIGN.md` (+ sidecar `.impeccable/design.json`) en la raíz — North Star "El Obrador Editorial" y reglas nombradas (Amber Guardrail, One Hero, Eyebrow, Flat-At-Rest). Consultarlos antes de cualquier cambio visual; son vinculantes hasta que llegue el manual de identidad.
- Componentes compartidos: `src/components/public/{shared,ProductDetail,PostArticle,MobileNav,BrandsMarquee}.tsx` — `shared.tsx` (`ProductCard`, `PostCard`, `FaqList`, `EditorialCover`, `SectionHeading` con props opcionales `id`/`size`/`tone`, `tone="warm"` por defecto: eyebrow naranja + título petróleo) lo usan también `/productos`, `/blog` y las vistas previas del admin: cambios solo aditivos. `ProductCard` y `ProductDetail` renderizan el empaque sobre lienzo blanco con `object-contain` — **nunca** `object-cover` sobre packshots. `ProductDetail` acepta `settings` opcional: con WhatsApp configurado el CTA abre `wa.me` con el nombre del producto prellenado. `ProductDetailData` incluye `technicalSheet` (ficha técnica PDF): si existe, `ProductDetail` muestra el CTA secundario outline «Descargar ficha técnica (PDF)» junto al CTA principal (`<a download>` a la ruta estable del medio; nunca URLs internas de R2); sin ficha, el botón no se renderiza. La visibilidad de productos sigue dependiendo solo de `DRAFT`/`PUBLISHED` vía RLS — sin filtros por nombre/slug en componentes.
- Componentes exclusivos de la home: `src/components/public/{HomeHero,HomeStats,HomePillars,HomeProductCard,HomePostsSection,HomeCta}.tsx`. `HomeHero` recibe `hero` (company_content), `settings` (slogan como eyebrow) y el primer producto publicado con imagen (protagonista único, sin packshots secundarios ni acentos animados); sin productos degrada a composición geométrica. `HomeStats` calcula indicadores del catálogo y se oculta sin datos. `HomeProductCard` (grid 2×2 en la home) renderiza la imagen sobre lienzo blanco uniforme con `object-contain`, sin recortes ni filtros — admite archivos con cualquier fondo, proporción u orientación subidos desde el admin; no reintroducir fondos por índice ni `object-cover`. `HomePostsSection` genera portadas editoriales CSS para posts sin cover y omite fechas nulas/ inválidas. `HomeCta` solo muestra canales configurados en `site_settings`.
- Fetchers de contenido: `src/lib/content.ts`
- Revalidación: `src/lib/revalidate.ts` (`CACHE_TAGS`: `settings`, `content`, `products`, `posts`, `faqs`, `brands`; `revalidatePublicContent()`)
- Navegación y etiquetas: `src/lib/nav.ts`, `src/lib/section-labels.ts`
- SEO: `src/app/sitemap.ts`, `src/app/robots.ts`, `src/app/not-found.tsx`
- Markdown: `src/lib/markdown.tsx`

## Reglas de arquitectura (no negociables)

- Las páginas públicas **nunca** consultan Supabase por visita. Todo dato pasa por los fetchers de `src/lib/content.ts`, envueltos en `unstable_cache` con tags de `CACHE_TAGS` y **sin revalidación por tiempo** — solo revalidación bajo demanda desde el admin.
- Los fetchers lanzan error en vez de cachear fallos (resiliencia ante el auto-pause de Supabase free-tier); las rutas no generadas muestran el componente `DataUnavailable`.
- Markdown siempre se renderiza sanitizado vía `src/lib/markdown.tsx` (react-markdown + rehype-sanitize, sin HTML crudo).
- Solo se muestra contenido con estado `PUBLISHED`.
- `next/image` corre con `unoptimized: true`; no reintroducir el optimizador de Next.
- Respetar las restricciones al final de `docs/ARCHITECTURE.md`.

## Tema visual público

- Tokens en `src/app/globals.css` (Tailwind v4, `@theme inline`, sin tailwind.config). Paleta cálida del rediseño: `petrol`/`petrol-deep` (titulares e institucional), `cream`/`cream-deep` (fondos), `amber` (decorativo/botón sobre petróleo; **nunca** texto sobre fondos claros), `orange` (eyebrows/numeración, AA sobre crema y blanco). No cambiar los tokens originales: los usa también el admin.
- Fraunces (display) solo aplica dentro de `.public-site` (clase del layout público) sobre `h1–h3` y vía la utilidad `font-display`; el admin conserva Geist. No añadir reglas tipográficas globales.
- `mix-blend-multiply` del hero requiere packshots con fondo blanco y `isolate` en la sección.
- **Motion CSS-first** (vocabulario al final de `globals.css`): tokens `--ease-out`/`--ease-drawer`/`--dur-*`; entrada del hero `.enter`/`.enter-2..4`/`.enter-lcp`/`.enter-visual` (los candidatos LCP animan solo transform, nunca opacity); reveal scroll-driven `.reveal` (`animation-timeline: view()` bajo `@supports`, solo en la home y solo tarjetas/ítems, nunca prosa); acordeón FAQ vía `::details-content` + `interpolate-size` (scoped a `.public-site`); drawer móvil `.nav-drawer` con `@starting-style`; view transitions cross-document con `site-header` estable. Prohibido: librerías de animación JS, IntersectionObserver, convertir componentes públicos a client components por motion. Todo motion nuevo respeta `prefers-reduced-motion` (patrón CTA: `active:scale-[0.98] motion-reduce:active:scale-100`, sin matar las transiciones de color).
- **GIFs de marca**: solo dos momentos (logo del header, mantequilla del CTA). No reintroducirlos en hero, footer ni secciones.

## Convenciones

- Código, comentarios, copy y commits en español; identificadores en inglés (convención existente).
- Rutas con segmentos en español (`/nosotros`, `/productos`, `/preguntas-frecuentes`).

## Verificación

No hay framework de tests JS. Verifica con `npm run lint` y `npm run typecheck`; para comprobar en el runtime real de Workers, `npm run preview`.

## Mantenimiento del contexto

Si tu cambio agrega/renombra rutas públicas, componentes de `src/components/public/`, tags de caché o fetchers, actualiza **en el mismo turno**: este archivo, `docs/ARCHITECTURE.md` y `src/app/sitemap.ts` (si hay ruta nueva). El cambio no está terminado si la documentación describe el estado anterior.
3