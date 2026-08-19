# Registro de verificaciones

Registro de las verificaciones técnicas ejecutadas durante el desarrollo.
Los límites del plan gratuito de Workers están documentados en
`docs/INFRASTRUCTURE.md`.

## 2026-08-04 — Fase 2: verificación temprana de límites de Cloudflare

Base del proyecto (Next.js 15.5.22 + OpenNext 1.20.2, sin Supabase ni markdown aún):

| Verificación | Resultado |
|---|---|
| `npx opennextjs-cloudflare build` (Windows 11) | OK |
| `npx wrangler deploy --dry-run --outdir bundled` | OK |
| Tamaño del Worker (gzip) | **884.29 KiB** de 3 MB permitidos (~29 %) |
| Tamaño del Worker (sin comprimir) | 4 183.75 KiB |
| Preview en runtime workerd (`npm run preview`) | HTTP 200 en `/` |
| Bindings resueltos | `NEXT_TAG_CACHE_D1` (D1), `NEXT_INC_CACHE_R2_BUCKET` (R2), `MEDIA_BUCKET` (R2), `ASSETS` |

Conclusión: margen amplio frente al límite de 3 MB gzip del plan gratuito.
Se repetirá la medición tras agregar `@supabase/supabase-js`, `@supabase/ssr`,
`zod` y el render de markdown (ver verificación final).

## 2026-08-10 — Rediseño visual de productos destacados en la home

Cambios: `HomeProductCard` (lienzo blanco uniforme, sin fondos por índice,
`object-contain` sin recortes, área de imagen de 288/320/360 px) y grid de la
home a 2 columnas máximo (2×2 con los 4 productos actuales). Header con logo
animado `cmc-logo-entrada-preview.gif` (bucle; estático con reduced motion).

| Verificación | Resultado |
|---|---|
| `npm run lint` / `npm run typecheck` | OK |
| `npm run build` (29 páginas estáticas) | OK |
| Home 1440 px (Chrome headless, screenshot) | Grid 2×2, lienzo blanco, packshots grandes, alturas consistentes |
| Home 500 px (layout móvil < `sm`) | 1 columna, sin desbordamiento horizontal, textos completos |
| Logo animado del header | Renderiza en dev; fallback estático vía `motion-reduce` |

Nota: los productos actuales solo cubren imágenes apaisadas con fondo propio;
los casos PNG transparente / vertical / fondo de color quedan cubiertos por
construcción (`object-contain` + alto fijo + lienzo blanco) y deben revisarse
visualmente cuando se suban archivos así desde el admin.

## 2026-08-10 — Refinamiento de UX guiado por skills de diseño

Se instalaron las skills `emilkowalski/skill`, `pbakaus/impeccable` y
`design-taste-frontend` (`.agents/skills/`), se generó la fundación de diseño
(`PRODUCT.md`, `DESIGN.md`, `.impeccable/design.json`) y se aplicó la
auditoría resultante: jerarquía/consistencia en todo el sitio público
(lienzo blanco sin recortes en catálogo y fichas, encabezado naranja+petróleo
unificado, CTAs de WhatsApp directos, dieta de GIFs a 2 momentos) y el primer
sistema de motion CSS-first (`globals.css`).

| Verificación | Resultado |
|---|---|
| `npm run typecheck` / `npm run lint` | OK (0 errores; `.agents/` y `.claude/` excluidos del lint) |
| Detector mecánico Impeccable (`detect.mjs`) sobre los 18 archivos tocados | 1 hallazgo real corregido (`border-l-4` naranja en "Propuesta de valor"); resto advisories aceptados (numerales decorativos, prosa) |
| Review estricto de motion (skill `review-animations`) | Bloqueo inicial por `motion-reduce:transition-none` + `active:scale` (8 sitios) → corregido a `motion-reduce:active:scale-100`; candidatos LCP del hero pasados a animación solo-transform (`.enter-lcp`, `rise-in-solid`) |
| Pesos de GIFs medidos | logo header 70 KB, mantequilla 174 KB, wordmark DAP 307 KB (este último ya no se usa) |
| Pendiente de revisión visual manual | Entrada del hero y reveals en Chrome/Firefox, acordeón FAQ en Chromium ≥ 131, `HomeStats` en viewports altos (~750 px), view transitions entre páginas |

## 2026-08-17 — Normalización integral del catálogo (imágenes + fichas técnicas PDF)

Cambios: assets renormalizados (`content-source/` → `import-assets` → 19 WebP +
9 fichas PDF STATIC con convención `<slug>-caja` / `<slug>-aplicacion-NN` /
`ficha-tecnica-<slug>`), migración `0004` (`technical_sheet_media_id`, unique
diferible en `product_media`, funciones atómicas de galería), clase de medio
documental (`document-upload.ts`, `/api/media` con `nosniff` + `attachment`),
CMS (reordenar galería, editar alt, ciclo de ficha PDF, miniaturas
`object-contain`), CTA público «Descargar ficha técnica (PDF)», seed 0-based y
script de datos `supabase/scripts/2026-08-17-normalizacion-catalogo.sql`.

| Verificación | Resultado |
|---|---|
| Los 18 PDF del material leídos y clasificados | 9 fichas técnicas oficiales (`Ficha Técnica *`) + 9 PDF de copy web (~24 KB, sin datos técnicos): no hay fichas duplicadas ni contradictorias |
| Cotejo campo a campo de las 9 fichas contra el seed | Seed fiel; 1 corrección (alérgenos DAP Aliñado: «se procesan **y empacan**»); conflicto de Alta Repostería Ponqué confirmado y mantenido en revisión; errata «fritura instruccional» anotada en CONTENT_PENDING |
| Identificación visual de cajas (9 productos) | Confirmadas; en DAP Aliñado y DAP Industrial el archivo sin «caja» en el nombre era efectivamente la caja (nombres intercambiados en el material) |
| `npm run import-assets -- --source=content-source --force` | 28 archivos escritos (19 WebP 1200×1200 + 9 PDF); manifest fusionado y 16 entradas obsoletas podadas |
| `npm run lint` / `npm run typecheck` | OK (0 errores) |
| `npm run build` | OK — 29 páginas; genera 12 rutas `/productos/[slug]` porque la BD dev tiene los 12 productos PUBLICADOS (ver pendientes) |
| `npm run preview` (workerd) — rutas públicas | `/`, `/productos`, `/productos/dap-hojaldre` 200; slug inexistente 404; HTML sin URLs internas de R2 |
| `npm run preview` — assets | WebP nuevos y fichas PDF servidos 200 con content-type correcto; rutas WebP viejas 404 (esperado: la BD dev aún referencia rutas viejas hasta ejecutar el script de datos) |
| `/api/media` (objetos de prueba en R2 local, retirados después) | PDF: `application/pdf` + `Content-Disposition: attachment` + `nosniff` + `immutable`; imagen: `nosniff` sin disposition; clave con `/` → 400; inexistente → 404 |
| **Hallazgo crítico registrado** | Los 12 productos (incluidos los 3 placeholders) estaban PUBLICADOS en la BD dev; el script de datos devolvió los placeholders a DRAFT |

### Ejecución autorizada del SQL (2026-08-17, misma fecha)

Con autorización de la usuaria (Access Token de Supabase, vía Management API,
proyecto `bkvvosaqtutnwyamqipo`) y respaldo previo completo de las tablas
afectadas en `content-source/backups/2026-08-17-pre-normalizacion/`:

| Verificación | Resultado |
|---|---|
| `0004_technical_sheet_gallery.sql` | Aplicada (HTTP 201) |
| `2026-08-17-normalizacion-catalogo.sql` — 1.ª ejecución | **Abortó de forma segura** (rollback, sin cambios): `dap-reposteria` tenía la foto de aplicación como imagen principal (cambio hecho desde el CMS después del seed) |
| Corrección añadida al script (sección 4b: restaurar la caja …0501 como principal de dap-reposteria) — 2.ª ejecución | Aplicada (HTTP 201); todos los asserts internos pasaron |
| `rls_checks.sql` (reescrito con conteos **dinámicos** según el estado real de publicación — ya no asume "todo en DRAFT") | Todas las pruebas pasaron (rollback limpio), con los 9 DAP publicados |
| Estado en BD tras el script | 3 placeholders en DRAFT; 9 DAP en PUBLISHED; caja = `main_image_id` = `sort_order 0` en los 9; 9 fichas asociadas (`e0…0N90`); galerías de 2–3 fotos 0-based |
| Preview (workerd, caché de build limpia — nota: `next build` reutiliza `.next/cache` y sirvió datos obsoletos hasta borrarla) | `/productos` lista exactamente los 9 DAP; placeholders → 404; home y detalles con la caja nueva; botón «Descargar ficha técnica (PDF)» presente; 28/28 rutas de assets en 200; sin URLs internas de R2 |
| Funciones 0004 en BD | Existen las 3; EXECUTE: `authenticated` sí, `anon` no; `/admin` redirige a login sin sesión |

## 2026-08-19 — Logo animado en el hero de la home (pedido de la clienta)

Cambio: la composición derecha del hero pasa del packshot del primer
producto publicado al **logo CMC animado** (`cmc-logo-entrada-una-vez.gif`,
se reproduce una vez; estático `logo-cmc-png.png` bajo
`prefers-reduced-motion`; `mix-blend-multiply` sobre el círculo ámbar).
Tercer momento de GIF de marca — documentado en DESIGN.md, ARCHITECTURE.md
y `sitio-publico.md`.

| Verificación | Resultado |
|---|---|
| `npm run typecheck` / `npm run lint` | OK (0 errores) |
| `npm run preview` — home | El hero muestra el GIF del logo (y su fallback estático); sin packshot en el hero; GIF y PNG sirven 200 con content-type correcto |
| Pendiente manual (usuaria) | Ciclo CMS completo con sesión admin (subir imagen → principal → reordenar → alt → ciclo ficha → publicar/despublicar) y revisión visual del catálogo en navegador |

## 2026-08-17 — Fase 2 del panel admin: toasts, estados de carga, errores por campo y consistencia visual

Cambios: `src/lib/action-state.ts` (contrato v2 con `status`/`message`/`fieldErrors`/`ts` y helpers `actionSuccess`/`actionError`/`zodActionError`), sistema de toasts propio sin dependencias (`src/components/admin/toast.tsx` + `FlashToast.tsx` + `ActionForm.tsx`), migración de los 7 archivos de `src/actions/` (las 10 actions `void` ahora devuelven `ActionState`; ningún error llega al error boundary), errores por campo con `aria-invalid`/`aria-describedby` en `fields.tsx`, `SubmitButton`/`ConfirmSubmitButton`/`GhostSubmitButton` con spinner y ≥44 px, hook `useAdminForm` (conserva lo escrito tras un error — React 19 resetea los forms no controlados al terminar la action — y muestra «Cambios sin guardar»), componentes `StatusBadge`/`PageHeader`/`EmptyState`, `loading.tsx`, anchos estandarizados (listas `max-w-5xl`, edición `max-w-3xl`) y actualización de los 12 formularios y 16 páginas del panel. Sin cambios en BD, RLS, auth ni sitio público.

| Verificación | Resultado |
|---|---|
| `npm run lint` / `npm run typecheck` | OK (0 errores, 0 warnings; se añadió `argsIgnorePattern: "^_"` a la config de ESLint) |
| `npm run build` | OK — sitio público sigue SSG (9 `/productos/[slug]`, 4 `/blog/[slug]`); rutas `/admin/*` dinámicas; First Load JS compartido 130 kB |
| Smoke test Playwright (Chrome headless, dev server) | 8/8: sitio público carga sin errores de consola; `/admin` redirige a login; envío vacío → error Zod bajo cada campo con `aria-invalid` + `aria-describedby`; credenciales inválidas → error general inline (`role="alert"`); **el formulario conserva lo escrito tras el error**; capturas responsive 375/768/1280 del login |
| Escenario «base de datos pausada» (ocurrió orgánicamente con Supabase Free durante la prueba) | Mensaje amigable correcto («…la base de datos puede estar pausada»), sin trazas técnicas |
| **Hallazgo corregido durante la verificación** | React 19 resetea los campos no controlados al terminar la Server Action: tras un error de validación se perdía lo escrito. Corregido de forma centralizada con `useAdminForm` (snapshot al enviar + restauración en error), verificado en el smoke test |
| Hydration warning en dev | Causado por el estilo `caret-color` que Chrome/Edge inyectan en inputs (artefacto del navegador, no de la app); solo visible en desarrollo |
| `npm run preview` (workerd real) | 5/5: home y `/productos` 200; `/admin` redirige a login; login renderiza con los campos nuevos; sin errores de consola relevantes |
| **Pendiente manual (requiere credenciales de admin)** | Una operación exitosa y una fallida por módulo dentro del panel (empresa, contacto, productos, imágenes+ficha, marcas, blog, FAQs), toasts tras redirect, teclado/lector de pantalla sobre los toasts, `prefers-reduced-motion`, sesión expirada |

## 2026-08-19 — Galería interactiva de producto + fotos editoriales

Cambios: `ProductGallery` (client component: miniaturas-botón con
`aria-pressed`, visor `<dialog>` nativo, estilos `.product-lightbox`),
`ProductDetail` integra la galería (fin de las miniaturas-enlace que abrían
el `.webp` crudo), banda editorial de 3 fotos en `HomeHero`, figura en
«¿Quiénes somos?» (home), banner + figura en `/nosotros`, rama `photo` en
`import-assets.mjs` (9 fotos importadas a `public/images/photos/` y
`public/images/products/dap-hojaldre/`), SQL preparado sin ejecutar
(`supabase/scripts/2026-08-19-galeria-dap-hojaldre.sql`).

| Verificación | Resultado |
|---|---|
| `npm run lint` / `npm run typecheck` | OK, en silencio |
| `npm run build` (26 páginas; 9 fichas + 4 posts SSG) | OK |
| Galería dap-hojaldre (CDP headless) | Miniatura 2 → `aria-pressed` alterna, alt visible se actualiza, URL intacta, sin pestañas nuevas, sin errores de consola |
| Visor `<dialog>` | Abre con foco en «Cerrar visor», siguiente/anterior ciclan con wrap, cierra sin cambiar URL; controles petrol-deep visibles sobre lienzo blanco (corregido: antes blanco/10 invisible en móvil) |
| Teclado (galería de 3, dap-preparado-graso) | ArrowRight y End mueven foco + selección; Home/End con wrap |
| Las 9 fichas (`curl` en dev) | HTTP 200, miniaturas SSR presentes (2 o 3), botón «Descargar ficha técnica» intacto |
| Fotos nuevas (6 editoriales + 3 producto) | HTTP 200; WebP 1200×1200, 28–77 KB |
| Responsive | 375 px (home, ficha, visor, nosotros), 768 px (sin overflow horizontal), 1440 px — screenshots revisados |
| Catálogo y tarjetas de la home | Siguen mostrando solo la caja (main_image_id, sin cambios) |
| `npm run preview` (workerd real) | 10/10 rutas y assets 200 (home, catálogo, 2 fichas, nosotros, blog, 3 WebP nuevos, PDF de ficha); galería SSR presente |
| `prefers-reduced-motion` | Por código: cross-fade → cambio directo (`motion-reduce:transition-none`), visor con fade corto, `.reveal` no aplica; sin verificación manual con el ajuste del SO |
| **Pendiente manual** | Ejecutar el SQL de dap-hojaldre y re-verificar la galería de 5; vista previa del admin con credenciales; Escape físico del visor (el cierre nativo de `<dialog>` no se puede simular por CDP con fidelidad) |

## 2026-08-19 — Rediseño editorial de /preguntas-frecuentes

Cambios: página FAQ en dos columnas `max-w-6xl` 40/60 — panel `petrol-deep`
(eyebrow ámbar, círculo mostaza, recorte con transparencia de la canasta de
panes en flujo tras el CTA) + acordeón nuevo `FaqAccordion` (numeración
naranja, chevron en círculo mostaza, encabezado abierto en petróleo con
texto blanco, respuesta sobre crema, exclusivo vía `<details name>` nativo).
Script `scripts/recortar-foto-panes.mjs` (flood-fill del fondo blanco puro,
alfa graduado en bordes/sombras, huecos encerrados; derivado 800×745 de
~100 KB registrado en el manifest). `FaqList`, la home y el resto del sitio
intactos.

| Verificación | Resultado |
|---|---|
| `npm run lint` / `npm run typecheck` | OK, en silencio |
| Recorte sobre petrol-deep (preview compuesta con sharp) | Sin halo blanco; el hueco del asa quedó transparente tras 1 ajuste (regiones encerradas mayoritariamente blancas → fondo) |
| 1280×800 (CDP headless) | Grid 40/60; foto superpuesta al círculo sin tapar título ni CTA; abierta: encabezado petróleo + texto blanco, número y chevron en ámbar, respuesta sobre crema |
| Exclusividad (`<details name>`) | Tras abrir la 2ª pregunta queda exactamente 1 `details[open]` (la 2ª), sin JavaScript |
| Sticky condicional del panel | `position: sticky` a 1280×900 y `relative` a 1280×700 (variante `lg:[@media(min-height:53rem)]:sticky`; el panel mide 705 px y con offset 96 px no cabe en portátiles) |
| 375×812 (página completa) | Panel primero, foto reducida (`w-44`) sin tapar título ni CTA; tarjetas del acordeón ≥56 px de alto (táctil ≥44 px) |
| Foco por teclado | `summary` nativo enfocable (`document.activeElement` verificado); anillo interior por utilidades (azul en tarjeta cerrada / blanco sobre petróleo) — confirmar visualmente con Tab físico |
| Home | Intacta: 3 `details` con indicador `+` (`FaqList` sin cambios) |
| `prefers-reduced-motion` | Por código: apertura vía la regla global existente de `::details-content` (encerrada en `no-preference`), chevron `motion-reduce:transition-none`, CTA `motion-reduce:active:scale-100`; sin verificación manual con el ajuste del SO |
| **Pendiente manual (usuaria)** | Revisión de las capturas 1280/375 antes del commit; cierre animado del acordeón exclusivo en Chromium (según versión puede cerrar en seco — aceptado) |
