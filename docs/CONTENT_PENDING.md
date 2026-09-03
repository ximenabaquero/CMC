# Contenido pendiente y en revisión editorial

Este documento centraliza (a) el material que aún debe entregar el cliente a
través de Ana y (b) las afirmaciones que quedaron **en revisión** y no se
publican hasta ser verificadas.

Responsable de recopilar y aprobar el contenido: **Ana** (según acuerdo de la
reunión 1, punto 2). Última actualización: 2026-09-03.

## 0. Insumos que bloquean los ajustes pedidos el 2026-08-28

Del documento «Requerimientos de ajustes — Landing CMC v1.0» quedaron cinco puntos
esperando material de la clienta. Todo lo demás de ese documento está implementado.

> **2026-09-03 — el punto 14 se cerró.** La clienta entregó la fotografía de la familia
> compartiendo pan y está publicada en `/nosotros` (ver más abajo). El punto 08 sigue
> abierto pero **cambió de urgencia**: la foto de bodega ya no es la única imagen
> cuestionada del sitio, porque el cargue de cajas —la peor de todas— salió de
> `/nosotros` al entrar la familia.

| N.º | Qué falta | Dónde entra cuando llegue |
|---|---|---|
| 07 | **Foto nueva del empaque de Alta Repostería Ponqué** (la presentación cambió) | Se sube como imagen principal del producto desde `/admin/productos/<id>`. Al ser un medio del CMS, se propaga sola a la ficha, a las tarjetas y a la pila del hero: no hay rutas literales que tocar |
| 08 | **Foto/composición nueva para «¿Quiénes somos?»** de la home | Reemplaza `public/images/photos/bodega-dap-01.webp` en `src/app/(public)/page.tsx`. ⚠️ La imagen actual es una de las descartadas por indicios de IA y además muestra el empaque antiguo del Ponqué; sigue publicada por decisión explícita de la clienta. Su alternativa (usar otro producto destacado) también está abierta, pero implica repetir una foto ya usada o producir una composición nueva: decisión pendiente |
| 10 | **Contenido de la FAQ de Alta Repostería** | No requiere código: se crea en `/admin/preguntas-frecuentes` y, marcada como destacada, aparece también en la home |
| 13 | **Catálogo comercial en PDF** | Copiar el archivo a `public/catalogo/` y apuntar `CATALOG_PDF_HREF` en `src/lib/catalog.ts`. Mientras tanto, el menú «Productos» muestra la entrada «Descargar catálogo» inerte y rotulada «Próximamente» |
| ~~14~~ | ~~**Fotografía de una familia colombiana compartiendo pan**~~ | ✅ **Cerrado el 2026-09-03.** La clienta entregó la foto y se publicó como `public/images/photos/familia-compartiendo-pan-01.webp` (1200×900, 111 KB) junto al h1 de `/nosotros`, en una apertura recompuesta a dos columnas. Releva al cargue de cajas DAP. ⚠️ La foto **no viene de `content-source/`**: falta que Ana confirme origen y licencia, misma salvedad que las entregas del 2026-08-20 y del 2026-08-23 |
| 15 | **Fotografía real del técnico panadero** | Reemplaza `public/images/photos/panadero-croissants-01.webp` en la sección «Propuesta de valor» (`src/app/(public)/page.tsx`). Verificar resolución, encuadre y comportamiento responsive antes de dejarla; si pierde calidad, se conserva la actual |

## 1. Afirmaciones en revisión (NO publicadas)

| Afirmación | Dónde está guardada | Qué falta para publicarla |
|---|---|---|
| Certificación ISO 22000 («Contamos con la certificación internacional ISO 22000…») | Sección `iso_certification` en el CMS (borrador) | Evidencia del certificado: número, entidad certificadora y alcance |
| «La margarina y la mantequilla son productos lácteos» | FAQ n.º 2 (borrador) | Validar/reformular la redacción: la margarina es de origen vegetal; clasificarla como producto lácteo es cuestionable |
| «Según la OMS, el consumo de 250 g de pan al día es beneficioso» | Artículo «Los beneficios de comer pan» (borrador, nota interna) | Fuente verificable de la OMS o reformulación sin la atribución |
| NIT 901.320.225-1 (pie de las fichas técnicas) | Solo en este documento — NO cargado al CMS | Confirmar si debe publicarse en el sitio (hoy no aparece en ninguna página) |

> Los cuatro artículos del blog nacieron en estado **borrador**. Nota
> (2026-08-17): se detectó que los 12 productos figuran **PUBLICADOS** en la
> base de datos de desarrollo, incluidos los 3 placeholders «Producto
> pendiente de definir (1/2/3)», que por regla no deben aparecer en el
> sitio. El script `supabase/scripts/2026-08-17-normalizacion-catalogo.sql`
> los devuelve a borrador (pendiente de ejecución autorizada).

## 1b. Hallazgos de la normalización del catálogo (2026-08-17)

- **Clasificación de los 18 PDF del material de productos**: cada carpeta
  traía 2 PDF. Los que empiezan por «Ficha Técnica» (400 KB–1 MB) son las
  fichas técnicas oficiales y quedaron publicables como descarga en cada
  producto. Los 9 PDF cortos (~24 KB, p. ej. `DAP Hojaldre.pdf`) son **copy
  comercial para la web** (Descripción + Usos), no fichas: no se importan y
  permanecen en `content-source/Productos/<slug>/` como referencia. No hay
  fichas duplicadas ni contradictorias entre sí.
- **DAP Alta Repostería Ponqué — conflicto CONFIRMADO en la ficha oficial**:
  la «Descripción del producto» y el «Uso previsto» de la ficha traen texto
  de margarina de hojaldre («Esta margarina tipo hojaldre está indicada
  para la elaboración de masas hojaldradas», «formación de láminas
  uniformes… textura crujiente»), mientras la sección «Propiedades» del
  mismo documento describe el perfil real de ponqué (consistencia cremosa,
  volumen, miga fina). El sitio usa el texto de «Propiedades» y omite el
  uso previsto contradictorio. **Ana debe confirmar el uso previsto
  correcto con el fabricante** antes de publicar esa afirmación.
- **Aceite Sólido DAP — errata en la ficha**: la ficha (y el copy web)
  dicen «fritura **instruccional**»; el sitio publica «fritura
  **institucional**» por ser la lectura evidente. Confirmar con Ana.
- **Atemperado**: solo las fichas de Hojaldre, Industrial y Semi
  Hojaldrados traen recomendación de atemperado; el resto de productos no
  publica ese dato (no se inventa).
- **Fotografías adicionales (38 archivos)**: inventariadas en
  `docs/FOTOS_ADICIONALES.md`. Fase visual 2026-08-19: **9 aprobadas e
  importadas** (banda del hero, «¿Quiénes somos?», Nosotros y galería de
  DAP Hojaldre); el resto sigue PENDIENTE de identificación/aprobación.
  ⚠️ Las 6 fotos de bodega/transporte presentan indicios claros de haber
  sido **generadas con IA** (texto corrupto en las cajas, marca de agua de
  generador): quedaron **DESCARTADAS de publicación**; solo se
  reconsiderarían si Ana confirma su origen real.
- **Imágenes dentro del cuerpo de los artículos** (2026-08-21):
  `supabase/migrations/0005_post_media.sql` **ya está aplicada en la base de
  desarrollo** (verificado: la tabla `post_media` existe), así que la sección
  «Imágenes dentro del artículo» del panel funciona. Fuera de alcance por
  ahora (no pedido): biblioteca de medios reutilizable entre artículos, pies
  de foto y redimensionado automático al subir — el panel guarda el archivo
  tal cual, con el límite `MAX_UPLOAD_MB`.
- **SQL pendiente de ejecutar** (2026-08-19) — el **único** que queda, según
  la auditoría del 2026-08-21: `supabase/scripts/2026-08-19-galeria-dap-hojaldre.sql`
  añade las 3 fotos aprobadas a la galería de DAP Hojaldre (los WebP ya están
  en `public/`). Verificado en la BD: la ficha sigue con 2 imágenes (caja +
  aplicación) en vez de 5.
- **Covers del blog** (actualizado 2026-08-21): las tres portadas se suben
  **desde el panel** (`/admin/blog/<artículo>` → «Imagen de portada»), no por
  SQL — decisión de la usuaria. Los archivos optimizados están en
  `public/images/blog/`. Verificado: los 4 artículos siguen con
  `cover_image_id` en null, así que hasta que se suban se ven las portadas
  tipográficas. **Causa encontrada el 2026-08-21**: la subida desde el panel
  estaba rota — `UploadImageForm` usaba ids literales y la página de artículo
  monta dos instancias, así que el clic en «Archivo…» de la portada abría el
  selector del formulario del cuerpo y la portada nunca llegaba a la BD, sin
  error visible. Corregido (ids con `useId()`); la subida desde el panel ya
  es viable. **Hacerlo desde el sitio publicado**, no desde `npm run dev`: en
  local el archivo va al bucket R2 simulado (`cmc-website-media-dev`) y
  producción devolvería 404 en `/api/media/<key>`.
  `supabase/scripts/2026-08-20-covers-blog.sql` queda como
  respaldo y **se borrará** cuando estén subidas (junto con la carpeta
  `public/images/blog/`, que solo sirve para elegir los archivos al subirlos).
  **Resuelto el 2026-09-03**: el artículo de almacenamiento de materias primas
  ya tiene foto. La cuarta entrega del 2026-08-20 (croissants, 325×245) era
  demasiado pequeña y ajena al tema; la clienta entregó ahora una escena de
  bodega de materias primas (estantería metálica con sacos de harina, granos y
  contenedores herméticos rotulados), derivada a
  `public/images/blog/almacen-materias-primas-01.webp` (1200×675, 123 KB).
  Falta **cargarla**: desde `/admin/blog/<artículo>` → «Imagen de portada»
  sobre el sitio publicado, o ejecutando el respaldo
  `supabase/scripts/2026-09-03-cover-blog-almacenamiento.sql`. Verificado el
  mismo día en la BD de desarrollo: los otros 3 artículos **ya tienen portada
  cargada** (se ven las fotos en `/blog`), así que el flujo del panel funciona
  y este es el último que falta.
- **Origen de las fotos entregadas el 2026-08-20** (bodega DAP de la home,
  panadero de «Propuesta de valor» y las 4 del blog), **el 2026-08-23** (cargue
  de cajas) y **el 2026-09-03** (familia compartiendo pan y bodega de materias
  primas del blog): **ninguna proviene del
  material de `content-source/`** y varias tienen aspecto de banco de
  imágenes — la de bodega es, byte a byte, una de las descartadas por
  indicios de IA. Publicadas/preparadas por decisión explícita de la clienta;
  falta que Ana confirme **origen y licencia** de cada una (regla «cero
  fotografía de stock» de `PRODUCT.md`).

## 2. Material pendiente por recibir de Ana

- [ ] **Manual de identidad de marca**: colores oficiales, tipografías y usos
      del logotipo. (El sitio usa un tema provisional con variables CSS
      centralizadas en `src/app/globals.css`, derivado de los colores del
      logo entregado.)
- [ ] **Logotipo en alta calidad / vectorial** (se recibieron 4 PNG; un SVG o
      archivo fuente mejoraría nitidez y favicon). El favicon actual
      (`src/app/favicon.ico`, `icon.png`, `apple-icon.png`) se generó a partir
      del emblema del PNG entregado; regenerar desde el vectorial cuando llegue.
- [ ] **Fotografías corporativas autorizadas** (planta, equipo, procesos).
      No se usaron fotos de stock; los espacios sin imagen muestran
      marcadores claramente identificados.
- [ ] **Información de los 3 productos faltantes**: el contrato contempla 12
      productos y el material entregado incluye 9 (DAP Hojaldre, Alta
      Repostería Ponqué, Industrial, Multipropósito, Repostería, Semi
      Hojaldrados, Aliñado, Preparado Graso y Aceite Sólido). Faltan nombre,
      descripción, características, presentación e imágenes de los otros 3.
- [ ] **Revisión de descripciones, características y presentaciones** de los
      9 productos cargados (extraídas de las fichas técnicas oficiales).
      Nota: la ficha de DAP Alta Repostería Ponqué trae un «uso previsto»
      que parece de otro producto (masas hojaldradas); confirmar.
- [ ] **Categorías de productos**: se propusieron «Margarinas industriales»,
      «Preparados grasos» y «Aceites» a partir de las fichas; confirmar.
- [x] **Información de contacto oficial** — recibida el 2026-08-20:
      llamadas +57 311 255 5296, WhatsApp +57 310 396 3790, Av. Carrera 68
      # 75A-50, C.C. Metrópolis, Torre Ofiespacios, Of. 325-326, Bogotá D.C.
      **Reemplaza** a los candidatos del pie de las fichas técnicas (los
      teléfonos 301 466 2902 / 323 439 6358 quedan obsoletos). Cargados en
      `supabase/seed.sql` y en el script
      `supabase/scripts/2026-08-20-datos-contacto.sql`, que debe ejecutarse
      en el SQL Editor de **desarrollo y producción** (y después guardar en
      `/admin/contacto` para revalidar la caché).
- [ ] **Correo electrónico oficial**: sigue sin confirmar, queda en NULL y el
      sitio oculta el canal.
- [ ] **Horarios de atención.**
- [ ] **Redes sociales oficiales** (URLs).
- [ ] **Logos de las marcas cliente**: la carpeta «Logos de marcas que son
      sus clientes» del Drive está vacía. Además, falta autorización escrita
      de esas marcas para exhibir sus logos. El carrusel de marcas de la
      página de inicio ya está implementado (gestión en `/admin/marcas`,
      migración `0003_brands.sql`) y permanece oculto hasta que se publique
      al menos una marca con logo.
- [ ] **Certificado ISO 22000** (ver sección 1).
- [ ] **Información legal**: textos de política de privacidad / tratamiento
      de datos personales (Ley 1581 de 2012) si el cliente los requiere.
- [ ] **Acceso al dominio** (solo cuando la publicación esté aprobada y
      pagada; ver docs/DEPLOYMENT.md).
- [ ] **Definición del correo receptor** si en el futuro se desea un
      formulario de contacto (fuera del alcance actual).

## 2b. Copy publicado que aún no es editable desde el CMS

- **Variantes por clima** (2026-08-28): las tres tarjetas de `ClimateVariants`
  (clima frío/cálido/costa, con atemperado y almacenamiento) son una constante
  del componente `src/components/public/ClimateVariants.tsx`, no una fila de
  `company_content`. Todas las cifras salen literales de las fichas técnicas
  oficiales (rangos de atemperado de Hojaldre, Industrial y Semi Hojaldrados;
  máximos de almacenamiento de casi todas). Si la clienta va a editarlo, hay
  que crear la sección `climate_variants` con el patrón `data.items` de
  `pillars`; mientras tanto, cualquier cambio pasa por código.
- **Fecha de fundación** (2026-08-30): la franja de indicadores de la home
  muestra «Años de experiencia», calculado desde la constante `FOUNDED`
  (9 de septiembre de 2019) en `src/components/public/HomeStats.tsx`. Esa
  fecha está publicada literal en el bloque «¿Quiénes somos?» del CMS, pero
  la constante **no** se parsea de ese texto: si la clienta corrige la fecha
  desde el panel, hay que corregir también la constante.
- **Orden destacado del catálogo** (2026-08-28): los tres productos que
  encabezan la home y `/productos` están fijados por slug en
  `FEATURED_PRODUCT_SLUGS` (`src/lib/content.ts`), no por `sort_order`. Si la
  clienta quiere gobernarlo desde el panel, se borra esa constante.

- **Público objetivo de `/contacto`** (recibido el 2026-08-20): los 12
  sectores viven como constante `AUDIENCE_SECTORS` en
  `src/components/public/AudienceSectors.tsx`, no en `company_content`. Si la
  clienta va a editarlos con frecuencia, hay que crear una sección nueva
  (clave `target_audience`) con el mismo patrón `data.items` de `pillars`;
  mientras tanto, cualquier cambio pasa por código. Dos observaciones
  editoriales pendientes de su decisión: «Industrias panificadoras»,
  «Empresas panificadoras» y «Cadenas de panificación» se solapan entre sí, y
  «Tiendas hard discount» es un anglicismo que podría redactarse en español.
  La lista se publicó verbatim (solo con tildes corregidas).

## 3. Decisiones pendientes de aprobación

- Paleta de colores y tipografía definitivas (hoy: tema provisional).
- Textos editoriales ajustados (versión corregida de los PDF).
- Qué productos se publican primero y en qué orden.
- Imagen principal de cada producto (hoy: la caja del empaque).
