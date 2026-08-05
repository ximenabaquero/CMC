# Contenido pendiente y en revisión editorial

Este documento centraliza (a) el material que aún debe entregar el cliente a
través de Ana y (b) las afirmaciones que quedaron **en revisión** y no se
publican hasta ser verificadas.

Responsable de recopilar y aprobar el contenido: **Ana** (según acuerdo de la
reunión 1, punto 2). Última actualización: 2026-08-04.

## 1. Afirmaciones en revisión (NO publicadas)

| Afirmación | Dónde está guardada | Qué falta para publicarla |
|---|---|---|
| Certificación ISO 22000 («Contamos con la certificación internacional ISO 22000…») | Sección `iso_certification` en el CMS (borrador) | Evidencia del certificado: número, entidad certificadora y alcance |
| «La margarina y la mantequilla son productos lácteos» | FAQ n.º 2 (borrador) | Validar/reformular la redacción: la margarina es de origen vegetal; clasificarla como producto lácteo es cuestionable |
| «Según la OMS, el consumo de 250 g de pan al día es beneficioso» | Artículo «Los beneficios de comer pan» (borrador, nota interna) | Fuente verificable de la OMS o reformulación sin la atribución |
| Datos de contacto que aparecen en el pie de las fichas técnicas (NIT 901.320.225-1; Av. 68 # 75a-50, Torre Ofiespacios, Of. 325-326, C.C. Metrópolis, Bogotá D.C.; tel. 301 466 2902 / 323 439 6358) | Solo en este documento — NO cargados al CMS | Confirmación de Ana de que son los canales oficiales y vigentes para el sitio web |

> Los cuatro artículos del blog y los 12 productos están en estado
> **borrador** y no aparecen en el sitio público hasta que el cliente los
> apruebe y publique desde el panel.

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
