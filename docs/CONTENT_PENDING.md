# Contenido pendiente y en revisión editorial

Este documento centraliza (a) el material que aún debe entregar el cliente a
través de Ana y (b) las afirmaciones que quedaron **en revisión** y no se
publican hasta ser verificadas.

Responsable de recopilar y aprobar el contenido: **Ana** (según acuerdo de la
reunión 1, punto 2). Última actualización: 2026-08-20.

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
- **Migración pendiente de ejecutar** (2026-08-21):
  `supabase/migrations/0005_post_media.sql` habilita las **imágenes dentro
  del cuerpo de los artículos** (tabla `post_media`). Hasta ejecutarla en el
  SQL Editor de dev y de producción, la sección «Imágenes dentro del
  artículo» del panel se ve vacía y subir una imagen falla con error de base
  de datos. Después conviene correr `supabase/tests/rls_checks.sql`.
  Fuera de alcance por ahora (no pedido): biblioteca de medios reutilizable
  entre artículos, pies de foto y redimensionado automático al subir — el
  panel guarda el archivo tal cual, con el límite `MAX_UPLOAD_MB`.
- **SQL pendiente de ejecutar** (2026-08-19):
  `supabase/scripts/2026-08-19-galeria-dap-hojaldre.sql` añade las 3 fotos
  aprobadas a la galería de DAP Hojaldre (los WebP ya están en `public/`).
  Hasta ejecutarlo en el SQL Editor, la ficha sigue mostrando caja +
  aplicación.
- **Covers del blog** (actualizado 2026-08-20): la clienta entregó fotos
  nuevas y eligió tres. Los derivados ya están en `public/images/blog/` y
  `supabase/scripts/2026-08-20-covers-blog.sql` (**pendiente de ejecutar** en
  el SQL Editor de dev y producción) crea los `media_assets` STATIC y asigna
  `blog_posts.cover_image_id` para amasijos, pan y hojaldre. Sigue **sin
  portada** el artículo de almacenamiento de materias primas: la cuarta foto
  entregada (croissants, 325×245) es demasiado pequeña y no encaja con el
  tema; se necesita una foto de almacenamiento real.
- **Origen de las fotos entregadas el 2026-08-20** (bodega DAP de la home,
  panadero de «Propuesta de valor» y las 4 del blog): **ninguna proviene del
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
