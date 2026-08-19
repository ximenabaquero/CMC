# Contenido pendiente y en revisión editorial

Este documento centraliza (a) el material que aún debe entregar el cliente a
través de Ana y (b) las afirmaciones que quedaron **en revisión** y no se
publican hasta ser verificadas.

Responsable de recopilar y aprobar el contenido: **Ana** (según acuerdo de la
reunión 1, punto 2). Última actualización: 2026-08-17.

## 1. Afirmaciones en revisión (NO publicadas)

| Afirmación | Dónde está guardada | Qué falta para publicarla |
|---|---|---|
| Certificación ISO 22000 («Contamos con la certificación internacional ISO 22000…») | Sección `iso_certification` en el CMS (borrador) | Evidencia del certificado: número, entidad certificadora y alcance |
| «La margarina y la mantequilla son productos lácteos» | FAQ n.º 2 (borrador) | Validar/reformular la redacción: la margarina es de origen vegetal; clasificarla como producto lácteo es cuestionable |
| «Según la OMS, el consumo de 250 g de pan al día es beneficioso» | Artículo «Los beneficios de comer pan» (borrador, nota interna) | Fuente verificable de la OMS o reformulación sin la atribución |
| Datos de contacto que aparecen en el pie de las fichas técnicas (NIT 901.320.225-1; Av. 68 # 75a-50, Torre Ofiespacios, Of. 325-326, C.C. Metrópolis, Bogotá D.C.; tel. 301 466 2902 / 323 439 6358) | Solo en este documento — NO cargados al CMS | Confirmación de Ana de que son los canales oficiales y vigentes para el sitio web |

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
- **SQL pendiente de ejecutar** (2026-08-19):
  `supabase/scripts/2026-08-19-galeria-dap-hojaldre.sql` añade las 3 fotos
  aprobadas a la galería de DAP Hojaldre (los WebP ya están en `public/`).
  Hasta ejecutarlo en el SQL Editor, la ficha sigue mostrando caja +
  aplicación.
- **Covers del blog** (2026-08-19): propuesta foto→artículo en
  `docs/FOTOS_ADICIONALES.md` (sección «Propuesta de covers»); pendiente de
  aprobación de Ana y asignación desde el admin. El artículo de
  almacenamiento queda sin candidata (sus únicas opciones eran las fotos de
  bodega descartadas).

## 2. Material pendiente por recibir de Ana

- [ ] **Manual de identidad de marca**: colores oficiales, tipografías y usos
      del logotipo. (El sitio usa un tema provisional con variables CSS
      centralizadas en `src/app/globals.css`, derivado de los colores del
      logo entregado.)
- [ ] **Logotipo en alta calidad / vectorial** (se recibieron 4 PNG; un SVG o
      archivo fuente mejoraría nitidez y favicon).
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
- [ ] **Información de contacto oficial**: teléfono(s), WhatsApp, correo,
      dirección y ciudad (ver candidatos en la sección 1).
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

## 3. Decisiones pendientes de aprobación

- Paleta de colores y tipografía definitivas (hoy: tema provisional).
- Textos editoriales ajustados (versión corregida de los PDF).
- Qué productos se publican primero y en qué orden.
- Imagen principal de cada producto (hoy: la caja del empaque).
