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
  tint-blue: "#e8f0fc"
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

La calidez de un obrador de panadería —ámbar, mantequilla derritiéndose, pan recién
horneado— presentada
con el rigor de una revista bien compuesta. El sitio habla a compradores B2B: debe sentirse
cálido porque vende materia prima de panadería, y serio porque es un proveedor industrial.
La tensión se resuelve con composición editorial: numeración `01/02` en naranja, eyebrows
en mayúsculas, titulares Fraunces con mucho aire, y el producto real (la caja DAP) como
único héroe fotográfico — nunca stock.

La densidad es baja y el ritmo pausado: secciones generosas (`py-16/20`).
**Giro de fondos (2026-08-28, pedido de la clienta).** La escalera de cremas se retiró
—los leía como «antiguos y planos»— y la página pasó a **base blanca con el color en
bandas y franjas**: blanco → banda azul → blanco → banda verde → blanco → lino →
petróleo al cierre. El color ya no tiñe el fondo de lectura; lo corta. La decoración se
limita a la franja tricolor de identidad, el disco azul del hero, círculos ámbar
recortados, GIFs de marca usados con moderación y los ornamentos botánicos dibujados a
mano, que desde ese mismo cambio solo enmarcan /nosotros y /contacto.

**Key Characteristics:**
- Blanco de lectura + bandas de color de identidad (verde, azul, rojo) + petróleo
  institucional; la calidez alimentaria vive hoy en el ámbar y en la fotografía, no en
  el fondo.
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
  de fondos cálidos que alternaba entre secciones **hasta el 2026-08-28**. Los tokens
  siguen definidos (los usa el admin) pero **el sitio público ya no los pinta**: su papel
  lo tomaron el blanco, el lino y las bandas de color.
- **Azul Lavado** (#e8f0fc): disco del hero. Forma decorativa, nunca texto ni fondo de
  lectura.
- **Tinta** (#1f2933): texto base. **Gris Piedra** (#52606d): texto secundario.
  **Arena** (#e4e0d8): bordes y divisores.

### Named Rules
**The Amber Guardrail Rule.** El ámbar NUNCA es texto sobre fondo claro; solo funciona como
texto/botón sobre petróleo (contraste 8:1) o como forma decorativa. Extensión documentada
(2026-08-28): vale también sobre las bandas oscuras nuevas — 5.1:1 sobre verde profundo
(cualquier tamaño) y 3.15:1 sobre azul, **solo para texto grande** (las cifras de los
indicadores, 36–48 px semibold).
**The One Hero Rule.** Cada viewport tiene un solo protagonista de color o imagen; los
acentos (ámbar, naranja, verde) no compiten entre sí en la misma vista.
**The Color-Band Rule** (2026-08-28). El color de identidad entra a la página de tres
maneras y de ninguna otra: **banda plena** a ancho completo (una sección entera, texto
blanco), **franja tricolor** (`BrandStripe`: 3 px bajo el header, 6 px como divisor y como
remate del pie) y **filo de tarjeta** (regla gruesa de 6 px en el borde superior, como en
las tarjetas de clima). Nunca como fondo de una columna de lectura, ni como tinte del
lienzo de producto: los packshots viven sobre blanco puro, siempre.

## Typography

**Display Font:** Fraunces (fallback Geist, Georgia, serif) — eje óptico `opsz` automático.
**Body Font:** Geist (fallback system-ui, sans-serif).

**Character:** Fraunces aporta el carácter cálido-editorial (serifa con personalidad de
obrador); Geist mantiene la lectura técnica y neutra. Fraunces vive SOLO dentro de
`.public-site` en h1–h3. El admin es Geist salvo **una excepción deliberada** (2026-08-28): el h1 de cada página del panel y el rótulo de la barra lateral van en Fraunces y petróleo, vía la utilidad `font-display`. Es un h1 por pantalla; el resto de la herramienta sigue en Geist, que es lo que la hace legible.

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
marcar el ritmo; desde el **2026-08-28** la secuencia de la home es: blanco (hero) → banda
**azul** (indicadores) → blanco (quiénes somos) → banda **verde** (pilares) → blanco
(catálogo) → lino (clima) → franja tricolor + blanco (propuesta de valor) → blanco (blog)
→ lino (FAQ) → **petróleo profundo** (CTA) → franja tricolor + blanco (pie).
Grids de 2 columnas asimétricas para contenido editorial (`lg:grid-cols-[2fr_3fr]`,
hero `[52fr_48fr]`), 2 columnas para tarjetas de producto de la home, 3 para pilares/blog
en desktop. Breakpoints Tailwind estándar (sm 640, md 768, lg 1024). En móvil todo apila a
una columna; la decoración absoluta (círculos, GIFs) se oculta bajo `lg:` o `md:`.

## Elevation & Depth

Sistema plano con capas tonales: la profundidad la dan los cambios de fondo (lino sobre
blanco, bandas de color, petróleo al cierre) y los bordes arena de 1px, no las sombras.

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
decorativa de la marca (círculo del hero — blanco desde el 2026-08-19 por pedido de la
clienta — y círculo ámbar del CTA, recortados por `overflow-hidden`).
Las imágenes de producto van sobre lienzo blanco uniforme con `object-contain` y una
rotación sutil (-2°) con `mix-blend-multiply` en composiciones hero.

**Ornamento de obrador (2026-08-19; por sección desde 2026-08-20).** Un dibujo botánico a
mano (vid, espigas, gotas de aceite — `BakerySideOrnament`) en ambos márgenes (el derecho
es el mismo dibujo en espejo), a opacidad 0.7. Desde el 2026-08-20, por pedido de la
clienta, **no acompaña el scroll**: es decoración estática anclada a **tres secciones** —
pilares de la home, zona alta de /nosotros y contacto — y scrollea con ellas; el resto del
sitio va limpio. Es tinta sobre el margen, nunca protagonista: sin fondo, sombra, filtro
ni animación; sin repetirse como patrón. Su geometría (`.bakery-side-ornament` y la
variante `--derecha` en globals.css) escala con la sección anfitriona (`min(86%, 900px)`)
y desliza el trazo fuera del lienzo en viewports angostos para no invadir jamás la
columna de lectura.

**Recorte editorial flotante (2026-08-19).** Las fotos editoriales aprobadas de packshot
(fondo blanco puro) se publican como recortes con canal alfa (`-recorte.webp`, generados
por `scripts/recortar-fotos-editoriales.mjs`) que **flotan directamente** sobre blanco,
lino o petróleo — sin tarjeta, sin borde, sin sombra (Flat-At-Rest) — y, cuando van en
serie, apoyados en una línea de base común (`object-bottom`). El lienzo blanco +
`object-contain` queda reservado a los packshots de producto (empaques); las escenas
reales no se recortan y conservan su marco.

**Escena real enmarcada (2026-08-20).** Primera aplicación de esa regla: la bodega con
estibas de DAP (`bodega-dap-01.webp`) en «¿Quiénes somos?» de la home, elegida por la
clienta en reemplazo del recorte de buñuelos. Receta del marco: `figure` con
`overflow-hidden rounded-lg` (esquina lg del sistema de tarjetas) + `border border-border`
(1px arena) y **sin sombra** (Flat-At-Rest); la foto ocupa el ancho completo de su columna
(`w-full`), sin `object-cover` ni altura fija — la proporción nativa manda. El texto de la
sección se centra verticalmente contra esa columna (`lg:items-center` en el grid).

**Imagen dentro de un artículo (2026-08-21).** Las fotos que la clienta inserta en el cuerpo de
un post desde el panel heredan ese mismo marco, pero desde CSS y no desde JSX: la regla
`.prose-cmc img` en `globals.css` (bloque a ancho de columna, esquina lg, borde arena 1px, sin
sombra, 1.5em de aire arriba y abajo). El editor solo escribe `![alt](url)` en el Markdown, así
que **la proporción nativa manda siempre**: no hay recortes ni alturas fijas, y quien sube la
foto decide el encuadre. Sin portada asignada, la tarjeta del artículo cae en `EditorialCover`.

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
- **Background:** blanco sobre lino; lino (#f5f3ee) para variantes atenuadas y para las
  secciones que antes iban en crema.
- **Shadow Strategy:** Flat-At-Rest; hover = borde `petrol/30` + shadow-md.
- **Border:** 1px arena.
- **Internal Padding:** p-5 a p-6.
- **Producto (home):** lienzo blanco de altura fija (h-72 → h-[360px]) con `object-contain`;
  el empaque nunca se recorta. **3 destacados en una fila** + «Ver catálogo» (2026-08-28;
  eran 2 desde el 2026-08-20): son exactamente los tres del orden destacado —Alta
  Repostería Ponqué, Repostería, Hojaldre—, los más vendidos según la clienta. El catálogo
  completo vive en /productos.

### Iconos
No hay librería de iconos: son SVG inline con `currentColor` y `aria-hidden="true"`, para que
hereden el color del contenedor y no lleguen al lector de pantalla.

- **Vocabulario base — trazo.** `strokeWidth="2"`, extremos redondeados, lienzo 16–20.
  Es el estilo de todo lo funcional: chevron de la FAQ, hamburguesa del menú móvil,
  flechas y cierre de la galería.
- **Excepción — relleno.** `src/components/public/icons.tsx` (2026-08-20) aporta los dos
  únicos iconos sólidos del sitio: el **glifo oficial de WhatsApp** (marca registrada, se
  dibuja tal cual y no se recolorea) y un **auricular** que lo acompaña. Viven solo en los
  CTA de contacto — `/contacto`, la banda final de la home y la ficha de producto.
  No extender el relleno a otros iconos: si aparece uno nuevo, va en trazo.
- **Tamaño óptico, no nominal.** El glifo de WhatsApp llena sus 24×24; el auricular solo
  ocupaba 18×18 y a igual clase se veía un 25 % más pequeño. Se corrige con el `viewBox`
  (`2 2 20 20`), que lo deja al 90 % — no al 100 %, porque es una mancha sólida frente a un
  anillo con hueco. Al añadir un icono, medir el trazado con `getBBox()` antes de fijar el
  lienzo.

### Inputs / Fields
Solo existen en el admin (fuera de este sistema); el sitio público no tiene formularios.

### Navigation
- Header sticky `bg-surface/95` con `backdrop-blur` y **franja tricolor** de 3 px como
  borde inferior (sustituye al borde arena). Links Geist `text-sm font-medium`; el activo
  lleva subrayado naranja (`DesktopNav`), separado del lockup por un filete vertical
  arena. Móvil: drawer con cierre por Escape y navegación.
- **Lockup de identidad** (`BrandLockup`, 2026-08-28): emblema vectorial
  (`logo-cmc-emblema.svg`, solo sol azul y hojas verdes) + razón social y lema **en rojo**
  (#c93a2e, 5.08:1 sobre blanco), con el lema centrado bajo el nombre (`w-fit` +
  `text-center`). El emblema mide 48/56 px en el header y 64/80 px en el pie. El logotipo
  entregado trae la razón social dibujada dentro del arte, y a esos tamaños se apelmazaba:
  esa era la «pixelación» que reportó la clienta. Regla: **el texto del logotipo se compone
  como texto**; el lockup dibujado solo se usa donde se pinta grande (hero).
- **Desplegable de «Productos»** (2026-08-28): «Productos» sigue siendo enlace y suma un
  botón chevron (`aria-expanded`/`aria-controls`) que abre «Ver productos» y «Descargar
  catálogo». Abre por hover y por clic, cierra con Escape y al salir el foco del grupo. En
  móvil no hay hover: los dos destinos se listan siempre, sangrados bajo «Productos». Sin
  PDF cargado, la segunda entrada se pinta inerte con la etiqueta «Próximamente» — un menú
  de una sola opción no se lee como menú, y un enlace que promete un archivo inexistente
  cuesta más que decir la verdad.
- Footer sobre blanco, coronado por la franja tricolor de 6 px, 3 columnas + acceso Admin.

### Figura editorial de «Propuesta de valor»
Una sola imagen protagonista en la columna derecha de la sección (One Hero Rule), con
`loading="lazy"` y `reveal` de entrada. Desde el 2026-08-20 es una **escena real
enmarcada**: el panadero con el carro de croissants (`panadero-croissants-01.webp`,
`w-full` dentro del marco `rounded-lg` + borde arena), elegida por la clienta en
reemplazo del recorte flotante de palmeritas — el rostro humano encarna la promesa de
relación que enuncia el texto. Historia previa: la imagen nació como banda de tres al
pie del hero, la clienta la movió aquí y la redujo a una el 2026-08-19 (el hero quedó
solo con el logo), y el 2026-08-20 la sustituyó por la escena del panadero.

### Hero de la home (2026-08-28)

El protagonista es el **producto**, no el logotipo. Columna izquierda: eyebrow →
titular Fraunces → prosa → dos CTA. Columna derecha: los **empaques de los tres
destacados** en primer plano —el n.º 1 al centro, más grande y delante; los otros dos
girados ±6° y bajados 20 px, con solape negativo— sobre un **disco azul lavado**, y el
logotipo animado reducido a **sello de 144–160 px** arriba a la izquierda. Todo el grupo
va con `mix-blend-multiply`: los packshots se fotografiaron sobre blanco puro, así que
multiplicar los funde con el disco sin recortarlos.

La pila desborda su caja un ~26 % por diseño (los laterales salen del disco). En
pantallas angostas ese desborde llegaba al filo y rebanaba las cajas: la caja se encoge
(`w-[78%] sm:w-[92%] lg:w-full`) y el desborde cabe entero. Sin catálogo publicado el
hero cae al lockup vectorial centrado, sin hueco.

Lo que **no** cambió, porque a la clienta le gustaba: el fondo fotográfico rotativo y la
entrada escalonada. El eyebrow dejó de leer `site_settings.slogan` —ahora que el lema
vive en el header, repetirlo aquí lo duplicaba en el mismo viewport— y pasó a ser un
descriptor fijo de categoría.

### Banda de pilares (2026-08-28)

Sección entera en **verde profundo** (#15522d): el bloque de color más grande de la home
después del CTA, y el que corta la secuencia de blancos justo a la mitad de la página.
Reemplaza al fondo crema y a los ornamentos botánicos que lo acompañaban, los dos
descartados por la clienta. Encabezado en `tone="onDark"` (eyebrow ámbar + título
blanco), numeración ámbar (5.1:1), divisores `white/20`, descripciones `white/80`. La
decoración es el **rodillo animado**, alineado con el encabezado en el mismo sitio donde
la sección de catálogo pone el logo DAP.

### Rodillo amasando (2026-08-28)

SVG de trazo con `currentColor` —no un GIF—, así que hereda el color de la banda, pesa
unos cientos de bytes y no se pixela. Va en vaivén de 7 s con `ease-in-out`: el gesto de
amasar frena e invierte en los dos extremos, y por eso no usa el `--ease-out` del sitio.
Los dos nudos de la madera se mueven con la **misma onda** que el rodillo, así que en
absoluto avanzan el doble que el eje — que es lo que hace la superficie de un cilindro
que rueda — y vuelven con él; van recortados a la barra. La masa es un óvalo plano y
relleno, no una línea: con una barra recta bajo la barra del rodillo el conjunto se leía
como una pesa. Solo ≥ lg, `aria-hidden`, quieto con `prefers-reduced-motion`.

### Variantes por clima (2026-08-28)

Banda de lino con tres tarjetas —clima frío (TB), cálido (TD) y costa (TDC)— cada una
con una **franja gruesa de color** de 6 px en el borde superior que además codifica una
rampa térmica: azul → naranja → rojo. Cada tarjeta lleva el código de la variante como
eyebrow, el nombre como h3, una línea de contexto y una lista de definición con
atemperado y almacenamiento en cifras tabulares. Todos los datos salen literales de las
fichas técnicas oficiales; no hay redacción comercial inventada. Vive en la home (pegada
al catálogo, porque explica lo que el visitante acaba de ver) y al cierre de
`/productos` (donde el comprador compara).

### Acordeón FAQ (signature)
`FaqAccordion`, único patrón de FAQ del sitio (2026-08-19; el `FaqList` compacto de la
home se eliminó al unificar — los dos acordeones se veían distintos): `details/summary`
nativo sin JavaScript, numeración `01…` naranja, chevron en círculo mostaza (ámbar al
abrir), encabezado abierto en petróleo con texto blanco, respuesta sobre lino
(16 px / 1.75), una sola pregunta abierta vía `<details name>` nativo (degrada a
múltiples abiertas sin soporte). Lo usan `/preguntas-frecuentes` y las destacadas de la
home. En la página FAQ lo acompaña un panel `petrol-deep` con eyebrow **ámbar**
(adaptación documentada de la Eyebrow Rule sobre fondo oscuro: el naranja queda ≈2.6:1),
círculo mostaza y el recorte con transparencia de la canasta de panes superpuesto al
círculo.

### Marquee de marcas (signature)
Doble track CSS (`translateX(-50%)`, 35s linear), pausa en hover y en `:focus-within`,
logos en escala de grises que recuperan color al hover; degradado lateral de máscara. Con
`prefers-reduced-motion` se convierte en scroll horizontal manual y la copia decorativa
se oculta.

### Lienzo de mapa y lista de sectores de `/contacto` (2026-08-20)
Dos piezas que estrenó la página de contacto al llegar los datos oficiales de la clienta.

**`ContactMap`** — el mapa embebido es el único recurso de terceros del sitio, y se trata
como un lienzo más: `rounded-lg`, borde arena, **sin sombra en reposo** (Flat-At-Rest) y
un `figcaption` sobre `surface-muted` con la dirección completa y el enlace «Cómo llegar».
El iframe mide 320px (380 desde `sm`) y va `loading="lazy"`. La consulta se deriva de la
dirección del CMS descartando el detalle interior del edificio (`Of.`, `Torre`, `Piso`…):
Google no lo geocodifica y termina rotulando el pin con la ficha de una empresa vecina.

**`AudienceSectors`** — banda de cierre `bg-cream` con los 12 sectores atendidos. Aplica la
Eyebrow Rule («A quién servimos» → «Para quién producimos») y hereda la lista editorial de
divisores de `HomePillars`, pero **sin numeración**: los `01…` de los pilares comunican
orden, y aquí no hay jerarquía entre sectores. El marcador es un punto ámbar de 6px —
forma decorativa, no texto, así que no viola la Amber Guardrail — alineado a la primera
línea para que los ítems de dos líneas no descoloquen la columna. Tres columnas en `lg`,
dos en `sm`, `reveal` por ítem. Vive fuera del wrapper de ornamentos, como sección
hermana full-bleed, para no romper la alternancia de fondos ni dejar que el dibujo
botánico invada la lista.

### Rotación editorial del blog (home, 2026-08-21)
`HomePostsRotator` reemplaza al bloque estático de `HomePostsSection` como cabecera del
blog en **la home y en `/blog`**: los artículos se turnan en el escenario grande con un fundido
**encadenado** y **6 s de turno** cada uno — 5.4 s en pantalla, 0.6 s de salida y 0.6 s de
entrada del siguiente, sin solaparse. Tiempo para leer titular y resumen, no un carrusel
que huye. El cruce solapado se probó y se descartó: fundir dos titulares y dos resúmenes a
la vez se lee como visión doble —con fotos funcionaría, con texto no— y encendía dos
barras del índice al tiempo. El índice lateral lista los mismos artículos y hace de indicador: la
fila del que está en escena enciende una barra ámbar de 2 px. Escenario e índice comparten
reloj (`animation-delay` por `nth-child` sobre un ciclo de 6 s × nº de artículos), así que
la sincronía no necesita estado en JS. Vocabulario en `globals.css` (`.blog-rotator`), CSS
puro como el resto del motion.

Decisiones que lo separan del fondo del hero —que es **textura**, no contenido— y que hay
que conservar: los artículos fuera de escena van en `visibility: hidden`, no solo
`opacity: 0`, para que sus enlaces salgan del orden de tabulación; **sin `aria-live`**
(anunciar un cambio que nadie pidió es ruido para lectores de pantalla); pausa en `:hover`
y `:focus-within` como el marquee de marcas (WCAG 2.2.2 — nadie persigue un blanco en
movimiento); y con `prefers-reduced-motion` la rotación **no arranca**: queda el primer
artículo fijo, exactamente el bloque estático de `/blog`. Todos los artículos se apilan en
una celda de grid, así que el alto lo fija el más largo y el relevo no desplaza nada. En
móvil el índice pierde la miniatura (`max-lg:hidden`): apilado bajo el escenario, repetir
la tarjeta del artículo que ya está arriba se leía como duplicado, no como sumario. La
barra ámbar es forma decorativa, no texto — no viola la Amber Guardrail — y es el único
indicador: puntos aparte serían un segundo acento compitiendo (One Hero Rule).

En `/blog` la rotación **no esconde ningún destino**: el índice lista siempre los tres
artículos en escena, así que cambia lo que se muestra en grande, no lo que se puede clicar
— por eso el archivo puede rotar sin castigar a quien viene a escanearlo. Y en las dos
páginas el orden lo fija `sortPostsByCoverFirst` (`src/lib/content.ts`): **primero los
artículos con portada**. El escenario destacado es una superficie fotográfica; encabezarla
con la portada tipográfica mientras hay artículos con foto esperando en las miniaturas
malvende el contenido. Los que no tienen foto no desaparecen: caen a las tarjetas del
final de `/blog`. Se corrige cargando la portada que falte desde el panel, no tocando ese
orden.

### Motion (vocabulario del sitio)
CSS puro, sin JavaScript (restricción SSG). Tokens en `globals.css`: `--ease-out`
(cubic-bezier(0.23, 1, 0.32, 1)), `--ease-drawer` (0.32, 0.72, 0, 1), `--dur-fast` 150ms
(pulsación/hover), `--dur-base` 250ms (acordeón, drawer), `--dur-enter` 400ms (entrada del
hero, solo la home). Piezas: entrada escalonada del hero (stagger 70ms; los candidatos LCP
animan solo transform), reveal scroll-driven `.reveal` en tarjetas/ítems de la home
y figuras de /nosotros, con la variante marcada `.reveal-strong` (36px de subida, rango
entry 0→65%) en los bloques institucionales de /nosotros — la estándar resultaba
imperceptible ahí
(`animation-timeline: view()`, el stagger emerge de la posición), acordeón FAQ animado vía
`::details-content`, drawer móvil y desplegable de «Productos» (`.nav-dropdown`, 150ms) con
`@starting-style`, rodillo de la banda de pilares (`.rodillo`/`.rodillo-vetas`: vaivén de
7s con `ease-in-out`), crossfade de 200ms entre páginas
(view transitions, header con nombre propio para percibirse estable), y el fondo rotativo
del hero (`.hero-slides`/`.hero-slide`, 2026-08-20: 7 fotos del cliente en crossfade de
42s con Ken Burns 1→1.06, capa aria-hidden a opacidad textura `--hero-slides-opacity`
0.15 detrás de todo el contenido; con reduced-motion queda la primera foto estática).
Todo con fallback
íntegro sin soporte y `prefers-reduced-motion` tratado pieza a pieza (suavizar, no
congelar el contenido). Excepción documentada a Flat-At-Rest: el drawer móvil (overlay)
lleva `shadow-md` para separarse del contenido.

## Do's and Don'ts

### Do:
- **Do** anunciar toda sección con el patrón eyebrow → Fraunces → descripción (The Eyebrow Rule).
- **Do** usar el producto real (caja DAP) como único héroe visual; lienzo blanco + `object-contain`.
- **Do** alternar fondos (blanco/lino/bandas de color/petróleo) para estructurar la
  página, y meter el color en bandas y franjas, no en el fondo de lectura
  (The Color-Band Rule).
- **Do** envolver todo motion en `motion-safe:`/media queries y dar fallback en
  `motion-reduce:` (los GIFs tienen variante estática: PNG, y en el hero el logo en
  vector `logo-cmc.svg`, que además releva al GIF al terminar la animación —
  2026-08-23). Los GIFs de marca viven en
  exactamente **tres** momentos desde el 2026-08-28: sello del hero, logo DAP junto al
  encabezado del catálogo de la home y mantequilla del CTA. El header perdió el suyo al
  pasar al emblema vectorial —más grande, nítido y quieto—, así que el logotipo se anima
  una sola vez por visita.
- **Do** mantener el camino a WhatsApp/teléfono visible a un paso en cada página.

### Don't:
- **Don't** usar ámbar como texto sobre fondos claros (The Amber Guardrail Rule).
- **Don't** devolver los cremas al fondo de las secciones públicas: la clienta los
  descartó explícitamente el 2026-08-28.
- **Don't** añadir sombras en reposo (The Flat-At-Rest Rule).
- **Don't** usar fotografía de stock, testimonios o cifras no verificadas (contenido en
  revisión listado en docs/CONTENT_PENDING.md).
- **Don't** introducir librerías de animación JS ni convertir componentes públicos a client
  components sin necesidad real: el motion es CSS-first (restricción SSG).
- **Don't** poner más de un protagonista de color/imagen por viewport (The One Hero Rule;
  la textura fotográfica del fondo del hero, a opacidad ≤0.18, no cuenta como
  protagonista — 2026-08-20).
