# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Compradores B2B: dueños y jefes de compras de panaderías, reposterías e industria
alimentaria en Colombia que evalúan a CMC como proveedor de margarinas, mantequillas,
preparados grasos y aceites. Llegan buscando fichas de producto y una vía de contacto
directa; el éxito es que escriban por WhatsApp o llamen. Audiencia secundaria:
distribuidores regionales.

## Product Purpose

Sitio corporativo + catálogo de Compañía Mundial de Comercio S.A.S. (CMC), Bogotá.
Presenta la empresa, el catálogo (línea DAP y afines), el blog técnico y las vías de
contacto. Todo el contenido se gestiona desde un CMS propio (/admin) y el sitio público
es 100 % estático (SSG) regenerado bajo demanda. Éxito = generar contactos comerciales
calificados y proyectar seriedad de proveedor industrial.

## Positioning

Proveedor integral confirmado en cuatro ejes: (1) producción propia con control de
calidad y fichas técnicas (línea DAP), (2) trayectoria y relaciones de largo plazo,
(3) portafolio completo — margarinas, mantequillas, preparados grasos y aceites en un
solo proveedor —, y (4) servicio y acompañamiento técnico directo (WhatsApp, visitas).

## Operating Context

El visitante típico compara proveedores desde el celular o la oficina; valora fichas
técnicas, presentaciones (empaques/tamaños) y respuesta rápida. El contacto ocurre por
WhatsApp/teléfono; no hay formulario de contacto (fuera de alcance actual). El contenido
lo aprueba la clienta (Ana) antes de publicarse desde el panel.

## Capabilities and Constraints

- Next.js 15 App Router en Cloudflare Workers (OpenNext); sitio público SSG sin consultas
  por visita; `images.unoptimized: true` (sin optimizador de Next).
- Animaciones: CSS-first obligatorio (server components; único client component público
  es MobileNav). `motion-safe:`/`motion-reduce:` en todo motion.
- Contenido dinámico desde CMS: secciones, 12 productos (9 cargados, en borrador),
  4 artículos de blog (borrador), FAQs, marcas cliente (carrusel oculto hasta tener
  logos autorizados).
- Afirmaciones en revisión NO publicables: certificación ISO 22000, datos de contacto
  del pie de fichas técnicas, claim OMS sobre el pan (ver docs/CONTENT_PENDING.md).
  Nunca inventar cifras, certificaciones ni testimonios.
- Producción publicada en workers.dev (deploy automático por push a `master`); la conexión del
  dominio del cliente y la migración a sus cuentas siguen bloqueadas hasta su aprobación.

## Brand Commitments

- Nombre: Compañía Mundial de Comercio S.A.S. (CMC). Línea de producto: DAP.
- Tema visual provisional pero **vinculante hasta nuevo aviso** (decisión 2026-08-10):
  refinar sin cambiar identidad. Paleta petrol/crema/ámbar/naranja y tipografías
  Fraunces (display) + Geist (texto) se mantienen; solo se mejora jerarquía, espaciado,
  composición y motion. El manual de identidad oficial está pendiente (Ana).
- Activos: 4 PNG de logo (falta vectorial), GIFs animados de marca en
  public/gifsanimados/ (logo CMC, wordmark DAP, mantequilla mezclándose).
- Todo el copy en español.

## Evidence on Hand

- 9 fichas técnicas de productos DAP (descripciones extraídas, en revisión).
- Imágenes de producto = caja del empaque (decisión provisional).
- Sin fotografías corporativas autorizadas todavía; sin logos de marcas cliente
  autorizados; sin certificado ISO verificado. No fabricar evidencia que no existe.

## Product Principles

1. Seriedad industrial antes que espectáculo: el diseño debe leerse como proveedor
   confiable, no como startup.
2. El producto real (empaque DAP) es el héroe visual; no usar stock ni imágenes
   inventadas.
3. Toda afirmación visible debe estar respaldada (fichas técnicas, contenido aprobado).
4. El camino a WhatsApp/teléfono debe estar siempre a un paso.
5. Rendimiento y accesibilidad no se negocian: SSG, contraste AA documentado en
   globals.css, reduced-motion respetado.
