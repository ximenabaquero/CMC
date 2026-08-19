# Inventario de fotografías adicionales

Inventario visual de los 38 archivos recibidos en la carpeta
`fotos-adicionales` (inspeccionados uno a uno el **2026-08-17**). Los
archivos viven en `content-source/fotos-adicionales/` (fuera de git y del
sitio publicado) **con sus nombres originales**: el «nombre propuesto» de
las tablas es solo la propuesta de renombrado para cuando el uso quede
aprobado. **Ninguna de estas fotos está asociada a productos ni publicada.**

Estados: `PENDIENTE` = requiere identificación o aprobación de la clienta
antes de cualquier uso; `APROBADA (2026-08-19)` = importada y publicada en la
fase visual del 2026-08-19 (galería + fotos editoriales); `DESCARTADA` = no se
publica (montaje digital o indicios de IA).

> **Actualización 2026-08-19 — fase visual.** Se aprobaron e importaron **9
> fotos** (identificación confirmada o descripción genérica honesta): 3 para
> la banda editorial del hero, 1 para «¿Quiénes somos?» (home), 2 para
> Nosotros y 3 para la galería de DAP Hojaldre (estas últimas requieren
> ejecutar `supabase/scripts/2026-08-19-galeria-dap-hojaldre.sql` en el SQL
> Editor). Las copias renombradas viven en
> `content-source/fotos-adicionales/aprobadas/` y
> `content-source/Productos/dap-hojaldre/`; los originales no se tocaron.
> Las 6 fotos de bodega/transporte y los 2 montajes espejo quedan
> **descartados de publicación** por decisión de esta fase.

> **Actualización 2026-08-19 — recorte para la página FAQ.** De la aprobada
> `canasta-panes-surtidos-01` se generó el derivado con canal alfa
> `public/images/photos/canasta-panes-surtidos-01-recorte.webp` (script
> `scripts/recortar-foto-panes.mjs`: recorta el fondo blanco puro por
> flood-fill, gradúa el alfa en bordes/sombras y vacía el hueco del asa;
> entrada registrada en `scripts/assets-manifest.json`) para el panel
> editorial de `/preguntas-frecuentes`. Es la única foto presente en dos
> lugares (banda del hero y FAQ): se aceptó porque el recorte cambia por
> completo la presentación. Si el manifest se regenerara desde cero, volver
> a ejecutar el script.

> ⚠️ **Alerta — posibles imágenes generadas con IA.** Los 6 JPEG de
> bodega/transporte presentan texto ilegible o corrupto en las cajas
> («HOJALORE», «Margarina Dep Nagalos», una caja que solo dice «AP») y un
> destello tipo marca de agua de generador en la esquina inferior derecha.
> `PRODUCT.md` prohíbe fabricar evidencia: **no publicarlas como fotos
> reales de planta/bodega** salvo que la clienta confirme su origen o
> apruebe usarlas explícitamente como ilustración.

## Características generales

- `2.png` … `27.png`, `panes 1.png`, `Panes 2.png`: PNG cuadrados
  3375×3375, packshots con fondo blanco puro (aptos para lienzo blanco de
  tarjetas; no son escenas reales).
- Los pares con sufijo `(1)` (`3/3 (1)`, `4/4 (1)`, `5/5 (1)`, `6/6 (1)`)
  **no son duplicados**: son fotos distintas que colisionaron de nombre al
  descargar.
- Único duplicado real: `6ccfc9c4-…c3 (1).jpeg` es la misma foto que
  `6ccfc9c4-…c3.jpeg` (re-guardado con metadatos distintos) → descartable.
- No hay fotografías de planta, equipo humano ni panadería real en el lote.

## Inventario

| Nombre actual | Descripción visual | Categoría | Nombre propuesto | Alt propuesto | Uso sugerido | Estado |
|---|---|---|---|---|---|---|
| 2.png | Dos panes alargados tipo sub con hierbas y corte central, en "V" | PENDIENTE | pan-aliñado-sub-01 | Dos panes alargados con hierbas y corte central sobre fondo blanco | galería producto (posible DAP Aliñado) | PENDIENTE |
| 3.png | Bol metálico con margarina cremada, cuchara de madera, vaso medidor y bloques DAP Hojaldre | COMPOSICION | dap-hojaldre-margarina-preparacion-01 | Bol con margarina DAP Hojaldre cremada junto a vaso medidor y bloques de 500 g | galería DAP Hojaldre (SQL pendiente) | APROBADA (2026-08-19) |
| 3 (1).png | Pan de molde sin tajar con media pieza mostrando la miga | PAN | pan-molde-01 | Pan de molde dorado con media pieza mostrando la miga esponjosa | galería producto / blog | PENDIENTE |
| 4.png | Variante de 3.png sin vaso medidor (bol + bloques DAP Hojaldre) | COMPOSICION | dap-hojaldre-margarina-preparacion-02 | Margarina DAP Hojaldre en bloque y cremada en bol de acero | galería DAP Hojaldre (SQL pendiente) | APROBADA (2026-08-19) |
| 4 (1).png | Cinco tajadas de pan de molde en abanico | PAN | pan-molde-tajadas-01 | Tajadas de pan de molde dispuestas en abanico sobre fondo blanco | galería producto / decoración | PENDIENTE |
| 5.png | Caja DAP Hojaldre 10 kg con tres bloques de 500 g al lado | PRODUCTO | dap-hojaldre-caja-bloques-01 | Caja de 10 kg de margarina DAP Hojaldre junto a bloques de 500 g | galería DAP Hojaldre (SQL pendiente) | APROBADA (2026-08-19) |
| 5 (1).png | Amasijo redondo gratinado con queso (¿pan de queso/mogolla?) | PENDIENTE | amasijo-queso-gratinado-01 | Pan redondo artesanal gratinado con queso dorado al horno | galería producto | PENDIENTE |
| 6.png | Franja baja: bol de margarina + bloques DAP + surtido de hojaldres; mucho aire blanco arriba | COMPOSICION | composicion-hojaldres-dap-hero-01 | Surtido de hojaldres elaborados con margarina DAP junto a bol de margarina cremada | Nosotros (figura de cierre) | APROBADA (2026-08-19) |
| 6 (1).png | Pastel hojaldrado redondo con borde repulgado | PASTELERIA | pastel-hojaldre-redondo-01 | Pastel de hojaldre redondo con borde sellado y dorado brillante | galería producto | PENDIENTE |
| 7.png | Croissant relleno gratinado con queso | PASTELERIA | croissant-gratinado-01 | Croissant dorado gratinado con queso rallado por encima | galería producto / decoración | PENDIENTE |
| 8.png | Rollo tipo cachito liso, ¿pan suave u hojaldre? | PENDIENTE | pan-rollo-mantequilla-01 | Rollo de pan dorado tipo cachito con espiral marcada | galería producto | PENDIENTE |
| 9.png | Tres palmeritas de hojaldre azucaradas (inequívocas) | PASTELERIA | palmerita-hojaldre-01 | Palmeritas de hojaldre caramelizadas con azúcar | banda hero (home) | APROBADA (2026-08-19) |
| 10.png | Dos pastelitos de hojaldre azucarados con relleno rojizo (¿guayaba?) | PASTELERIA | hojaldre-relleno-dulce-01 | Pastelitos de hojaldre azucarados con relleno de fruta roja | galería producto / blog | PENDIENTE |
| 11.png | Torres de panecillos dorados apiladas (montaje digital espejo evidente) | PENDIENTE | pan-suave-apilado-01 | — | no publicar | DESCARTADA (2026-08-19, montaje digital) |
| 12.png | Dos pasteles cuadrados de hojaldre gratinados con queso | PASTELERIA | hojaldre-queso-cuadrado-01 | Pasteles cuadrados de hojaldre gratinados con queso | galería producto (DAP Hojaldre) | PENDIENTE |
| 13.png | Hojaldre redondo azucarado abierto con crema pastelera | PASTELERIA | hojaldre-crema-pastelera-01 | Hojaldre relleno de crema pastelera partido a la mitad | galería producto / blog | PENDIENTE |
| 14.png | Dos rollos de canela hojaldrados (duplicación espejo digital) | PASTELERIA | rollo-canela-01 | — | no publicar | DESCARTADA (2026-08-19, montaje digital) |
| 15.png | Palitos de hojaldre con ajonjolí | PASTELERIA | palito-hojaldre-ajonjoli-01 | Palitos de hojaldre dorados con semillas de ajonjolí | galería producto / decoración | PENDIENTE |
| 16.png | Canasta de mimbre con panes surtidos (mogolla integral, pan de maíz, panes suaves) | COMPOSICION | canasta-panes-surtidos-01 | Canasta de mimbre con surtido de panes artesanales recién horneados | banda hero (home); recorte con alfa en FAQ | APROBADA (2026-08-19) |
| 17.png | Cuatro bollos ovalados dorados (¿pan aliñado/pan de leche?) | PENDIENTE | pan-bollo-ovalado-01 | Cuatro panes ovalados de corteza dorada sobre fondo blanco | galería producto | PENDIENTE |
| 18.png | Pan de molde integral con ajonjolí y linaza | PAN | pan-molde-integral-01 | Pan de molde integral con semillas de ajonjolí sobre fondo blanco | galería producto / blog | PENDIENTE |
| 19.png | Barra con cortes diagonales y espolvoreo de harina | PENDIENTE | pan-barra-cortes-01 | Barra de pan dorada con cortes diagonales y harina sobre fondo blanco | galería producto | PENDIENTE |
| 20.png | Cuatro roscas amarillas (¿pandebono/rosquilla?) | PENDIENTE | amasijo-rosca-01 | Cuatro roscas de amasijo doradas sobre fondo blanco | galería producto | PENDIENTE |
| 21.png | Cuatro buñuelos colombianos apilados (inequívocos) | AMASIJO | amasijo-bunuelo-01 | Buñuelos colombianos apilados | banda hero (home); candidata cover blog amasijos | APROBADA (2026-08-19) |
| 22.png | Dos piezas en herradura (¿pandeyuca?) | PENDIENTE | amasijo-herradura-01 | Dos amasijos en forma de herradura sobre fondo blanco | galería producto | PENDIENTE |
| 23.png | Plato de secciones con surtido de panes y amasijos | COMPOSICION | composicion-surtido-amasijos-01 | Surtido de panes y amasijos colombianos en plato de secciones | home «¿Quiénes somos?» | APROBADA (2026-08-19) |
| 24.png | Torta marmolada tipo bundt, cupcakes y postre con fruta | PASTELERIA | pasteleria-surtido-tortas-cupcakes-01 | Surtido de pastelería: torta marmolada, cupcakes y postre con frutas | galería producto / blog | PENDIENTE |
| 25.png | Rejilla dorada con surtido de galletería y pastelería | PASTELERIA | pasteleria-galleteria-rejilla-01 | Surtido de galletas y pastelería sobre rejilla dorada | galería producto / blog / decoración | PENDIENTE |
| 26.png | Torta marmolada con almendras laminadas e hilos de chocolate | PASTELERIA | pasteleria-torta-marmolada-01 | Torta marmolada con almendras laminadas e hilos de chocolate | galería producto / blog | PENDIENTE |
| 27.png | Bandeja redonda de secciones con galletería surtida | PASTELERIA | pasteleria-galleteria-bandeja-01 | Bandeja con surtido de galletería y bocados de chocolate | galería producto / blog | PENDIENTE |
| panes 1.png | Mesa de panadería sobre madera con ventana luminosa; ~50 % de aire claro arriba | HERO | hero-mesa-panaderia-01 | Mesa de panadería con surtido de panes, hojaldres y amasijos frente a una ventana luminosa | Nosotros (banner) | APROBADA (2026-08-19) |
| Panes 2.png | Misma serie; ~60 % superior de aire claro, ideal para superponer texto | HERO | hero-mesa-panaderia-02 | Mesa de panadería con panes, pastelería y amasijos sobre fondo claro | hero / nosotros | PENDIENTE |
| 6ccfc9c4-…c3.jpeg | Pasillo de bodega con estibas de cajas DAP y montacargas | BODEGA | — | — | no publicar | DESCARTADA (2026-08-19, indicios de IA) |
| 6ccfc9c4-…c3 (1).jpeg | **Duplicado exacto (visual) del anterior** | BODEGA | — | — | no publicar | DESCARTADA (duplicado + indicios de IA) |
| 705b4e2f-…06.jpeg | Cargue de cajas DAP en furgón refrigerado, operario al fondo | BODEGA | — | — | no publicar | DESCARTADA (2026-08-19, indicios de IA) |
| 85d8df74-…51.jpeg | Furgón lleno de cajas DAP Alta Repostería Ponqué | BODEGA | — | — | no publicar | DESCARTADA (2026-08-19, indicios de IA) |
| 98f713d0-…d9.jpeg | Pasillo alto de bodega con cajas DAP y operario | BODEGA | — | — | no publicar | DESCARTADA (2026-08-19, indicios de IA) |
| cf095cbb-…bc.jpeg | Contenedor con estibas de cajas DAP Repostería en muelle | BODEGA | — | — | no publicar | DESCARTADA (2026-08-19, indicios de IA) |

## Propuesta de covers para el blog (2026-08-19, sin aplicar)

Los 4 artículos están publicados con la portada tipográfica `EditorialCover`.
El cover se asigna desde el admin (`blog_posts.cover_image_id`) cuando la
clienta lo apruebe; estas fotos habría que importarlas o subirlas vía CMS en
ese momento:

| Artículo | Foto propuesta | Nota |
|---|---|---|
| El arte de hacer hojaldre | `13.png` (hojaldre con crema pastelera) | identificación confirmada |
| Amasijos colombianos… | `21.png` (buñuelos) o `23.png` (surtido) | ambas ya aparecen en la home — decidir al asignar |
| Los beneficios de comer pan… | `18.png` (pan de molde integral) | identificación razonable (categoría PAN) |
| Consejos para almacenar materias primas… | **pendiente** | las únicas candidatas (bodega) quedaron descartadas por indicios de IA |

## Próximos pasos (requieren decisión de la clienta)

1. Confirmar el tipo exacto de pan/amasijo en las filas aún `PENDIENTE`
   (no se publica nada con identificación dudosa).
2. Ejecutar `supabase/scripts/2026-08-19-galeria-dap-hojaldre.sql` en el SQL
   Editor para activar las 3 fotos aprobadas en la galería de DAP Hojaldre.
3. Aprobar los covers del blog propuestos arriba y asignarlos desde el admin.
4. Si la clienta confirma el origen real de las fotos de bodega, revisar su
   estado `DESCARTADA`; mientras tanto no se publican.
