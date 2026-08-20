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
