---
name: CMC — Compañía Mundial de Comercio
description: Sitio corporativo B2B de margarinas y grasas — calidez de obrador con rigor editorial
colors:
  petrol: "#123f4d"
  petrol-deep: "#0b2d38"
  cream: "#faf6ec"
  cream-deep: "#f3ead8"
  hero-cream: "#f8f2e4"
  amber: "#f2b63d"
  amber-hover: "#e6a92f"
  orange: "#b3491a"
  primary-green: "#1e7a3c"
  primary-green-hover: "#166030"
  secondary-blue: "#2563c4"
  accent-red: "#c93a2e"
  butter: "#f0cf72"
  butter-light: "#f7e7bb"
  green-deep: "#15522d"
  background: "#fdfcfa"
  surface: "#ffffff"
  surface-muted: "#f5f3ee"
  foreground: "#1f2933"
  muted-foreground: "#52606d"
  border: "#e4e0d8"
typography:
  display:
    fontFamily: "Fraunces, Geist, Georgia, serif"
    fontSize: "clamp(2.75rem, 5vw, 4rem)"
    fontWeight: 600
    lineHeight: 1.06
    letterSpacing: "-0.01em"
  headline:
    fontFamily: "Fraunces, Geist, Georgia, serif"
    fontSize: "clamp(1.875rem, 3vw, 2.25rem)"
    fontWeight: 600
    lineHeight: 1.15
    letterSpacing: "-0.01em"
  title:
    fontFamily: "Fraunces, Geist, Georgia, serif"
    fontSize: "1.25rem"
    fontWeight: 600
    lineHeight: 1.3
  body:
    fontFamily: "Geist, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.75
  label:
    fontFamily: "Geist, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 600
    letterSpacing: "0.05em"
rounded:
  sm: "0.375rem"
  md: "0.625rem"
  lg: "1rem"
components:
  button-primary:
    backgroundColor: "{colors.primary-green}"
    textColor: "#ffffff"
    rounded: "{rounded.md}"
    padding: "0.75rem 1.5rem"
  button-primary-hover:
    backgroundColor: "{colors.primary-green-hover}"
  button-outline-petrol:
    backgroundColor: "transparent"
    textColor: "{colors.petrol}"
    rounded: "{rounded.md}"
    padding: "0.75rem 1.5rem"
  button-amber:
    backgroundColor: "{colors.amber}"
    textColor: "{colors.petrol-deep}"
    rounded: "{rounded.md}"
    padding: "0.75rem 1.5rem"
  card-product:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.lg}"
    padding: "1.25rem"
---

# Design System: CMC — Compañía Mundial de Comercio

## Overview

**Creative North Star: "El Obrador Editorial"**

La calidez de un obrador de panadería —crema, ámbar, mantequilla derritiéndose— presentada
con el rigor de una revista bien compuesta. El sitio habla a compradores B2B: debe sentirse
cálido porque vende materia prima de panadería, y serio porque es un proveedor industrial.
La tensión se resuelve con composición editorial: numeración `01/02` en naranja, eyebrows
en mayúsculas, titulares Fraunces con mucho aire, y el producto real (la caja DAP) como
único héroe fotográfico — nunca stock.

La densidad es baja y el ritmo pausado: secciones generosas (`py-16/20`) que alternan
fondos blanco → crema → crema profunda → petróleo. El color estructura la página; la
decoración se limita a círculos ámbar recortados y GIFs de marca usados con moderación.

**Key Characteristics:**
- Calidez alimentaria (cremas, ámbar) + autoridad institucional (petróleo).
- Composición editorial: eyebrow naranja → titular Fraunces → prosa Geist.
- Producto real como héroe; cero fotografía de stock.
- Plano y preciso: bordes finos, sombra solo como respuesta al hover.

## Colors

Paleta cálida de dos mundos: los neutros cálidos de fondo y el azul petróleo institucional,
puntuados por ámbar y naranja.

### Primary
- **Azul Petróleo** (#123f4d): titulares, textos institucionales y botones outline. Es la
  voz de la empresa.
- **Petróleo Profundo** (#0b2d38): bandas de cierre (stats, CTA final). Fondo, casi nunca texto.

### Secondary
- **Verde Campos** (#1e7a3c): el verde del logo; CTA primario ("Ver catálogo") y enlaces de
  acción. Hover #166030.
- **Ámbar Mantequilla** (#f2b63d): cifras y botones **solo sobre petróleo**, círculos
  decorativos. Hover #e6a92f.
- **Naranja Editorial** (#b3491a): eyebrows y numeración editorial sobre fondos claros (AA).

### Tertiary
- **Azul Amanecer** (#2563c4): enlaces de prosa y anillo de foco. **Rojo del Logo** (#c93a2e):
  uso puntual, casi ausente. **Mantequilla** (#f0cf72) y **Mantequilla Clara** (#f7e7bb):
  puntos decorativos del mundo hero legacy. **Verde Profundo** (#15522d): acentos tipográficos
  legacy del hero.

### Neutral
- **Hueso** (#fdfcfa): fondo base del sitio. **Blanco** (#ffffff): superficies y lienzo de
  producto. **Lino** (#f5f3ee): superficies atenuadas.
- **Crema** (#faf6ec) / **Crema Profunda** (#f3ead8) / **Crema Hero** (#f8f2e4): la escalera
  de fondos cálidos que alterna entre secciones.
- **Tinta** (#1f2933): texto base. **Gris Piedra** (#52606d): texto secundario.
  **Arena** (#e4e0d8): bordes y divisores.

### Named Rules
**The Amber Guardrail Rule.** El ámbar NUNCA es texto sobre fondo claro; solo funciona como
texto/botón sobre petróleo (contraste 8:1) o como forma decorativa.
**The One Hero Rule.** Cada viewport tiene un solo protagonista de color o imagen; los
acentos (ámbar, naranja, verde) no compiten entre sí en la misma vista.

## Typography

**Display Font:** Fraunces (fallback Geist, Georgia, serif) — eje óptico `opsz` automático.
**Body Font:** Geist (fallback system-ui, sans-serif).

**Character:** Fraunces aporta el carácter cálido-editorial (serifa con personalidad de
obrador); Geist mantiene la lectura técnica y neutra. Fraunces vive SOLO dentro de
`.public-site` en h1–h3; el admin es 100 % Geist.

### Hierarchy
- **Display** (600, clamp 2.75–4rem, lh 1.06, ls -0.01em): solo el h1 del hero; `max-w-[16ch]`,
  `text-balance`, color petróleo.
- **Headline** (600, 1.875–2.25rem, lh ~1.15): títulos de sección (h2), petróleo.
- **Title** (600, 1.25rem): tarjetas y h3.
- **Body** (400, 1rem, lh 1.75): prosa Geist; `.prose-cmc` para Markdown.
- **Label/Eyebrow** (600, 0.875rem, tracking-wide, UPPERCASE): eyebrow naranja sobre claro,
  ámbar sobre petróleo.

### Named Rules
**The Eyebrow Rule.** Toda sección se anuncia igual: eyebrow uppercase naranja → titular
Fraunces petróleo → (opcional) descripción gris piedra. Sin excepciones de formato.

## Layout

Contenedor único `max-w-6xl` (72rem, `--container-max`) con `px-4`. Ritmo vertical de
sección: `py-16 sm:py-20` (py-14 en bandas comprimidas). Las secciones alternan fondo para
marcar el ritmo: blanco → crema → blanco → crema profunda → petróleo profundo al cierre.
Grids de 2 columnas asimétricas para contenido editorial (`lg:grid-cols-[2fr_3fr]`,
hero `[52fr_48fr]`), 2 columnas para tarjetas de producto de la home, 3 para pilares/blog
en desktop. Breakpoints Tailwind estándar (sm 640, md 768, lg 1024). En móvil todo apila a
una columna; la decoración absoluta (círculos, GIFs) se oculta bajo `lg:` o `md:`.

## Elevation & Depth

Sistema plano con capas tonales: la profundidad la dan los cambios de fondo (crema sobre
blanco, petróleo al cierre) y los bordes arena de 1px, no las sombras.

### Shadow Vocabulary
- **Hover lift** (`shadow-md` de Tailwind): única sombra permitida; aparece solo en hover
  de tarjetas junto con el cambio de borde a `petrol/30`.

### Named Rules
**The Flat-At-Rest Rule.** Ninguna superficie tiene sombra en reposo; la sombra es
exclusivamente una respuesta al hover.

## Shapes

Esquinas suavemente redondeadas en tres pasos: sm 0.375rem (chips, foco), md 0.625rem
(botones), lg 1rem (tarjetas y lienzos de producto). Bordes finos de 1px en arena
(#e4e0d8); los botones outline usan 2px en petróleo. El círculo perfecto es la forma
decorativa de la marca (círculo ámbar del hero y del CTA, recortado por `overflow-hidden`).
Las imágenes de producto van sobre lienzo blanco uniforme con `object-contain` y una
rotación sutil (-2°) con `mix-blend-multiply` en composiciones hero.

## Components

### Buttons
- **Shape:** redondeo medio (0.625rem), padding 0.75rem 1.5rem, `text-sm font-semibold`.
  Excepción documentada: los CTAs del hero y de las páginas de conversión usan la escala
  mayor `px-7 py-3.5 text-base` como jerarquía deliberada.
- **Primary (verde):** fondo #1e7a3c, texto blanco; hover #166030. Acción principal
  ("Ver catálogo", "Contáctanos").
- **Outline petróleo:** borde 2px #123f4d, texto petróleo; hover invierte a fondo petróleo
  con texto blanco. Acción secundaria.
- **Amber (solo sobre petróleo):** fondo #f2b63d, texto petróleo profundo; hover #e6a92f.
  CTA de la banda final.
- **Hover / Focus / Press:** `transition ease-out` corta; foco visible con outline 2px
  azul amanecer (#2563c4) + offset 2px, global. Pulsación: `active:scale-[0.98]` con
  `motion-reduce:active:scale-100` (el scale se anula bajo reduced-motion; las
  transiciones de color se conservan).

### Cards / Containers
- **Corner Style:** lg (1rem).
- **Background:** blanco sobre fondos crema; lino (#f5f3ee) para variantes atenuadas.
- **Shadow Strategy:** Flat-At-Rest; hover = borde `petrol/30` + shadow-md.
- **Border:** 1px arena.
- **Internal Padding:** p-5 a p-6.
- **Producto (home):** lienzo blanco de altura fija (h-72 → h-[360px]) con `object-contain`;
  el empaque nunca se recorta.

### Inputs / Fields
Solo existen en el admin (fuera de este sistema); el sitio público no tiene formularios.

### Navigation
- Header sticky `bg-cream/95` con `backdrop-blur`, borde inferior arena. Links Geist
  `text-sm font-medium`; el activo lleva subrayado naranja (`DesktopNav`). Móvil: drawer
  con cierre por Escape y navegación.
- Footer sobre crema profunda, 3 columnas.

### Acordeón FAQ (signature)
`details/summary` nativo con indicador `+` que rota 45° al abrir (`group-open:rotate-45`).
Sin JavaScript.

### Marquee de marcas (signature)
Doble track CSS (`translateX(-50%)`, 35s linear), pausa en hover y en `:focus-within`,
logos en escala de grises que recuperan color al hover; degradado lateral de máscara. Con
`prefers-reduced-motion` se convierte en scroll horizontal manual y la copia decorativa
se oculta.

### Motion (vocabulario del sitio)
CSS puro, sin JavaScript (restricción SSG). Tokens en `globals.css`: `--ease-out`
(cubic-bezier(0.23, 1, 0.32, 1)), `--ease-drawer` (0.32, 0.72, 0, 1), `--dur-fast` 150ms
(pulsación/hover), `--dur-base` 250ms (acordeón, drawer), `--dur-enter` 400ms (entrada del
hero, solo la home). Piezas: entrada escalonada del hero (stagger 70ms; los candidatos LCP
animan solo transform), reveal scroll-driven `.reveal` en tarjetas/ítems de la home
(`animation-timeline: view()`, el stagger emerge de la posición), acordeón FAQ animado vía
`::details-content`, drawer móvil con `@starting-style`, crossfade de 200ms entre páginas
(view transitions, header con nombre propio para percibirse estable). Todo con fallback
íntegro sin soporte y `prefers-reduced-motion` tratado pieza a pieza (suavizar, no
congelar el contenido). Excepción documentada a Flat-At-Rest: el drawer móvil (overlay)
lleva `shadow-md` para separarse del contenido.

## Do's and Don'ts

### Do:
- **Do** anunciar toda sección con el patrón eyebrow → Fraunces → descripción (The Eyebrow Rule).
- **Do** usar el producto real (caja DAP) como único héroe visual; lienzo blanco + `object-contain`.
- **Do** alternar fondos (blanco/crema/crema profunda/petróleo) para estructurar la página.
- **Do** envolver todo motion en `motion-safe:`/media queries y dar fallback en
  `motion-reduce:` (los GIFs tienen variante estática PNG). Los GIFs de marca viven en
  exactamente tres momentos: logo del header, logo del hero (pedido de la clienta,
  2026-08-19) y mantequilla del CTA.
- **Do** mantener el camino a WhatsApp/teléfono visible a un paso en cada página.

### Don't:
- **Don't** usar ámbar como texto sobre fondos claros (The Amber Guardrail Rule).
- **Don't** añadir sombras en reposo (The Flat-At-Rest Rule).
- **Don't** usar fotografía de stock, testimonios o cifras no verificadas (contenido en
  revisión listado en docs/CONTENT_PENDING.md).
- **Don't** introducir librerías de animación JS ni convertir componentes públicos a client
  components sin necesidad real: el motion es CSS-first (restricción SSG).
- **Don't** poner más de un protagonista de color/imagen por viewport (The One Hero Rule).
