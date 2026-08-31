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
  (`settings`, `content`, `products`, `posts`, `faqs`, `brands`) y **sin revalidación
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
- **Feedback del panel admin**: toda Server Action devuelve
  `ActionState { status, message, fieldErrors?, ts? }`
  (`src/lib/action-state.ts`, helpers `actionSuccess`/`actionError`/
  `zodActionError`); ninguna devuelve `void` ni lanza hacia el usuario.
  El resultado se comunica con un sistema de toasts propio y accesible
  (`src/components/admin/toast.tsx`, montado en el layout protegido,
  región `aria-live` pre-montada, sin dependencias), toasts tras redirect
  vía `?creado=1`/`?eliminado=1` + `FlashToast`, y errores de validación
  por campo (`fieldErrors` → `aria-invalid`/`aria-describedby`). El
  error boundary `error.tsx` queda solo para fallos de carga de página.

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
  - Excepción: `public/gifsanimados/` contiene GIFs animados de marca
    (logo de entrada, margarina mezclándose) versionados a mano, fuera del
    flujo `import-assets`/`media_assets`. Tras la auditoría de diseño
    (2026-08-10) se usaban solo en **dos** momentos: el logo del header y la
    mantequilla del CTA final de la home ("dieta de GIFs"); el 2026-08-19, por
    pedido de la clienta, el hero de la home añadió un tercero (logo CMC
    animado en lugar del packshot) y el 2026-08-19 también el logo DAP junto
    al encabezado del catálogo. Desde el **2026-08-28** el header dejó de
    llevar GIF: monta el emblema vectorial, más grande y nítido, y el momento
    animado del logo queda solo en el hero (sello pequeño).
    `scripts/patch-gif-loop.mjs` genera la variante sin loop
    (`cmc-logo-entrada-una-vez.gif`) que reproduce la animación una sola vez.
  - **Relevo a vector en el hero (2026-08-23)**: el GIF del hero mide 512 px
    de ancho y allí se pinta a ~640 px, así que su frame final se veía
    interpolado. Ahora el GIF solo cubre la animación (termina a los 1.54 s) y
    a los 2 s cede el puesto a `public/brand/logo-cmc.svg` — logotipo en
    vector, tres trazos, sin rasters embebidos — mediante un relevo seco
    (`step-end`, `logo-relevo-*` en `globals.css`): ninguna de las dos capas
    se ve superpuesta a la otra. El `viewBox` del SVG está recortado al mismo
    lockup que el frame final del GIF (el arte original incluye además el lema
    «SU ALIADO EN LOS NEGOCIOS», que en el hero ya vive como eyebrow), de modo
    que el cambio no mueve un píxel. Con `prefers-reduced-motion` el GIF no se
    monta y solo queda el vector.
  - `R2`: archivos subidos desde el CMS a través del adaptador
    (`src/lib/storage/`): R2 en producción, sistema de archivos local en
    desarrollo. URL estable `/api/media/<clave>` en ambos entornos.
  - La resolución de URL es por proveedor (`src/lib/media.ts`); nunca se
    mezclan.
- Subidas: validación de tipo (JPEG/PNG/WebP/AVIF), tamaño configurable
  (`MAX_UPLOAD_MB`), nombre único (UUID), `alt_text` obligatorio, metadatos
  en `media_assets`, y limpieza del objeto si falla el registro.
- **Clase de medio documental** (fichas técnicas PDF, 2026-08-17): validación
  separada de las imágenes en `src/lib/document-upload.ts`
  (`saveUploadedDocument`): MIME `application/pdf` + extensión `.pdf` +
  firma real `%PDF-`, límite propio `MAX_DOCUMENT_UPLOAD_MB` (default 10 MB),
  clave interna UUID y nombre visible aparte en `media_assets.file_name`.
  `media-upload.ts` (imágenes) no se relajó. La ruta `/api/media` envía
  `X-Content-Type-Options: nosniff` en todas las respuestas y, para PDF,
  `Content-Disposition: attachment` con el `file_name` registrado (lookup
  anónimo por `storage_path`). Las fichas de los 9 productos DAP son
  `STATIC` (versionadas en `public/images/products/<slug>/ficha-tecnica-<slug>.pdf`,
  servidas por ASSETS con atributo `download`; ASSETS no permite fijar
  esos headers — riesgo residual aceptado); las subidas futuras desde el
  CMS van a R2 y sí llevan los headers completos.
- **Material fuente** (`content-source/`, en `.gitignore`): originales del
  cliente ya normalizados a kebab-case (`Productos/<slug>/<slug>-caja.png`,
  `<slug>-aplicacion-NN.png`, `ficha-tecnica-<slug>.pdf` + los PDF de copy
  comercial sin importar) y `fotos-adicionales/` (inventario en
  `docs/FOTOS_ADICIONALES.md`; las aprobadas se copian renombradas a
  `fotos-adicionales/aprobadas/`). `scripts/import-assets.mjs` importa desde
  ahí (`npm run import-assets -- --source=content-source`): imágenes →
  WebP ≤ 1200 px, fichas `ficha-tecnica-*.pdf` → copia sin transformar,
  fotos editoriales aprobadas → `public/images/photos/` (kind `photo`,
  2026-08-19); el manifiesto `scripts/assets-manifest.json` (entradas
  `brand` / `product` / `document` / `photo`) se fusiona con el previo y
  poda entradas cuyo archivo ya no existe. El puente manifest → BD sigue
  siendo manual (seed).
- **Fotos editoriales** (`public/images/photos/`, 2026-08-19): panes y
  preparaciones aprobadas, referenciadas por **ruta literal en JSX**
  («Propuesta de valor» y «¿Quiénes somos?» en la home, figura de cierre de
  Nosotros) — **sin fila en `media_assets`**, igual que los GIFs de marca.
- **Portadas del blog** (2026-08-21): se suben **desde el panel**
  (`/admin/blog/<id>` → «Imagen de portada»), así que son medios `R2` como
  cualquier otra subida del CMS. `public/images/blog/` guarda solo los
  derivados optimizados que la usuaria elige al subirlos, y desaparecerá —
  con el script de respaldo `supabase/scripts/2026-08-20-covers-blog.sql` —
  en cuanto las tres estén cargadas. Sin portada, el artículo cae en la
  portada tipográfica `EditorialCover`.
  Bajo el h1 de /nosotros va una **ilustración dibujada a mano**
  (`public/images/decorative/quienes-somos-panes.webp`, entregada por la
  clienta el 2026-08-19 y optimizada a WebP con alfa; decorativa, `alt=""`),
  que reemplazó a la escena `hero-mesa-panaderia-01`.
  Solo las fotos que entran a una galería de producto pasan por
  `media_assets`/`product_media` (vía script SQL manual, p. ej.
  `supabase/scripts/2026-08-19-galeria-dap-hojaldre.sql`, pendiente de
  ejecución).
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
  unicidad), no jsonb. Desde la migración `0004`: `sort_order` es 0-based
  con **invariante «la posición 0 es siempre `products.main_image_id`»**
  (la caja del empaque), constraint `unique (product_id, sort_order)`
  diferible, y tres funciones SQL `security invoker` que mantienen el
  invariante de forma atómica: `set_product_main_image` (elige principal y
  renumera), `swap_product_media_order` (sube/baja secundarias) y
  `remove_product_media_entry` (quita, renumera y promueve principal).
- Ficha técnica por producto: `products.technical_sheet_media_id`
  (nullable → `media_assets`, `on delete set null`). El detalle público
  muestra «Descargar ficha técnica (PDF)» solo si existe.
- Imágenes **dentro** del cuerpo de un artículo (migración `0005`):
  `post_media` (`post_id` + `media_asset_id`, ambos `on delete cascade`,
  unique por par, sin orden — lo fija el propio texto). El Markdown las
  referencia por URL; la tabla existe para poder listarlas en el panel y
  borrar el archivo del almacenamiento al quitarlas o al eliminar el
  artículo (`deletePost` las recoge antes del borrado, porque la cascada
  se lleva la fila pero no el objeto en R2). RLS: hereda la visibilidad
  del artículo, escritura solo admin — mismas políticas que `product_media`.
  La portada sigue aparte, en `blog_posts.cover_image_id`.
- Estados `DRAFT`/`PUBLISHED` en todo el contenido; `internal_note`
  documenta el contenido en revisión editorial dentro del propio CMS.
- **Orden destacado del catálogo (2026-08-28)**: `getPublishedProducts`
  aplica `sortProductsByFeatured` (`src/lib/content.ts`), que sube al frente
  los slugs de `FEATURED_PRODUCT_SLUGS` —Alta Repostería Ponqué, Repostería,
  Hojaldre, los tres más vendidos según la clienta— y deja el resto con su
  `sort_order`. Al vivir en el fetcher, la home (hero y destacados) y
  `/productos` no pueden divergir. Si la clienta quiere gobernar el podio
  desde el panel, se borra la constante y manda `sort_order`.
- **Catálogo en PDF (2026-08-28)**: `src/lib/catalog.ts` expone
  `CATALOG_PDF_HREF` (hoy `null`) y el rótulo. El menú «Productos» pinta la
  entrada «Descargar catálogo» inerte y marcada «Próximamente» mientras no
  haya archivo; en cuanto la constante apunte a un PDF (`public/catalogo/…` o
  una URL) se vuelve enlace real, sin tocar nada más.

### Capa visual del sitio público

- **Tema** centralizado en `src/app/globals.css` (Tailwind v4, `@theme inline`).
  Además de los tokens provisionales originales, el rediseño de la home añadió
  la paleta cálida pública: `--petrol`/`--petrol-deep` (titulares, franjas
  institucionales), `--cream`/`--cream-deep`, `--amber`
  (decorativo y botón sobre petróleo; **nunca** texto sobre fondos claros) y
  `--orange` (eyebrows/numeración; AA sobre crema y blanco).
  **Giro de fondos (2026-08-28, pedido de la clienta)**: los cremas dejaron de
  ser el fondo de las secciones —los leía como «antiguos»— y el sitio público
  pasó a base blanca (`--surface`/`--surface-muted`) con el color devuelto en
  **bandas plenas** (indicadores en azul `--secondary`, pilares en verde
  `--green-deep`, CTA en petróleo) y **franjas tricolores** (`BrandStripe`).
  Los tokens `--cream*` siguen definidos pero ya no se usan en el sitio
  público; se añadió `--tint-blue` (disco del hero). No borrarlos sin revisar
  el admin.
- **Tipografía**: Geist (cuerpo) + Fraunces (display). Fraunces solo aplica a
  `h1–h3` dentro de `.public-site` (clase del layout público) y vía la
  utilidad `font-display`. El panel admin conserva Geist salvo el h1 de cada página y el rótulo de la barra lateral, que desde el 2026-08-28 usan `font-display` (Fraunces) para que el panel se lea como parte del mismo producto.
- **Fundación de diseño** (2026-08-10): `PRODUCT.md` (verdad de producto) y
  `DESIGN.md` + `.impeccable/design.json` (sistema visual, North Star
  "El Obrador Editorial", reglas nombradas) en la raíz del repo. Son la
  autoridad de criterio visual para cualquier cambio del sitio público;
  generados con las skills de diseño instaladas en `.agents/skills/`
  (impeccable, emil-design-eng y sub-skills, design-taste-frontend).
- **Componentes de la home** (`src/components/public/`): `HomeHero` (recibe
  `hero` y `settings`; desde el **2026-08-30** la composición derecha es un
  **escenario que se turna** entre tres fotos de aplicación —caja + horneado,
  en los derivados recortados `-hero-01.webp` que genera
  `scripts/recortar-hero-aplicaciones.mjs`— sobre un disco azul suave, con el logotipo
  animado como sello arriba a la derecha. El protagonismo pasó del logo al
  producto por pedido de la clienta, que ya lo tiene grande en el header.
  Historia: hasta el 2026-08-19 iba el packshot del primer producto sobre un
  círculo ámbar; de ahí al 2026-08-28, el logo CMC animado sobre círculo
  blanco; el 2026-08-28 pasó a una pila de los tres **empaques**, que la
  clienta descartó dos días después —«no me convencen las cajas»— por las
  fotos de aplicación actuales. Las rutas de esas fotos son literales, como
  las del fondo: no salen de `media_assets`), `HomeStats`
  (indicadores calculados del catálogo; oculta cifras < 3 y desaparece sin
  datos; banda **azul** desde el 2026-08-28, y desde el 2026-08-30 con un
  tercer indicador —años de experiencia— calculado desde la fecha de fundación
  publicada en el CMS, el único de la franja que no sale de la base), `HomePillars` (numeración
  editorial sobre **banda verde profunda** desde el 2026-08-28; también lo
  reutiliza `/nosotros`; en la home lleva `withOrnament`, que monta el
  rodillo animado — antes eran los ornamentos botánicos, descartados por la
  clienta), `HomeProductCard` (la home muestra **3 destacados**
  desde el 2026-08-28 — antes 2 —, `products.slice(0, 3)`, que son los tres
  del orden destacado de `sortProductsByFeatured`) y
  `HomePostsSection` (destacado +
  secundarios; hoy solo actúa de fallback con un único artículo) y su
  variante `HomePostsRotator` (2026-08-21, cabecera del blog en la home
  **y** en `/blog`: los artículos se turnan en el escenario con fundido
  encadenado CSS y el índice lateral marca el que está en escena; el orden
  lo fija `sortPostsByCoverFirst`, que pone delante los que tienen portada)
  y `HomeCta` (canales
  de `site_settings`; con WhatsApp configurado el botón principal abre el
  chat directo). Los compartidos de `shared.tsx` (`ProductCard`, `PostCard`,
  `SectionHeading` con `tone="warm"` por defecto, `EditorialCover` para
  posts sin portada…) siguen usándose en `/productos`, `/blog` y las vistas
  previas del admin. **Piezas de identidad y color (2026-08-28)**:
  `BrandLockup` (emblema vectorial + razón social y lema en rojo; header y
  pie), `BrandStripe` (franja tricolor decorativa: borde inferior del header,
  divisor de «Propuesta de valor» y remate del pie), `ClimateVariants`
  (variantes por clima, en la home y en `/productos`) y `RollingPinOrnament`
  (rodillo animado de la banda de pilares). Las imágenes de producto van
  siempre sobre lienzo
  blanco con `object-contain`: el empaque nunca se recorta (también en
  `ProductDetail`, que acepta `settings` para el CTA de WhatsApp con
  producto prellenado). La home («¿Quiénes somos?») y `/nosotros` llevan
  fotos editoriales estáticas de `public/images/photos/` (2026-08-19); desde
  el mismo día las composiciones de packshot se muestran como **recortes con
  alfa flotando sin tarjeta** (`scripts/recortar-fotos-editoriales.mjs`,
  derivados `-recorte.webp` en el manifest; los `.webp` de lienzo completo
  conviven en `public/` porque el importador los regeneraría). La única
  escena real (`hero-mesa-panaderia-01`) no se recorta; desde el 2026-08-19
  quedó **sin uso**: su lugar como banner de /nosotros lo ocupa la
  ilustración dibujada a mano `decorative/quienes-somos-panes.webp`.
- **Ornamentos laterales de obrador** (`BakerySideOrnament`, 2026-08-19;
  reubicados el 2026-08-20): dibujo botánico a mano en ambos márgenes
  (`public/images/decorative/borde-ornamental-cmc.png` y
  `borde-ornamental-cmc-derecha.png` — espejo exacto, mismo lienzo 887×1774
  y misma constante de geometría; rutas literales sin `media_assets`).
  Desde el 2026-08-20 (pedido de la clienta) **ya no son fixed al viewport
  ni globales**: son `position: absolute` dentro de una sección anfitriona
  y se montan solo en **dos anclas** — la zona alta de /nosotros (título +
  ilustración) y la página de contacto. La tercera, la sección de pilares de
  la home, la retiró la clienta el 2026-08-28 junto con el fondo crema: allí
  la decoración es ahora el rodillo animado (`RollingPinOrnament`, prop
  `withOrnament` de `HomePillars`). Cada host debe ser full-bleed, `relative` y
  `overflow-x-clip` (al no ser fixed, el recorte evita el scroll
  horizontal). Decorativos puros (`alt=""`, `aria-hidden`,
  `pointer-events: none`), centrados en su sección, opacidad 0.7, solo
  ≥ lg. Geometría en `.bakery-side-ornament` + variante `--derecha`
  (globals.css): altura `min(86%, 900px)` relativa al host, `z-index: 1`,
  `left`/`right` con el clamp que desliza el dibujo fuera del lienzo en
  viewports angostos sin tocar el texto. La carpeta `decorative/` guarda
  también la ilustración de panes del h1 de /nosotros
  (`quienes-somos-panes.webp`), fuera del manifest como los ornamentos.
- **Iconos** (`src/components/public/icons.tsx`, 2026-08-20): SVG inline con
  `currentColor` y `aria-hidden`; el proyecto **no usa librería de iconos**.
  `WhatsAppIcon` (glifo oficial de la marca) y `PhoneIcon` son los únicos
  iconos rellenos y viven solo en los tres CTA de contacto (`/contacto`,
  `HomeCta`, `ProductDetail`); el resto del vocabulario es de trazo 2px.
  Reglas de uso y de tamaño óptico en `DESIGN.md` → «Iconos».
- **Mapa y sectores de `/contacto`** (`ContactMap`, `AudienceSectors`,
  2026-08-20): la página incorpora el **único recurso de terceros del sitio**,
  un `<iframe>` de Google Maps (`https://www.google.com/maps?q=…&output=embed`)
  con `loading="lazy"` y `referrerPolicy="no-referrer-when-downgrade"`. No usa
  API key ni campo nuevo en la BD: la consulta se **deriva** de
  `site_settings.address` + `.city`, de modo que la dirección sigue teniendo
  una sola fuente de verdad editable desde el admin. `buildMapQuery` descarta
  antes los segmentos de detalle interior (`Of.`, `Torre`, `Piso`, `Local`…)
  porque Google no los geocodifica y termina rotulando el pin con la ficha de
  una empresa vecina; la dirección completa se muestra igual como texto. No
  hay CSP que ajustar (`middleware.ts` solo cubre `/admin/:path*` y
  `next.config.ts` no define `headers()`). `AudienceSectors` cierra la página
  con los 12 sectores atendidos; su copy es **fijo en el componente**, sin
  sección de `company_content` todavía (ver `docs/CONTENT_PENDING.md`).
- **Galería de la ficha de producto** (`ProductGallery`, 2026-08-19):
  client component (el segundo público junto a `MobileNav`) que recibe
  `gallery: MediaAsset[]` serializada desde `ProductDetail` (que sigue
  siendo Server Component). Miniaturas como botones con `aria-pressed`,
  navegación por flechas/Home/End, áreas táctiles ≥ 44 px, imágenes
  apiladas en una celda de grid (cross-fade `--dur-fast`, sin layout
  shift) y visor `<dialog>` nativo (`showModal`: Escape, focus trap y
  retorno de foco nativos; estilos en `.product-lightbox` de
  `globals.css`). Sustituyó a las miniaturas-enlace que abrían el `.webp`
  crudo en pestaña nueva. La vista previa del admin reutiliza el mismo
  componente.
- **Página de preguntas frecuentes** (2026-08-19): rediseño editorial en dos
  columnas (`max-w-6xl`, 40/60). Panel `bg-petrol-deep` con eyebrow ámbar
  (el naranja no contrasta sobre petróleo oscuro), círculo mostaza y el
  recorte con transparencia `canasta-panes-surtidos-01-recorte.webp`
  (generado por `scripts/recortar-fotos-editoriales.mjs` desde el original
  aprobado; entrada propia en `scripts/assets-manifest.json`). Acordeón
  propio `FaqAccordion` (server component): numeración naranja, chevron en
  círculo mostaza, encabezado abierto en petróleo con texto blanco,
  respuesta sobre lino (`surface-muted` desde el 2026-08-28; antes crema) y
  **una sola pregunta abierta** vía `<details name>`
  nativo, sin JavaScript. Es el único patrón de FAQ del sitio: la sección de
  destacadas de la home reutiliza `FaqAccordion` (el `FaqList` compacto de
  `shared.tsx` se eliminó el 2026-08-19 al unificar ambos acordeones).
  El sticky del panel aplica únicamente con viewport de altura ≥ 53rem
  (en portátiles bajos fluye normal para no quedar cortado).
- **Motion**: vocabulario CSS-first al final de `globals.css` (tokens
  `--ease-out`/`--dur-*`, entrada del hero `.enter*`, reveal scroll-driven
  `.reveal` con `animation-timeline: view()` bajo `@supports`, acordeón FAQ
  con `::details-content` + `interpolate-size`, drawer móvil con
  `@starting-style`, view transitions cross-document con header estable).
  Sin JavaScript ni librerías: compatible con SSG/server components, con
  fallback íntegro sin soporte y `prefers-reduced-motion` respetado en cada
  pieza.
- `mix-blend-multiply` en el hero solo funciona con packshots sobre fondo
  blanco; la sección usa `isolate` para contener la mezcla.

### Estructura del código

```
src/
├─ app/(public)/…        # sitio público (SSG)
├─ app/admin/login       # login
├─ app/admin/(protected) # panel (dinámico, requiere ADMIN)
├─ app/api/media/[...key]# sirve archivos del adaptador (local/R2)
├─ actions/              # Server Actions (auth, products, brands, posts, faqs, settings, content)
├─ components/ (admin/, public/)
└─ lib/ (supabase/, storage/, content.ts, validation/, markdown.tsx, …)
supabase/ (migrations/, seed.sql, tests/rls_checks.sql)
```

## Restricciones respetadas

Sin WordPress, Railway, MySQL, Prisma, backend separado, auth manual ni
credenciales en el código. Sin e-commerce, pagos, inventario, CRM ni
integraciones distintas de Supabase y Cloudflare. Sin formulario de correo
(no hay correo receptor definido aún).
