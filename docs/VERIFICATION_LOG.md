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

## 2026-08-19 — Recortes con transparencia en todas las fotos editoriales

Cambios: `scripts/recortar-foto-panes.mjs` → `scripts/recortar-fotos-editoriales.mjs`
(`git mv` + tabla de trabajos: 5 fotos, `detectHoles` solo en la canasta,
`--solo=<slug>`, `--previews` con lienzo dividido fondo-destino/petrol-deep).
Presentación sin tarjetas blancas: banda del hero (recortes en base común,
`object-bottom` + altura fija por breakpoint), «¿Quiénes somos?» y cierre de
/nosotros en proporción natural. Banner de /nosotros (escena real) y FAQ
intactos. Patrón «Recorte editorial flotante» documentado en DESIGN.md.

| Verificación | Resultado |
|---|---|
| Muestreo de bordes de los 6 originales | 5 packshots con borde 100 % blanco puro; `hero-mesa-panaderia-01` solo 9.5 % (escena) → excluida del recorte por diseño |
| Recortes generados (5) | palmerita 800×551 (78 KB), buñuelos 800×954 (55 KB), canasta 800×745 (99.8 KB, **byte-idéntica** a la de la FAQ), surtido 800×865 (96 KB), hojaldres DAP 1200×486 (96 KB) — todos < 150 KB |
| QA previews (doble fondo crema/petróleo) | **5/5 sin ajustes**: sin halos, plato de secciones íntegro, bol metálico sin perforar, hueco del asa transparente |
| Manifest | 5 entradas `-recorte.webp` presentes tras una sola escritura |
| `npm run lint` / `npm run typecheck` | OK, en silencio |
| Home 1280×800 (CDP headless) | Banda sin cajas, tres recortes apoyados en base común sobre el crema; «¿Quiénes somos?» flotante con plato íntegro; sin errores de consola |
| Home 375 (banda enfocada) | Base común conservada, palmerita levemente más baja por límite de ancho (aceptado); sin overflow horizontal |
| /nosotros 1280 y 375 | Cierre flotante en proporción natural (tira ≈2.47:1); banner de escena real intacto con su marco |
| /preguntas-frecuentes 1280 | Intacta: mismo derivado de canasta, panel y acordeón sin cambios |
| CLS | `width`/`height` reales de cada derivado en el JSX (reserva de espacio correcta) |
| **Pendiente manual (usuaria)** | Revisión de capturas antes del commit; producción seguirá mostrando las tarjetas blancas hasta el próximo deploy |

## 2026-08-19 — Ornamento lateral de obrador (`BakerySideOrnament`)

Cambios: dibujo botánico a mano (887×1774, 138 KB, tinta solo en la franja
izquierda del lienzo: x 100–280 px ⇒ borde derecho del trazo al 31.7% del
ancho) movido a `public/images/decorative/borde-ornamental-cmc.png`; nuevo
componente `BakerySideOrnament` montado en `(public)/layout.tsx`; geometría
en `.bakery-side-ornament` (globals.css): fijo en el margen izquierdo,
centrado en el viewport, altura `clamp(700px, 95vh, 1100px)`, opacidad 0.7,
`z-index: 1`, oculto < 64rem; `left` con `clamp()` que desliza el dibujo
fuera del lienzo en viewports angostos para que la tinta no invada el texto.

| Verificación | Resultado |
|---|---|
| `npm run lint` / `npm run typecheck` | OK, en silencio |
| `npm run build` (26 páginas) | OK |
| Home 1440×900 (CDP headless, top y scroll medio) | Ornamento completo en el margen, fijo al hacer scroll, curvas rozando la columna sin tocar texto; visible sobre crema, blanco y hueso |
| Home 1280×800 | Deslizado parcialmente fuera del lienzo; solo puntas de curva alcanzan el borde del texto (trazos finos a 0.7, legible) |
| Home 1024×800 | Solo puntas mínimas visibles en el borde izquierdo — presencia sin invasión |
| Home 375×812 | `display: none` verificado por `getComputedStyle` |
| Overflow horizontal | `scrollWidth ≤ innerWidth` en 1440/1280/1024/375 (sin scrollbar horizontal) |
| Consola | Sin errores en ninguna resolución |
| Accesibilidad/interacción | `alt=""` + `aria-hidden`, `pointer-events: none`, `user-select: none`, `draggable={false}` — por código |
| **Pendiente manual (usuaria)** | Revisión de las capturas de escritorio antes del commit |

## 2026-08-19 — Ornamento de obrador en el margen derecho

Cambios: `BakerySideOrnament` generalizado con prop `side` ("izquierdo" |
"derecho"); PNG nuevo entregado por la clienta renombrado a kebab-case
(`public/images/decorative/borde-ornamental-cmc-derecha.png`, espejo exacto
del izquierdo: mismo lienzo 887×1774 RGBA, tinta medida a 31.8 % desde el
borde derecho → misma constante 0.158); variante `.bakery-side-ornament--derecha`
en globals.css (`left: auto` + `right` con el mismo clamp en espejo); montaje
del segundo ornamento en `(public)/layout.tsx`. Se actualizó la regla de
DESIGN.md que antes decía "solo en el lado izquierdo" (pedido de la clienta).

| Verificación | Resultado |
|---|---|
| Medición de tinta del PNG derecho | X:[605,787] de 887 — espejo de [99,281]; constante 0.159 ≈ 0.158 del izquierdo (compartida) |
| `npm run lint` / `npm run typecheck` | OK, en silencio |
| Home 1440×900 (CDP headless) | Ambos ornamentos enmarcan la página simétricamente sin tocar la columna de contenido |
| Home 1100×800 | Ambos deslizados fuera del lienzo con solo las puntas visibles (clamp simétrico) |
| Overflow horizontal | `scrollWidth ≤ innerWidth` en 1440 y 1100 |
| 375 px | Ambos `display: none` (solo ≥ lg) |
| Consola | Sin errores |
| **Pendiente manual (usuaria)** | Revisión de la captura de escritorio antes del commit |

## 2026-08-19 — Reubicación de fotos editoriales de la home y centrado del círculo del hero

Cambios (pedidos de la clienta sobre capturas): (1) círculo blanco del hero
centrado con el emblema del logo — medido el frame final del GIF (centro
visual ≈49/49 % del contenedor con `scale-125`) → `left-1/2 top-1/2` +
`-translate-*-1/2`, con `motion-reduce:top-[40%]` porque el PNG estático
tiene el emblema más arriba; (2) la banda de 3 recortes sale del hero y pasa
a la columna derecha de «Propuesta de valor» (`PROMESA_PHOTOS` en `page.tsx`,
grid `lg:grid-cols-[3fr_2fr]`, base común `object-bottom`, `h-24/32/36`);
(3) «¿Quiénes somos?» vuelve al surtido de amasijos (la canasta quedó solo
en «Propuesta de valor» y FAQ — ninguna foto se repite dentro de la home).

| Verificación | Resultado |
|---|---|
| `npm run lint` / `npm run typecheck` | OK, en silencio |
| Hero 1440×900 (CDP headless) | Emblema centrado en la bola blanca; wordmark cruza el borde inferior de forma simétrica; hero sin banda |
| «Propuesta de valor» 1440 | Tres recortes en base común sobre crema profunda, columna derecha centrada respecto al texto |
| «Propuesta de valor» 375 | Fotos bajo el texto en `grid-cols-3` (`h-24`), sin overflow horizontal (`scrollWidth ≤ innerWidth`) |
| «¿Quiénes somos?» 1440 | Surtido de amasijos flotante (800×865), plato íntegro |
| Consola | Sin errores en ninguna captura |
| **Pendiente manual (usuaria)** | Revisión de capturas antes del commit; variante reduced-motion del círculo (`top-[40%]`) sin verificación con el ajuste del SO |

## 2026-08-19 — Unificación del acordeón FAQ (home = página FAQ)

Cambios: la sección de preguntas destacadas de la home pasa de `FaqList`
(compacto, indicador `+`) a `FaqAccordion` (numeración, chevron mostaza,
encabezado petróleo al abrir, exclusivo vía `<details name>`), señalado por
la clienta al ver que ambos acordeones eran distintos. `FaqList` y sus
imports (`Markdown`, tipo `Faq`) se eliminaron de `shared.tsx` — quedaba sin
uso. Un solo patrón de FAQ en todo el sitio.

| Verificación | Resultado |
|---|---|
| `npm run lint` / `npm run typecheck` | OK, en silencio (se retiró también el import huérfano de `Markdown`) |
| Home #faqs 1440 (CDP headless) | Tarjetas numeradas 01–03 con chevron; abierta: encabezado petróleo + respuesta sobre crema, bien delimitada por el borde de la tarjeta aun sobre la sección `bg-cream` |
| Exclusividad en la home | Tras abrir la 2ª pregunta queda exactamente 1 `details[open]` |
| Consola | Sin errores |
| `/preguntas-frecuentes` | Sin cambios (mismo componente) |
| **Pendiente manual (usuaria)** | Revisión de la captura antes del commit |

## 2026-08-19 — «Propuesta de valor» queda con una sola figura (palmeritas)

Cambio: la clienta redujo la composición de tres recortes a solo las
palmeritas — figura única `max-w-md` en la columna derecha del grid,
centrada respecto al texto. Se eliminó `PROMESA_PHOTOS`. Con esto la canasta
vive solo en la página FAQ y el recorte de buñuelos queda disponible sin
uso: **ninguna foto se repite en el sitio**.

| Verificación | Resultado |
|---|---|
| `npm run lint` / `npm run typecheck` | OK, en silencio |
| «Propuesta de valor» 1440 (CDP headless) | Palmeritas solas, proporción natural, centradas verticalmente junto al texto sobre crema profunda; sin errores de consola |
| **Pendiente manual (usuaria)** | Revisión de la captura antes del commit (y vista móvil si quiere afinar el `max-w-md`) |

## 2026-08-19 — «¿Quiénes somos?» pasa del surtido a los buñuelos

Cambio: la clienta reemplazó la figura de «¿Quiénes somos?» por el recorte
de buñuelos (`amasijo-bunuelo-01-recorte.webp`, 800×954, proporción
natural). El recorte del surtido de amasijos queda disponible sin uso;
sigue sin repetirse ninguna foto en el sitio.

| Verificación | Resultado |
|---|---|
| `npm run lint` / `npm run typecheck` | OK, en silencio |
| «¿Quiénes somos?» 1440 (CDP headless) | Buñuelos flotando sobre el hueso en la columna corta del grid, sin tarjeta; sin errores de consola |
| Ajuste de tamaño (mismo día, pedido de la clienta, dos pasadas) | Buñuelos contenidos finalmente a 200px (`max-w-[12.5rem]`, `mx-auto`); ancho renderizado verificado = 200px exactos. Nota: reducir los props `width`/`height` del `<Image>` no cambia el tamaño visible (los gobierna `max-w`); se restauraron a las dimensiones reales 800×954 para la reserva de espacio |
| **Pendiente manual (usuaria)** | Revisión de la captura antes del commit |

## 2026-08-19 — Ilustración dibujada a mano bajo el h1 de /nosotros

Cambio: la clienta entregó `quiénes-somos.png` (ilustración de panes a mano,
1908×824 RGBA con transparencia, 542 KB, misma familia visual que los
ornamentos laterales) para colocarla bajo el «¿Quiénes somos?» de
**/nosotros**. Se optimizó a `public/images/decorative/quienes-somos-panes.webp`
(1200×518, 195 KB, alfa intacto; kebab-case sin tilde — las tildes se
percent-encodean en URLs) y reemplazó a la escena `hero-mesa-panaderia-01`
(queda disponible sin uso). Decorativa pura: `alt=""` + `aria-hidden`, sin
tarjeta, proporción natural. Nota del proceso: un primer intento la colocó
por error en el «¿Quiénes somos?» de la home — revertido de inmediato (los
buñuelos de la home quedaron intactos).

| Verificación | Resultado |
|---|---|
| `npm run lint` / `npm run typecheck` | OK, en silencio |
| /nosotros 1440 (CDP headless) | Ilustración flotando sobre el hueso bajo el título, trazo olivo/ámbar en armonía con los ornamentos laterales; sin errores de consola |
| Home «¿Quiénes somos?» 1440 | Revertida y verificada: buñuelos a 200px como estaban |
| **Pendiente manual (usuaria)** | Revisión de las capturas antes del commit |

## 2026-08-19 — Bloques institucionales de /nosotros con entrada al scroll

Cambio: los 4 bloques («Nuestra promesa», «Experiencia…», «Confianza…»,
«Un aliado…») reciben la clase `reveal` existente — entrada escalonada
scroll-driven (CSS puro, `animation-timeline: view()`; el stagger emerge de
la posición, como en las tarjetas de la home). Sin hover (los bloques no son
interactivos). Sin CSS nuevo; `prefers-reduced-motion` y navegadores sin
soporte quedan cubiertos por la regla existente (aparecen estáticos).

| Verificación | Resultado |
|---|---|
| `npm run lint` / `npm run typecheck` | OK, en silencio |
| /nosotros 1440 (CDP headless) | 4 `section.reveal` en el DOM; tras el scroll los bloques quedan visibles y completos (estado final estable); sin errores de consola |
| Percepción del movimiento | Validarla la usuaria en su navegador (Chromium ≥ 115); con `prefers-reduced-motion` no anima, por construcción |
| **Pendiente manual (usuaria)** | Revisión en el navegador antes del commit |

### Iteración (mismo día): variante `.reveal-strong`

La usuaria no percibía el `.reveal` estándar (10px, entry 10→40%) — deliberadamente
sutil. Se añadió la variante `.reveal-strong` en globals.css (misma voz: subida +
fundido al ritmo del scroll; 36px de recorrido, rango entry 0%→65%, mismo `@supports` +
`prefers-reduced-motion`) y los 4 bloques pasaron a usarla. El `.reveal` estándar no se
tocó.

| Verificación | Resultado |
|---|---|
| `npm run lint` / `npm run typecheck` | OK, en silencio |
| Medición CDP en 4 posiciones de scroll | Al asomar: opacity 0.10 + translateY 32px; completa la subida en ~175px de scroll; estado final estable (opacity 1, transform 0); sin errores de consola |
| Si la usuaria sigue sin ver movimiento | Revisar en su Windows: Configuración → Accesibilidad → Efectos visuales → «Efectos de animación» (apagado ⇒ el navegador reporta reduced-motion y el sitio no anima, por diseño). Chequeo en consola: `matchMedia('(prefers-reduced-motion: reduce)').matches` |

## 2026-08-19 — Ajustes del hero y de «¿Quiénes somos?» (pedido de la clienta)

Cambios: (1) el círculo blanco del hero pasa de offsets fijos por breakpoint a
centrado con el emblema del logo — medido el frame final del GIF: con
`scale-125` el centro visual del emblema cae en ≈49/49 % del contenedor, así
que `left-1/2 top-1/2 -translate-x/y-1/2` basta; el PNG estático de
reduced-motion tiene el emblema más arriba → `motion-reduce:top-[40%]`.
(2) «¿Quiénes somos?» (home) muestra la canasta recortada
(`canasta-panes-surtidos-01-recorte.webp`, 800×745) en lugar del surtido de
amasijos, elegida por la clienta; el recorte del surtido queda disponible sin
uso.

| Verificación | Resultado |
|---|---|
| Medición del emblema | GIF frame final (512×340): centro 48.9/49.1 % → visual 48.6/48.9 % con scale-125; PNG (1920×1080): 52.0/42.3 % → visual 52.5/40.4 % |
| `npm run lint` / `npm run typecheck` | OK, en silencio |
| Home 1440×900 | Emblema centrado en la bola blanca; wordmark cruza el borde inferior de forma simétrica |
| «¿Quiénes somos?» 1440 | Canasta flotando en la columna corta, sin tarjeta |
| Consola | Sin errores |
| **Pendiente manual (usuaria)** | Revisión de capturas antes del commit; verificar visualmente la variante reduced-motion si se desea precisión en ese modo |

## 2026-08-20 — Diagnóstico «edité en el admin y no se refleja» + revalidación verificada en producción

Investigación de solo lectura sobre producción (D1 remota, REST anónimo de
Supabase, HTML servido, lista de deploys) a raíz del reporte de la usuaria
tras crear su cuenta admin (`iamanitabea@gmail.com`):

| Verificación | Resultado |
|---|---|
| Tabla `revalidations` en D1 `cmc-website-tags` (remota) | Existe; recibe escrituras con el build id vigente en cada edición del admin |
| Ediciones de empresa (`home_intro` 19-08 00:08 UTC, `about_ally` 19-08 15:01 UTC) | En la BD (`updated_by` = usuaria) **y presentes en el HTML servido** por workers.dev — la cadena admin → BD → revalidación → sitio público funciona |
| Prueba «IIIIII» de la usuaria | Se publicó y su corrección la eliminó: no está ni en la BD ni en el HTML vivo. Lo que la usuaria seguía viendo era caché/pestaña vieja de su navegador |
| Ediciones de blog | Nunca llegaron a la BD (posts sin cambios desde 05-08) y no existe ninguna escritura del tag `posts` en D1 → `updatePost` no llegó a ejecutarse; pendiente reproducir con la usuaria |
| Cabeceras del sitio | `x-opennext: 1`, `x-nextjs-cache: HIT` — páginas servidas por el worker desde la caché incremental R2, no como assets inmutables |
| Deploys | Workers Builds activo (varios deploys el 19-08; último 20-08 02:43 UTC) |
| Binding `WORKER_SELF_REFERENCE` | No configurado y no necesario: solo lo exige ISR por tiempo con queue, que el sitio no usa |

Cambios derivados (mismo turno):

| Verificación | Resultado |
|---|---|
| Todo update comprueba filas afectadas (`.select("id")` + `NO_ROWS_MESSAGE` en `action-state.ts`) | settings, content, faqs, posts (artículo/portada), brands (marca/logo), products (producto/alt/ficha/imagen principal) — un update de 0 filas (p. ej. filtrado por RLS) ya no muestra éxito en falso |
| `npm run deploy` | Ahora con `-- --env production` (antes apuntaba al entorno dev, con D1 placeholder, y habría creado un worker paralelo) |
| `npm run lint` / `npm run typecheck` | OK, en silencio |
| **Pendiente manual (usuaria)** | Ver el sitio en incógnito o con Ctrl+F5 (debe mostrar sus textos); repetir la edición del blog fijándose en el aviso al guardar — si vuelve a no reflejarse, depurar `PostForm`/`updatePost` |

## 2026-08-20 — Fondo fotográfico rotativo del hero (home)

Cambio: capa de fondo en `HomeHero` con 7 fotos del cliente en crossfade CSS
puro + zoom Ken Burns sutil (`.hero-slides`/`.hero-slide` en `globals.css`,
ciclo 42s, opacidad textura `--hero-slides-opacity` 0.15, `-z-10` bajo todo
el contenido). Pedido de la clienta: nada de lo existente se tocó (texto,
logo, círculo blanco, botones intactos).

| Verificación | Resultado |
|---|---|
| `npm run lint` / `npm run typecheck` | OK, en silencio (`fetchPriority` aceptada por `next/image`) |
| Capa montada (driver CDP, dev server) | 7 `.hero-slide`, contenedor a opacity `0.15`, animación `hero-slide-cycle / 42s` activa |
| Home 1440×900 en t≈0 y t≈8s (screenshots) | Dos slides distintas (mesa de panadería → aplicación DAP Hojaldre): fundido operando, textura discreta, texto legible, círculo blanco y logo intactos (sin artefactos del `mix-blend-multiply` en la zona que sobresale del círculo) |
| Home 500px (viewport móvil) | Sin scroll horizontal, layout intacto, textura presente sin competir con el texto |
| Consola del navegador | Sin errores |
| Reduced motion | Por construcción CSS (`.hero-slide:first-child { opacity: 1 }` bajo `prefers-reduced-motion: reduce`); no emulado en esta sesión |
| **Pendiente manual (usuaria)** | Ver la home y calibrar la intensidad: si la textura se ve fuerte o débil, ajustar solo `--hero-slides-opacity` (rango 0.12–0.18); si el ritmo se siente rápido, subir el ciclo a 49s (delays de 7s) |

## 2026-08-20 — Ornamentos por sección (no fijos) y home con 2 productos

Cambios (pedidos de la clienta): (1) los ornamentos de obrador dejan de ser
`position: fixed` globales — pasan a `position: absolute` dentro de una
sección anfitriona (full-bleed, `relative overflow-x-clip`; altura
`min(86%, 900px)` relativa al host) y se montan SOLO en tres anclas:
pilares de la home (prop `withOrnaments` de `HomePillars`; /nosotros
reutiliza el componente sin ornamentos), zona alta de /nosotros (título +
ilustración, contenedor dividido en dos) y la página de contacto; se
desmontaron de `(public)/layout.tsx`. (2) La home muestra solo 2 productos
destacados en una fila (`products.slice(0, 2)`) + «Ver catálogo».

| Verificación | Resultado |
|---|---|
| `npm run lint` / `npm run typecheck` | OK, en silencio |
| Home 1440 (CDP headless) | 2 `.bakery-side-ornament` en el DOM (solo en pilares, anclados a la sección — scrollean con ella); grid del catálogo con exactamente 2 productos + botón «Ver catálogo» |
| /nosotros 1440 | 2 ornamentos solo en la zona alta (título + ilustración); pilares y resto de la página limpios |
| /contacto 1440 | 2 ornamentos flanqueando el contenido, escalados a la altura de la página |
| /preguntas-frecuentes | 0 ornamentos (antes los tenía por ser globales) |
| Overflow horizontal | `scrollWidth ≤ innerWidth` en home, /nosotros y /contacto a 1440 (el `overflow-x-clip` de cada host recorta lo que el clamp empuja fuera) |
| Consola | Sin errores en ninguna página |
| **Pendiente manual (usuaria)** | Revisión de capturas antes del commit |

## 2026-08-20 — Datos de contacto oficiales, mapa y público objetivo

Cambios: (1) los datos de contacto entregados por la clienta se cargan en
`site_settings` (script `supabase/scripts/2026-08-20-datos-contacto.sql` +
`seed.sql`); (2) `ContactMap` embebe Google Maps derivando la consulta de la
dirección del CMS, sin API key ni campo nuevo; (3) `AudienceSectors` cierra
`/contacto` con los 12 sectores atendidos.

| Verificación | Resultado |
|---|---|
| `npm run lint` / `npm run typecheck` | OK, en silencio |
| Geocodificación de la dirección (iframe aislado, CDP) | Con la dirección COMPLETA el pin caía sobre el edificio correcto pero rotulado **«Office To Go S.A.S»** (empresa vecina de la misma torre). Quitando los segmentos de detalle interior (`Torre Ofiespacios`, `Of. 325-326`) resuelve a **«Centro Comercial Metrópolis +, Av. 68 #75a – 50»** — de ahí la regla `INTERIOR_SEGMENT` de `buildMapQuery` |
| `ContactMap` dentro del layout real (ruta temporal, ya borrada) | Mapa cargado con el pin en el C.C. Metrópolis; `src` del iframe y `href` de «Cómo llegar» apuntan a la misma consulta recortada; el `figcaption` sí muestra la dirección **completa** (con torre y oficinas) |
| `/contacto` 1440×900 | Sección de sectores en 3 columnas × 4 filas, divisores y punto ámbar alineado a la primera línea (verificado en el ítem de dos líneas, «Distribuidores de insumos…»); 2 ornamentos solo en la zona de canales, sin invadir la banda crema |
| `/contacto` 390×844 (móvil) | Una columna, jerarquía intacta, sin scroll horizontal |
| Overflow horizontal | `scrollWidth ≤ innerWidth` a 1440 y a 390 |
| Consola del navegador | Sin errores |
| **Bloqueado hasta ejecutar el SQL** | Teléfono, WhatsApp, dirección y **el mapa dentro de `/contacto`** no se renderizan todavía: `site_settings` sigue en NULL en la BD de desarrollo (el `.env.local` no tiene `SUPABASE_SERVICE_ROLE_KEY`, así que no se pudo cargar desde aquí). La página muestra «Canales de contacto en preparación». Ejecutar el script en el SQL Editor de dev y de producción, y guardar en `/admin/contacto` para revalidar |
| **Pendiente manual (usuaria)** | Tras cargar los datos: comprobar que el botón de WhatsApp abre `wa.me/573103963790` y el de llamada `tel:+573112555296` |

## 2026-08-20 — «¿Quiénes somos?» (home) pasa de los buñuelos a la bodega DAP

La clienta reemplazó el recorte de buñuelos por una **escena real de bodega**
(pasillo con estibas de cajas DAP) y pidió, en la misma revisión, que el texto
de la sección quedara centrado verticalmente respecto a la foto.

| Verificación | Resultado |
|---|---|
| `npm run lint` / `npm run typecheck` | OK, en silencio |
| Derivado publicado | `public/images/photos/bodega-dap-01.webp` 1200×845, 260 KB (receta del importador: máx. 1200 px, WebP q82, desde el JPEG de 1227×864 / 377 KB). Ya estaba versionado; la regeneración salió **byte-idéntica** |
| Procedencia del original | `quienessomosprincipal.jpeg` es **byte-idéntica** (md5 `7161cff1…`) a `content-source/fotos-adicionales/98f713d0-…d9.jpeg`, fila DESCARTADA el 2026-08-19 por indicios de IA. Se publica por **elección explícita de la clienta** (salvedad prevista en la alerta de `docs/FOTOS_ADICIONALES.md`); su origen sigue **sin confirmar** |
| Tratamiento visual | Escena real ⇒ no se recorta y conserva marco: `rounded-lg` + `border border-border`, sin sombra (Flat-At-Rest). Ocupa el ancho de la columna corta del grid `lg:grid-cols-[2fr_3fr]` |
| Home 1440 (CDP headless) | Foto enmarcada en la columna izquierda y párrafo centrado verticalmente contra ella (`lg:items-center`): centro del bloque de texto ≈ centro de la columna de la foto; sin errores de consola |
| **Pendiente (clienta)** | Confirmar el origen de la foto de bodega. Si resultara generada con IA, chocaría con «no fabricar evidencia» de `PRODUCT.md`, porque aquí opera como escena real de la operación |
| **Pendiente manual (usuaria)** | Revisión de la captura antes del commit; el recorte `amasijo-bunuelo-01-recorte.webp` queda disponible sin uso |

## 2026-08-20 — «Propuesta de valor» (home) pasa de las palmeritas al panadero

Segundo relevo fotográfico del día: la clienta reemplazó el recorte flotante
de palmeritas por una **escena de panadería** (panadero tras un carro de
croissants), entregada como `public/images/photos/nuestra-promesa.png`.

| Verificación | Resultado |
|---|---|
| `npm run lint` / `npm run typecheck` | OK, en silencio |
| Derivado publicado | `public/images/photos/panadero-croissants-01.webp` 985×700, **47 KB** (desde el PNG de 985×700 / 964 KB; WebP q82, sin reescalado porque ya está bajo los 1200 px del importador) |
| Procedencia del original | **Sin coincidencia byte a byte en `content-source/`** (md5 `99700e5d…`): no pasó por el QA de identificación del 2026-08-19 y su origen no está documentado. Aspecto de banco de imágenes (croissants franceses, no amasijos colombianos) frente a «cero fotografía de stock» de `PRODUCT.md`/`DESIGN.md` |
| Tratamiento visual | Escena real ⇒ marco `overflow-hidden rounded-lg border border-border`, sin sombra; `w-full` en la columna derecha del grid `lg:grid-cols-[3fr_2fr]`, que ya traía `lg:items-center` |
| Home 1440 (CDP headless) | Foto enmarcada a la derecha, alineada verticalmente con el bloque de texto sobre crema profunda; el marco arena se lee bien sobre ese fondo; sin errores de consola |
| Nota de entorno | El dev server de la usuaria se había caído (`ERR_CONNECTION_REFUSED` en la primera captura); se relanzó `npm run dev` y **queda corriendo** |
| **Pendiente (clienta)** | Confirmar origen y licencia de la foto; si es de banco de imágenes, choca con la regla «cero fotografía de stock» |
| **Pendiente manual (usuaria)** | Revisión de la captura antes del commit; el recorte `palmerita-hojaldre-01-recorte.webp` queda disponible sin uso |

## 2026-08-21 — Portadas fotográficas para el blog (fotos entregadas la noche del 2026-08-20)

La clienta dejó 4 fotos nuevas en `public/images/photos/`. Se derivaron a
`public/images/blog/` (carpeta nueva: los covers **sí** llevan fila en
`media_assets` porque `blog_posts.cover_image_id` es FK, a diferencia de las
fotos editoriales referenciadas por ruta en JSX) y se preparó
`supabase/scripts/2026-08-20-covers-blog.sql`.

| Verificación | Resultado |
|---|---|
| Derivados generados (WebP q82, máx. 1200 px) | `amasijos-maiz-tabla-01` 1200×675 (129 KB), `panes-surtidos-canasta-01` 985×555 (94 KB), `hojaldre-capas-macro-01` 1200×801 (60 KB), `croissants-bandeja-horno-01` 325×245 (15 KB) |
| Ruta de servicio | `mediaUrl()` devuelve `storage_path` tal cual para provider `STATIC` (`src/lib/media.ts:11`), así que `/images/blog/<archivo>.webp` se sirve como asset estático — sin pasar por `/api/media` |
| Encaje de los recortes | Los covers se pintan con `object-cover` a `aspect-[16/10]` (destacado de la home), `aspect-[16/9]` (tarjetas) y ancho completo en el artículo: las tres fotos asignadas están entre 16:9 y 3:2, así que el recorte no pierde el motivo |
| Cuarta foto **no asignada** | `Croissants-Julian-Plumart.webp` mide 325×245: como portada de artículo se estiraría a ~1200 px (borrosa) y el único hueco libre («Consejos para almacenar materias primas») no encaja temáticamente. Queda derivada pero fuera del script |
| Procedencia | Ninguna de las 4 coincide byte a byte con `content-source/`; sin QA de identificación ni licencia documentada (ver `docs/FOTOS_ADICIONALES.md`) |
| **Pendiente de ejecutar** | El script en el SQL Editor (dev y producción). Hasta entonces los 4 artículos siguen con `EditorialCover`; la verificación visual de las portadas queda pendiente de esa ejecución |
| **Pendiente (clienta)** | Confirmar origen/licencia de las fotos y entregar una imagen para el artículo de almacenamiento |

## 2026-08-21 — Imágenes dentro del cuerpo de los artículos del blog

El editor solo admitía una imagen por artículo (la portada). Ahora se pueden
subir imágenes al cuerpo y colocarlas en el punto del texto donde está el
cursor: migración `0005_post_media.sql`, acciones `uploadPostImage` /
`removePostImage`, puente cliente `src/components/admin/markdown-insert.tsx`
y marco CSS `.prose-cmc img`.

| Verificación | Resultado |
|---|---|
| `npm run lint` / `npm run typecheck` | OK, en silencio |
| `npm run build` (Turbopack) | Compila entero, incluidas las rutas de `/admin` — la única forma de validar el editor sin sesión, porque el middleware redirige a login (307) antes de compilar la página |
| `rehype-sanitize` con `src` relativa | **Conserva** la imagen: ruta temporal `(public)/tmp-md` con `![alt](/images/blog/hojaldre-capas-macro-01.webp)` → `<img>` presente en el DOM con su `alt` intacto. Ruta ya borrada |
| Marco CSS aplicado (misma ruta, CDP a 1440) | `display: block`, `border-radius: 16px` (= `--radius-lg`), borde `1px rgb(228,224,216)` (arena), `margin-top: 24px`; renderiza 736×492 desde un original de 1200×801 dentro de la columna `max-w-3xl`. Sin errores de consola |
| Carga perezosa | El `img` de Markdown NO la trae de serie: se añade mapeando `components.img` en `src/lib/markdown.tsx` (`loading="lazy"`, `decoding="async"`) |
| Aviso de ruta privada | Una carpeta `__tmp-md` con guiones bajos NO se enruta (Next la trata como privada): la verificación falló con 404 hasta renombrarla a `tmp-md` |
| **Pendiente de ejecutar** | `supabase/migrations/0005_post_media.sql` en el SQL Editor (dev y producción) y después `supabase/tests/rls_checks.sql`. Mientras tanto la sección aparece vacía —la consulta falla en silencio y la página se degrada, no rompe— y subir da error de BD |
| **Pendiente manual (usuaria, requiere sesión admin)** | Subir una imagen; comprobar que aparece en la lista, que «Insertar en el texto» la coloca en el cursor y enciende «Cambios sin guardar», que subir con cambios sin guardar no borra lo escrito, y que «Quitar» se niega mientras la imagen siga en el texto |

## 2026-08-20 — Iconos en los CTA de WhatsApp y llamada

Cambio (pedido de la clienta): los botones de contacto pasan de solo texto a
llevar glifo. Componente nuevo `src/components/public/icons.tsx` con
`WhatsAppIcon` (glifo oficial de la marca) y `PhoneIcon`, montados en los tres
CTA: `/contacto`, la banda final de la home y la ficha de producto. Son los
primeros iconos **rellenos** del sitio; el resto sigue en trazo 2px.

| Verificación | Resultado |
|---|---|
| `npm run lint` / `npm run typecheck` | OK, en silencio |
| Tamaño óptico de los dos glifos | Medido con `getBBox()`: el trazado de WhatsApp ocupa 23.9×24 de su lienzo y el del auricular solo 18×18, así que a igual clase renderizaba a 15 px contra 20 px (**75 %**, visiblemente dispar). Corregido con `viewBox="2 2 20 20"` en `PhoneIcon` → **18 px contra 19.9 px (90 %)**, la proporción buscada para una mancha sólida frente a un anillo con hueco |
| `/contacto` 1440×900 | Glifo blanco sobre el verde; auricular en petróleo sobre el botón outline. Los dos botones leen como pareja |
| `/contacto` 390×844 | Ambos a ancho completo, icono y texto centrados como grupo, sin scroll horizontal |
| Altura de los dos botones | Antes 52 px (relleno) contra 56 px (outline, por su borde de 2 px): desparejos al apilarse en móvil. Compensado con `py-3` en el outline → **52 px los dos**, en móvil y en escritorio. Es la misma convención que ya usaba el CTA outline de `ProductDetail` (`py-[10px]`) |
| Home, banda `¿Hablamos de tu negocio?` | Glifo en petróleo profundo sobre el ámbar, contraste suficiente; botón sin cambio de altura |
| Ficha de producto (`/productos/dap-hojaldre`) | Icono a `size-4` (15.9 px), alineado con el texto de 14 px; convive con el CTA de ficha técnica sin desbordar |
| Accesibilidad | Los dos SVG llevan `aria-hidden="true"` y ningún `<title>`: el texto del botón ya dice «WhatsApp» y «Llámanos», así que no hay anuncio duplicado |
| Consola del navegador | Sin errores en ninguna de las tres páginas |
| Datos de contacto en vivo | Primera verificación con `site_settings` ya cargado: los enlaces resuelven a `wa.me/573103963790` y `tel:+573112555296` — el prefijo `+57` guardado cumple su función |

## 2026-08-21 — Auditoría de la BD de desarrollo y arreglo de `rls_checks.sql`

Al ejecutar las pruebas RLS en el SQL Editor saltó
`ERROR: 42P01: relation "rls_expected" does not exist`. La usuaria preguntó si
además le faltaban otros scripts: se auditó la base `bkvvosaqtutnwyamqipo` vía
PostgREST con la clave pública (solo lectura, sin service role — la variable
existe en `.env.local` pero está vacía).

| Elemento | Estado en dev |
|---|---|
| Migraciones `0001`–`0005` | **Todas aplicadas**: existen `profiles`, `media_assets`, `site_settings`, `company_content`, `product_categories`, `products`, `product_media`, `blog_posts`, `faqs`, `brands` y **`post_media`** |
| `2026-08-17-normalizacion-catalogo.sql` | Aplicado: 9 productos DAP `PUBLISHED`, cada uno con `technical_sheet_media_id` |
| `2026-08-20-datos-contacto.sql` | Aplicado: teléfono `+57 311 255 5296`, WhatsApp `+57 310 396 3790` y dirección cargados; `email` sigue nulo |
| `2026-08-19-galeria-dap-hojaldre.sql` | **Pendiente**: DAP Hojaldre tiene 2 filas en `product_media` (sort 0 y 1), no 5 |
| Portadas del blog | Los 4 artículos con `cover_image_id` en null y **ningún** `media_assets` bajo `/images/blog/` → siguen las portadas tipográficas |
| Marcas | 0 filas (por eso la sección no aparece; correcto) |
| Restos de la corrida fallida | **Ninguno**: sin `media_assets` `prueba-rls*` ni marcas de prueba — el fallo revirtió limpio |

**Diagnóstico del 42P01.** El script creaba la tabla **temporal** `rls_expected`
en una sentencia y la leía desde otras, después de `set local role anon`. Pasó
el 2026-08-17 porque entonces se ejecutó por la **Management API** (una sola
sesión, rol `postgres`), no por el editor del dashboard — que es justo lo que
mandan `CLAUDE.md` y `docs/DEPLOYMENT.md`. En el editor la temporal no
sobrevive y toda comprobación que la lee falla. No era un problema de la base
ni de la migración 0005.

**Arreglo.** `supabase/tests/rls_checks.sql` pasa a ser **una sola sentencia
`do $$ … $$`**: los conteos esperados viven en variables plpgsql, los cambios
de rol se hacen dentro con `set_config('role', …, true)` (y `'none'` al final,
= RESET ROLE, para no suponer que la sesión se llama `postgres`), y el bloque
borra sus propios datos de prueba al terminar. Si algo falla, la sentencia
entera se revierte sola, así que ya no depende del `begin/rollback` exterior
—que se mantiene como segunda red— ni de que la herramienta respete la
transacción. Las escrituras de administrador se movieron a los datos de prueba
(antes tocaban `dap-hojaldre` real). Se conservan todas las aserciones,
incluidas las de `post_media` y el ciclo de funciones de galería de la 0004.

| Verificación | Resultado |
|---|---|
| `npm run lint` / `npm run typecheck` | OK, en silencio (no cambia código de la app) |
| **Pendiente (usuaria)** | Pegar el `rls_checks.sql` reescrito en el SQL Editor → debe terminar sin error y con «TODAS LAS PRUEBAS RLS PASARON». Después se comprueba desde aquí que no quedó ningún `prueba-rls*` en `media_assets` |

## 2026-08-21 — `2026-08-19-galeria-dap-hojaldre.sql` fallaba con 55000

Al pegarlo en el SQL Editor: `ERROR: 55000: ON CONFLICT does not support
deferrable unique constraints/exclusion constraints as arbiters`. El script
insertaba en `product_media` con `on conflict do nothing` **sin árbitro**, y sin
árbitro Postgres toma como candidatos todos los índices únicos de la tabla —
incluido `unique (product_id, sort_order)`, que la migración 0004 creó
**DEFERRABLE INITIALLY DEFERRED**. Arreglado nombrando el árbitro no diferible
de 0001: `on conflict (product_id, media_asset_id) do nothing`, que además es la
unicidad que de verdad interesa (no repetir la misma imagen en el producto).

| Verificación | Resultado |
|---|---|
| Estado tras el fallo (PostgREST, solo lectura) | **Nada quedó a medias**: ningún `media_assets` nuevo bajo `/images/products/dap-hojaldre/` (siguen solo caja, aplicación y ficha) y la galería sigue con 2 filas |
| Dato colateral importante | Que la primera inserción NO se colara demuestra que **el SQL Editor sí respeta la transacción** (`begin; … error → abort`). Es decir, el `42P01` de `rls_checks.sql` no venía de que las sentencias no compartieran sesión, sino del **cambio de rol**: tras `set local role anon`, el rol no ve el esquema `pg_temp` del creador y la tabla temporal «no existe». La reescritura a variables plpgsql ataca justo esa causa |
| Archivos con `on conflict do nothing` sin árbitro | Solo quedaba este y `supabase/seed.sql` (sobre `faqs`, sin restricciones diferibles: no le afecta) |
| **Pendiente (usuaria)** | Volver a pegar el script corregido; después se comprueba desde aquí que la galería queda en 5 filas y que `main_image_id` sigue en `sort_order = 0` |

## 2026-08-21 — Portadas del blog que no se guardaban + rotación editorial en la home

La usuaria reportó que había subido imágenes para el blog y no se reflejaban en
la home. **No era caché ni revalidación.**

**Causa raíz.** `UploadImageForm` traía los ids del formulario escritos a mano
(`id="file"`, `id="alt_text"`). `/admin/blog/[id]` es la **única** página que
monta dos instancias del componente — «Imágenes dentro del artículo» (línea 134)
y «Imagen de portada» (línea 170) — y la del cuerpo va primero en el DOM porque
`PostForm` pinta `{form}{children}`. Con ids duplicados el navegador resuelve
`htmlFor` al **primer** match: al pulsar «Archivo…» en la sección de portada se
abría el selector del formulario del cuerpo. La foto acababa en el formulario
equivocado o el de portada se enviaba vacío, y `cover_image_id` nunca cambiaba.
`UploadDocumentForm` ya usaba ids propios (`sheet_file`, `display_name`)
precisamente para convivir con `UploadImageForm` en la página de producto: al de
imagen se le pasó. **Arreglo**: ids derivados de `useId()`; los `name` siguen
fijos porque son el contrato con la Server Action.

Descartado antes de llegar ahí: no hay desajuste form↔action (la portada la
escribe `uploadPostCover`, no `updatePost`, y el `update` parcial de Supabase no
la pisa), la cadena de revalidación está bien (`posts.ts:189` →
`CACHE_TAGS.posts`), y `media_assets` es de lectura pública, así que RLS no
oculta portadas.

| Verificación | Resultado |
|---|---|
| BD (PostgREST, solo lectura) | Los 4 artículos con `cover_image_id` en null y **cero** filas `media_assets` con `storage_provider = 'R2'`: no llegó ninguna subida, nunca |
| Producción (`/blog` en workers.dev) | Los 4 artículos con bloque de color y numeral (01–04), ningún `src` a `/images/blog/` ni `/api/media/` — mismo estado que en local, no era una pestaña vieja |
| `.wrangler/state/v3/r2/cmc-website-media-dev/blobs/` | Vacío: tampoco quedó nada en el bucket simulado local |
| `npm run lint` / `npm run typecheck` | OK, en silencio |

**Rotación editorial (`HomePostsRotator`).** Pedido de la usuaria: que los
artículos «vayan rotando para que se vea movimiento». CSS puro (`.blog-rotator`
en `globals.css`), turnos de 6 s con fundido de 0.6 s, índice lateral
sincronizado por barra ámbar. `/blog` conserva la versión estática.

| Verificación | Resultado |
|---|---|
| Fallo detectado en la primera pasada | Los tres artículos se pintaban **superpuestos**. El atajo `animation: … infinite` resetea `animation-delay` a 0 y sus reglas (`.blog-rotator[data-slides="3"] .blog-slide`, especificidad 0-3-0) ganaban a las de escalonado (`.blog-slide:nth-child(2)`, 0-2-0) → los tres turnos arrancaban a la vez. Corregido pasando a propiedades largas (`animation-name`/`-duration`), que no resetean nada. El hero se salva de esto solo por el orden de especificidad de sus selectores |
| Retardos tras el arreglo (`getComputedStyle`) | `0s / 6s / 12s`; visibilidad `visible / hidden / hidden` — un solo artículo en escena |
| Turnos 1440×900 (t=0, t≈6.5 s, t≈12.5 s) | Escenario en «Amasijos» (01) → «Los beneficios de comer pan» (02) → «Consejos para almacenar» (03), con la barra ámbar del índice moviéndose a la fila correspondiente. Sin desplazamiento de layout: los artículos comparten celda de grid |
| 390×844 | Primer intento: el índice repetía justo debajo la tarjeta del artículo que ya estaba en escena, con miniatura y todo — se leía como duplicado. Corregido ocultando la miniatura bajo `lg` (`max-lg:hidden`): queda un sumario de titulares con la barra ámbar |
| `/blog` | 0 `.blog-rotator` en la página: el archivo sigue estático, como debe |
| Consola del navegador | Sin errores en ninguna captura |
| **Pendiente (verificación)** | La pausa en `:hover`/`:focus-within` está en el CSS (mismo patrón que `.brands-marquee`) pero **no se probó interactivamente**: el driver CDP no expone hover |

### Mismo día, más tarde — portadas cargadas y dos correcciones

La usuaria ejecutó `supabase/scripts/2026-08-20-covers-blog.sql` y reportó que
«no sale nada». El script **sí funcionó**; lo que fallaba era otra cosa.

| Verificación | Resultado |
|---|---|
| BD tras el script (PostgREST) | Las 3 filas `STATIC` creadas y asignadas: amasijos → `2bb21fee…`, pan → `0be2f935…`, hojaldre → `987fea84…`. Solo «consejos-para-almacenar…» sigue en null, como estaba previsto |
| Producción | HTML con `x-nextjs-cache: HIT` y sin ningún `src` a `/images/blog/`: el commit del rotador **sí** está desplegado (`.blog-slide` presente en el HTML), pero la página se prerenderizó **antes** de correr el SQL y la copia cacheada en R2 no se invalidó sola. El sitio no revalida por tiempo — solo bajo demanda desde el admin — así que el SQL directo a la BD nunca dispara `revalidateTag` |
| Local, tras `rm -rf .next/cache` | Los 3 `src` correctos y las 3 fotos decodificadas (`naturalWidth` 1200/985/1200). La primera captura salió en gris solo porque el servidor acababa de arrancar |
| `public/images/blog/` | Los 4 WebP están **rastreados por git** y el servidor los entrega (200, `image/webp`). No aplica el riesgo de bucket: son `STATIC`, no R2 |

**Corrección del fundido.** Con fotos reales se vio lo que con los bloques de
color pasaba desapercibido: el cruce **solapado** de 0.6 s superponía los dos
titulares y los dos resúmenes (visión doble) y encendía dos barras del índice a
la vez. Se pasó a fundido **encadenado**: 5.4 s en pantalla, 0.6 s de salida y
0.6 s de entrada del siguiente, sin solape. Muestreo de opacidades durante una
transición: `0.50/0/0` → `0/0.19/0` → `0/0.78/0` → `0/1.00/0` — nunca hay dos
artículos con opacidad simultánea.

| Verificación | Resultado |
|---|---|
| Turnos 1440×900 con fotos | Amasijos (tabla de madera) → pan (canasta) → hojaldre (macro de capas), cada uno con su miniatura en el índice y la barra ámbar siguiéndolo |
| `npm run lint` / `npm run typecheck` | OK, en silencio |
| **Pendiente (usuaria)** | Forzar la revalidación de producción: guardar cualquier artículo desde `/admin/blog/<id>` dispara `revalidatePublicContent(CACHE_TAGS.posts)` y reemplaza el HTML cacheado. Un `git push` nuevo también sirve (Workers Builds reconstruye con los datos ya cargados) |

### Mismo día — `/blog` encabezaba con el único artículo sin foto

La usuaria señaló que la página `/blog` «quedó igual». Dos defectos reales, no uno:
seguía estática (decisión mía al implementar el rotador, para no mover contenido
en una página de archivo) y, sobre todo, su escenario destacado mostraba
«Consejos para almacenar…» —el único artículo **sin portada**— en el bloque
petróleo de 640×400, mientras los dos artículos con foto quedaban de miniatura.

Revisada la objeción de usabilidad: en este rotador **el índice lista siempre
los tres artículos en escena**, así que la rotación cambia lo que se muestra en
grande, no lo que se puede clicar — ningún destino se esconde tras un
temporizador. Con eso, el argumento para dejar el archivo estático se cae.
`/blog` pasa a usar `HomePostsRotator`, y el orden «primero los que tienen
portada» se extrae a `sortPostsByCoverFirst` (`src/lib/content.ts`) para que la
home y `/blog` compartan la misma regla.

| Verificación | Resultado |
|---|---|
| `/blog` 1440×900 | Escenario rotando entre los 3 artículos con foto (amasijos → pan → hojaldre), cada uno con su miniatura en el índice y la barra ámbar siguiéndolo |
| Artículo sin portada | «Consejos para almacenar…» baja a las tarjetas del final (`main ul li h3` devuelve solo ese título): no desaparece del archivo, deja de encabezarlo |
| `npm run lint` / `npm run typecheck` | OK, en silencio |

## 2026-08-23 — Relevo GIF → vector del logo del hero

La clienta reportó que el logo del hero se veía borroso. Causa medida: el GIF
mide **512×340** y en el hero se pinta a **~638 px** (columna de 511 px con
`scale-125`), así que el frame final quedaba interpolado y con la trama de la
paleta de 256 colores. Solución: el GIF sigue haciendo la animación y, al
terminar, **cede el puesto** al logotipo en vector `public/brand/logo-cmc.svg`
(entregado por la clienta). No es un fundido cruzado sino un relevo seco con
`step-end` — un crossfade dejaba ver la superposición de las dos capas.

El SVG venía con el lema «SU ALIADO EN LOS NEGOCIOS» (7 % más alto que el
lockup del GIF); su `viewBox` se recortó a `2 2.125 607.875 578.625`, corte que
cae en el hueco entre la razón social (termina en y=580.75) y el lema (empieza
en y=602).

| Verificación | Resultado |
|---|---|
| Alineación vector ↔ frame final del GIF | Tinta del GIF medida en 19.53–78.32 % (x) y 15–99.41 % (y) del lienzo 512×340; el PNG `logo-cmc-png-copia-1` coincide dentro de 0.15 %. Diferencia de imagen del vector colocado sobre el frame final: solo hairlines de antialiasing, **sin desplazamiento ni cambio de escala** |
| Colores | Vector `#4285F5` / `#33A854` / `#EB4236` = promedio por banda del ráster, exacto |
| Geometría en el navegador (1440×900 y 390×844) | `left 19.53 % · top 15 % · ancho 58.79 %` respecto de la caja del GIF en ambos viewports; borde inferior a 99.26 % vs 99.41 % del GIF (0.6 px) |
| Relevo sin solape | Muestreo de opacidades en t = 0…3000 ms: hasta 1999 ms `gif:1 / svg:0`, desde 2000 ms `gif:0 / svg:1`. **Nunca ambos visibles, nunca ninguno** |
| Margen de tiempo real | GIF descargado a 2391 ms, primer paint 2880 ms (= arranque del GIF), reloj CSS a 2817 ms → relevo a 4817 ms; la animación del GIF termina a 4420 ms. **397 ms de holgura** |
| Layout con reduced-motion | Con el GIF en `display:none` el contenedor conserva su alto (423.95 px, gracias a `aspect-[512/340]`) y el vector su tamaño. Se retiró el override `motion-reduce:top-[40%]` del círculo: ya no hace falta |
| Resolución | El vector reemplaza a un ráster cuyo logo medía 608 px de tinta (el GIF, 301 px): ahora es nítido a cualquier densidad |
| `npm run lint` / `npm run typecheck` | OK, en silencio |

## 2026-08-23 — Foto de cargue DAP en /nosotros

La clienta entregó `DAP.png` para reemplazar la ilustración de panes bajo el h1
de `/nosotros`. Derivada a `cargue-cajas-dap-01.webp` (1200×642, 187 KB, WebP
q82) con la receta del importador; el original de 2.3 MB se archivó en
`content-source/fotos-adicionales/` para no publicarlo. Al ser escena real
lleva marco (`overflow-hidden rounded-lg border border-border`) y alt
descriptivo.

⚠️ **La foto tiene los indicios de IA ya documentados** para el lote de
bodega/transporte, y aquí a ancho completo se leen sin esfuerzo: cajas que
dicen «AP» en vez de «DAP», pie «Compañía Mundial de **Cereales** S.A.S.»
cuando la empresa es *de Comercio*, y texto menor corrupto («Chento de
Hojaslos», «Fórmula Nejorodo», «Condenido Nedo»). Se publica por pedido
explícito de la clienta; queda pendiente confirmar el origen —ver
`docs/FOTOS_ADICIONALES.md`— y `PRODUCT.md` prohíbe fabricar evidencia.

## 2026-08-28 — Ajustes de la landing (documento de requerimientos v1.0)

Cambio grande de color y composición: fondos crema fuera del sitio público,
bandas de identidad, lockup nuevo en header y pie, hero con producto, menú
desplegable de «Productos», variantes por clima y orden destacado del catálogo.

**Contrastes calculados** (WCAG 2.1, fórmula de luminancia relativa):

| Par | Ratio | Uso | Veredicto |
|---|---|---|---|
| Rojo `#c93a2e` sobre blanco | **5.08:1** | Razón social y lema del lockup | AA texto normal |
| Blanco sobre azul `#2563c4` | **5.73:1** | Etiquetas de la banda de indicadores | AA texto normal |
| Ámbar `#f2b63d` sobre azul `#2563c4` | **3.15:1** | Cifras de indicadores (36–48 px semibold) | AA **solo texto grande** — no bajar ese tamaño |
| Blanco sobre verde profundo `#15522d` | **9.23:1** | Títulos y prosa de la banda de pilares | AAA |
| Ámbar sobre verde profundo `#15522d` | **5.07:1** | Eyebrow y numeración de pilares | AA texto normal |
| Blanco sobre rojo `#c93a2e` | **5.08:1** | Reservado para bandas rojas | AA texto normal |

**Verificación en navegador** (dev server, driver CDP, Chrome):

| Verificación | Resultado |
|---|---|
| `npm run lint` / `npm run typecheck` | OK, en silencio |
| Home, `/productos`, `/nosotros`, `/contacto`, `/preguntas-frecuentes` a 1440 px | Sin errores de consola; ritmo de fondos blanco → azul → blanco → verde → blanco → lino → petróleo → pie correcto |
| Orden destacado | Home y `/productos` abren con Alta Repostería Ponqué → Repostería → Hojaldre |
| Emblema `logo-cmc-emblema.svg` | `viewBox 66 2 484 468` = caja de tinta exacta de los dos trazos, medida con `getBBox()` sobre el arte original; renderiza limpio sin recortes |
| Header a 320 / 390 / 1440 px | `scrollWidth` 314 ≤ 320: sin scroll horizontal. La razón social envuelve en dos líneas bajo 640 px y va en una desde `sm` |
| Pila de empaques del hero | Desborda su caja ~26 % por diseño; con `w-[78%]` en móvil el desborde entra completo (a 390 px las cajas laterales ya no se rebanan contra el filo) |
| Desplegable de «Productos» | Abre por clic y por hover, cierra con Escape y al salir el foco; en móvil los dos destinos se listan sangrados. Sin PDF, «Descargar catálogo» sale inerte con la etiqueta «Próximamente» |
| Datos del clima | Rangos de atemperado y máximos de almacenamiento contrastados uno a uno contra `supabase/seed.sql` (fichas técnicas oficiales de Hojaldre, Industrial y Semi Hojaldrados) |

Pendiente de verificar con material del cliente: puntos 07, 08, 10, 13, 14 y 15
del documento de requerimientos (ver `docs/CONTENT_PENDING.md` §0).

## 2026-08-30 — Hero recompuesto tras revisión de la clienta

Revisión suya por WhatsApp sobre el hero del 2026-08-28: «el logo ahí no queda bien,
podemos probar poniéndolo al otro lado y un poquito más grandecito» y «no me convencen
las cajas, sería mejor poner una foto de producto […] que se vieran panes o torta, que
destaque el resultado de lo que pueden hacer con sus productos».

Cambios: la pila de tres empaques se reemplaza por las **fotos de aplicación** de los
tres destacados (caja + horneado), turnándose en el escenario; el sello del logotipo pasa
de la esquina izquierda a la derecha y de 144 a 176 px; el fondo rotativo se queda **solo
con escenas**, sin aplicaciones.

| Verificación | Resultado |
|---|---|
| `npm run lint` / `npm run typecheck` | OK, en silencio |
| Secuencia del escenario | Muestreo de opacidades en el navegador: t≈2.4 s `[1, 0, 0]`; t≈5.5 s `[0.69, 0.31, 0]` (cruce 1→2, coincide al 1 % con el cálculo: 30 % de la ventana de 0.72 s); t≈8.5 s `[0, 1, 0]`. Orden 1 → 2 → 3 y **una sola foto plena en cada turno** |
| Primera foto y LCP | Con retardos negativos la 1.ª nace a opacidad 1 en el frame 1 (verificado: `[1,0,0]` en la primera medición), no sube desde 0 |
| Por qué salieron las aplicaciones del fondo | Verificado en pantalla: `dap-reposteria-aplicacion-01` a `object-cover` sobre 1440 px dejaba la caja **legible** detrás del h1 («Materia prima para uso exclusivo de la industria», «15 Kg»), justo el empaque que la clienta descartó |
| Ciclo del fondo | Bajado de 42 s/7 fotos a 18 s/3 fotos. Los porcentajes de `hero-slide-cycle` se recalcularon (3.57/14.29/17.86 % → 8.33/33.33/41.67 %); sin eso, 3 fotos en un ciclo de 42 s habrían dejado 24 s de fondo vacío |
| Opacidad de la textura | 0.15 → **0.12**: quedándose solo con escenas de panadería (claras, de grano fino) la capa pesaba más detrás del titular. Sigue dentro del rango revisado 0.12–0.18 |
| Móvil 390 px | `scrollWidth` 375 ≤ 390; sello arriba a la derecha y foto a ancho completo, sin recortes |

## 2026-08-31 — Encuadre del hero e indicadores

Tres ajustes propuestos tras revisar la iteración anterior en pantalla.

**Medición que los motivó** (caja de tinta de las fotos de aplicación, umbral de
blanco 238, medido con sharp sobre los originales de 1200×1200):

| Foto | Tinta | % del alto | Vacío arriba | Aspecto |
|---|---|---|---|---|
| Alta Repostería Ponqué | 1170×597 | 50 % | 348 px | 1.96 |
| Hojaldre | 1139×511 | 43 % | 363 px | 2.23 |
| Multipropósito | 1113×479 | 40 % | 364 px | 2.32 |
| **Repostería** | **1166×313** | **26 %** | **441 px** | **3.72** |

Las nueve fotos de aplicación miden entre 32 % y 50 % de tinta salvo Repostería, con
26 %: es la única fuera de familia y por eso salió del escenario del hero.

| Verificación | Resultado |
|---|---|
| `npm run lint` / `npm run typecheck` / `npm run build` | OK |
| Derivados `-hero-01.webp` | 1200×560 (2.14:1, dentro de la familia de aspectos 1.96–2.32), 43–49 KB cada uno; generados por `scripts/recortar-hero-aplicaciones.mjs` y registrados en el manifiesto (3 entradas nuevas, sin reordenar el resto) |
| Peso visual en la rotación | Los tres turnos ocupan el mismo lienzo; se acabó el hueco entre el sello y la foto |
| Años de experiencia | Función probada contra cuatro fechas: 2026-08-31 → 6, 2026-09-08 → 6, 2026-09-09 → **7**, 2027-01-01 → 7. Coincide con el copy publicado («más de seis años») |
| Staleness del indicador | La home es estática: la cifra se congela en el build y se refresca con cualquier revalidación desde el panel. Un día de desfase al año, a cambio de que nadie tenga que acordarse de actualizarla |
