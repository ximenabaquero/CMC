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
    mantequilla del CTA final de la home ("dieta de GIFs"); desde el
    2026-08-19, por pedido de la clienta, el hero de la home añade un
    **tercer** momento (logo CMC animado en lugar del packshot).
    `scripts/patch-gif-loop.mjs` genera la variante sin loop
    (`cmc-logo-entrada-una-vez.gif`) que reproduce la animación una sola vez.
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
  preparaciones aprobadas, referenciadas por **ruta literal en JSX** (banda
  del hero en `HomeHero`, «¿Quiénes somos?» en la home, banner y figura de
  Nosotros) — **sin fila en `media_assets`**, igual que los GIFs de marca.
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
- Estados `DRAFT`/`PUBLISHED` en todo el contenido; `internal_note`
  documenta el contenido en revisión editorial dentro del propio CMS.

### Capa visual del sitio público

- **Tema** centralizado en `src/app/globals.css` (Tailwind v4, `@theme inline`).
  Además de los tokens provisionales originales, el rediseño de la home añadió
  la paleta cálida pública: `--petrol`/`--petrol-deep` (titulares, franjas
  institucionales), `--cream`/`--cream-deep` (fondos alternos), `--amber`
  (decorativo y botón sobre petróleo; **nunca** texto sobre fondos claros) y
  `--orange` (eyebrows/numeración; AA sobre crema y blanco).
- **Tipografía**: Geist (cuerpo) + Fraunces (display). Fraunces solo aplica a
  `h1–h3` dentro de `.public-site` (clase del layout público) y vía la
  utilidad `font-display`; el panel admin conserva Geist íntegro.
- **Fundación de diseño** (2026-08-10): `PRODUCT.md` (verdad de producto) y
  `DESIGN.md` + `.impeccable/design.json` (sistema visual, North Star
  "El Obrador Editorial", reglas nombradas) en la raíz del repo. Son la
  autoridad de criterio visual para cualquier cambio del sitio público;
  generados con las skills de diseño instaladas en `.agents/skills/`
  (impeccable, emil-design-eng y sub-skills, design-taste-frontend).
- **Componentes de la home** (`src/components/public/`): `HomeHero` (recibe
  `hero` y `settings`; la composición derecha muestra el logo CMC animado
  sobre un círculo blanco, sin anillo naranja — decisión de la clienta
  2026-08-19; antes iba el packshot del primer producto publicado sobre el
  círculo ámbar. Desde el 2026-08-19 cierra con una **banda editorial** de
  tres fotos reales de preparaciones en tarjetas blancas, `loading="lazy"`,
  sin rotación — el logo sigue siendo el único protagonista), `HomeStats`
  (indicadores calculados del catálogo; oculta cifras < 3 y desaparece sin
  datos), `HomePillars` (numeración editorial; también lo reutiliza
  `/nosotros`), `HomeProductCard` y `HomePostsSection` (destacado +
  secundarios; también encabeza el índice de `/blog`) y `HomeCta` (canales
  de `site_settings`; con WhatsApp configurado el botón principal abre el
  chat directo). Los compartidos de `shared.tsx` (`ProductCard`, `PostCard`,
  `SectionHeading` con `tone="warm"` por defecto, `EditorialCover` para
  posts sin portada…) siguen usándose en `/productos`, `/blog` y las vistas
  previas del admin. Las imágenes de producto van siempre sobre lienzo
  blanco con `object-contain`: el empaque nunca se recorta (también en
  `ProductDetail`, que acepta `settings` para el CTA de WhatsApp con
  producto prellenado). La home («¿Quiénes somos?») y `/nosotros` llevan
  fotos editoriales estáticas de `public/images/photos/` (2026-08-19).
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
  (generado por `scripts/recortar-foto-panes.mjs` desde el original
  aprobado; entrada propia en `scripts/assets-manifest.json`). Acordeón
  propio `FaqAccordion` (server component): numeración naranja, chevron en
  círculo mostaza, encabezado abierto en petróleo con texto blanco,
  respuesta sobre crema y **una sola pregunta abierta** vía `<details name>`
  nativo, sin JavaScript. `FaqList` de `shared.tsx` queda solo para la home.
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
