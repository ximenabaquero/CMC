-- ============================================================
-- Seed inicial — Compañía Mundial de Comercio S.A.S.
--
-- Contenido extraído del material entregado por el cliente
-- (PDFs institucionales, fichas técnicas y artículos), con
-- corrección ortográfica y gramatical sin cambiar el sentido
-- comercial.
--
-- Reglas editoriales aplicadas (ver docs/CONTENT_PENDING.md):
--  * La certificación ISO 22000 NO se publica (falta evidencia).
--  * La FAQ que clasifica margarina y mantequilla como "productos
--    lácteos" queda en DRAFT (afirmación en revisión).
--  * El artículo del pan queda en DRAFT y su mención a la OMS
--    está marcada como en revisión.
--  * Los 12 productos quedan en DRAFT hasta aprobación.
--  * Los datos de contacto NO se cargan (pendientes de confirmar).
--  * No se crea ningún usuario administrador aquí.
--
-- Ejecutar DESPUÉS de las migraciones 0001 y 0002.
-- Idempotencia: usa upsert por claves naturales/ids fijos.
-- ============================================================

-- ------------------------------------------------------------
-- site_settings (fila única). Contacto en NULL: el sitio público
-- oculta los canales no configurados.
-- ------------------------------------------------------------
insert into public.site_settings (id, company_name, slogan, seo_title, seo_description)
values (
  1,
  'Compañía Mundial de Comercio S.A.S.',
  'Su aliado en los negocios',
  'Compañía Mundial de Comercio S.A.S.',
  'Empresa colombiana dedicada a la producción y distribución de margarinas, mantequillas y aceites para panadería, repostería e industria.'
)
on conflict (id) do nothing;

-- ------------------------------------------------------------
-- Contenido institucional (secciones de Inicio y Nosotros)
-- ------------------------------------------------------------
insert into public.company_content (section_key, title, body, data, status, internal_note) values
(
  'home_hero',
  'Margarinas, mantequillas y aceites con el respaldo de la experiencia',
  'Somos una empresa colombiana dedicada a la producción y distribución de margarinas, mantequillas y aceites. Trabajamos para que panaderías, pastelerías e industrias cuenten con productos consistentes, ágiles y confiables.',
  null,
  'PUBLISHED',
  null
),
(
  'home_intro',
  '¿Quiénes somos?',
  'Somos una empresa colombiana con más de seis años de experiencia en la producción de margarinas, mantequillas y aceites. Desde la fundación de nuestra empresa, el 9 de septiembre de 2019, estamos comprometidos con ofrecer a nuestros clientes productos de la más alta calidad, utilizando las mejores materias primas del mercado colombiano.',
  null,
  'PUBLISHED',
  'La frase sobre la certificación ISO 22000 se retiró del texto publicado hasta recibir evidencia del certificado (ver sección iso_certification y docs/CONTENT_PENDING.md).'
),
(
  'pillars',
  'Nuestros pilares',
  'Nuestra propuesta de valor se fundamenta en seis pilares.',
  '{"items": [
    {"title": "Transparencia y confianza", "description": "Gestionamos cada etapa de la operación con claridad y honestidad."},
    {"title": "Integridad", "description": "Cada decisión está respaldada por la integridad y el cumplimiento."},
    {"title": "Responsabilidad", "description": "Procesos responsables que dan tranquilidad a clientes, proveedores y colaboradores."},
    {"title": "Crecimiento mutuo", "description": "Trabajamos con un compromiso real con el crecimiento conjunto."},
    {"title": "Generación de valor compartido", "description": "Buscamos que todos los participantes de la cadena encuentren valor en la relación."},
    {"title": "Empatía", "description": "Atención cercana que entiende las necesidades de cada negocio."}
  ]}'::jsonb,
  'PUBLISHED',
  null
),
(
  'value_proposition',
  'Nuestra promesa: seguridad, tranquilidad y confianza',
  'En Compañía Mundial de Comercio S.A.S. creemos que el éxito de una alianza no se mide únicamente en cifras, sino también en la solidez de las relaciones que construimos.

Trabajamos para que cada experiencia con nuestros clientes, proveedores y colaboradores esté respaldada por procesos responsables, atención cercana y un compromiso real con el crecimiento conjunto.',
  null,
  'PUBLISHED',
  null
),
(
  'about_promise',
  'Nuestra promesa: seguridad, tranquilidad y confianza',
  'En Compañía Mundial de Comercio S.A.S. creemos que el éxito de una alianza no se mide únicamente en cifras, sino también en la solidez de las relaciones que construimos.

Trabajamos para que cada experiencia con nuestros clientes, proveedores y colaboradores esté respaldada por procesos responsables, atención cercana y un compromiso real con el crecimiento conjunto.',
  null,
  'PUBLISHED',
  null
),
(
  'about_experience',
  'Experiencia que se convierte en respaldo',
  'Desde 2019 hemos fortalecido nuestro conocimiento en la producción y distribución de margarinas, mantequillas y aceites. Esta experiencia nos permite comprender las necesidades de nuestros clientes y responder con productos y procesos consistentes, ágiles y confiables.

No se trata únicamente de suministrar un producto, sino de aportar soluciones que faciliten el trabajo de panaderías, pastelerías y demás negocios que confían en nosotros.',
  null,
  'PUBLISHED',
  null
),
(
  'about_chain',
  'Confianza en toda la cadena de valor',
  'Entendemos que conectamos proveedores, aliados y clientes con un propósito común: obtener resultados confiables.

Por eso orientamos cada decisión desde la transparencia, la responsabilidad y el cumplimiento, procurando que todos los participantes de la cadena encuentren en nosotros un respaldo comercial sólido.',
  null,
  'PUBLISHED',
  null
),
(
  'about_ally',
  'Un aliado en quien puedes delegar',
  'Elegir a Compañía Mundial de Comercio significa contar con un equipo que comprende tus necesidades y trabaja para ayudarte a alcanzar tus objetivos.

Queremos que nuestros clientes puedan concentrarse en hacer crecer sus negocios, con la tranquilidad de tener un aliado comprometido con la calidad, el servicio y la construcción de relaciones duraderas.',
  null,
  'PUBLISHED',
  null
),
(
  'iso_certification',
  'Certificación ISO 22000',
  'Contamos con la certificación internacional ISO 22000, que avala nuestros procesos bajo los más altos estándares de seguridad alimentaria.',
  null,
  'DRAFT',
  'EN REVISIÓN: no publicar hasta recibir evidencia del certificado ISO 22000 (número y alcance). Ver docs/CONTENT_PENDING.md.'
)
on conflict (section_key) do nothing;

-- ------------------------------------------------------------
-- Categorías de productos (derivadas de las fichas técnicas;
-- editables desde el CMS)
-- ------------------------------------------------------------
insert into public.product_categories (id, name, slug, sort_order) values
('a1000000-0000-4000-8000-000000000001', 'Margarinas industriales', 'margarinas-industriales', 1),
('a1000000-0000-4000-8000-000000000002', 'Preparados grasos', 'preparados-grasos', 2),
('a1000000-0000-4000-8000-000000000003', 'Aceites', 'aceites', 3)
on conflict (slug) do nothing;

-- ------------------------------------------------------------
-- Imágenes de productos (activos oficiales importados del
-- material del cliente; proveedor STATIC, versionados en
-- public/images/products/). Dimensiones tomadas del manifiesto
-- del importador (scripts/assets-manifest.json).
-- ------------------------------------------------------------
insert into public.media_assets (id, storage_provider, storage_path, file_name, mime_type, size_bytes, width, height, alt_text) values
('e0000000-0000-4000-8000-000000000101', 'STATIC', '/images/products/dap-hojaldre/caja-dap-hojaldre.webp', 'caja-dap-hojaldre.webp', 'image/webp', 67876, 1200, 1200, 'Caja de Margarina DAP Hojaldre'),
('e0000000-0000-4000-8000-000000000102', 'STATIC', '/images/products/dap-hojaldre/dap-hojaldre-con-productos.webp', 'dap-hojaldre-con-productos.webp', 'image/webp', 52354, 1200, 1200, 'Margarina DAP Hojaldre con preparaciones de hojaldre'),
('e0000000-0000-4000-8000-000000000201', 'STATIC', '/images/products/dap-alta-reposteria-ponque/caja-dap-alta-reposteria-ponque.webp', 'caja-dap-alta-reposteria-ponque.webp', 'image/webp', 81612, 1200, 1200, 'Caja de Margarina DAP Alta Repostería Ponqué'),
('e0000000-0000-4000-8000-000000000202', 'STATIC', '/images/products/dap-alta-reposteria-ponque/fotos-dap-alta-reposteria.webp', 'fotos-dap-alta-reposteria.webp', 'image/webp', 57742, 1200, 1200, 'Margarina DAP Alta Repostería Ponqué con productos horneados'),
('e0000000-0000-4000-8000-000000000301', 'STATIC', '/images/products/dap-industrial/dap-industrial.webp', 'dap-industrial.webp', 'image/webp', 53004, 1200, 1200, 'Margarina DAP Industrial'),
('e0000000-0000-4000-8000-000000000302', 'STATIC', '/images/products/dap-industrial/dap-industrial-1.webp', 'dap-industrial-1.webp', 'image/webp', 39466, 1200, 1200, 'Presentación de Margarina DAP Industrial'),
('e0000000-0000-4000-8000-000000000401', 'STATIC', '/images/products/dap-multiproposito/dap-multiproposito-caja.webp', 'dap-multiproposito-caja.webp', 'image/webp', 79926, 1200, 1200, 'Caja de Margarina DAP Multipropósito'),
('e0000000-0000-4000-8000-000000000402', 'STATIC', '/images/products/dap-multiproposito/2.webp', '2.webp', 'image/webp', 47130, 1200, 1200, 'Margarina DAP Multipropósito'),
('e0000000-0000-4000-8000-000000000501', 'STATIC', '/images/products/dap-reposteria/dap-reposteria-caja.webp', 'dap-reposteria-caja.webp', 'image/webp', 74728, 1200, 1200, 'Caja de Margarina DAP Repostería'),
('e0000000-0000-4000-8000-000000000502', 'STATIC', '/images/products/dap-reposteria/dap-reposteria.webp', 'dap-reposteria.webp', 'image/webp', 35746, 1200, 1200, 'Margarina DAP Repostería'),
('e0000000-0000-4000-8000-000000000601', 'STATIC', '/images/products/dap-semi-hojaldrado/dap-semi-hojaldre-caja.webp', 'dap-semi-hojaldre-caja.webp', 'image/webp', 76780, 1200, 1200, 'Caja de Margarina DAP Semi Hojaldrados'),
('e0000000-0000-4000-8000-000000000602', 'STATIC', '/images/products/dap-semi-hojaldrado/dap-semi-hojaldre-con-productos.webp', 'dap-semi-hojaldre-con-productos.webp', 'image/webp', 48832, 1200, 1200, 'Margarina DAP Semi Hojaldrados con productos horneados'),
('e0000000-0000-4000-8000-000000000701', 'STATIC', '/images/products/dap-alinado/dap-alinados.webp', 'dap-alinados.webp', 'image/webp', 57858, 1200, 1200, 'DAP Aliñado, preparado graso para panificación'),
('e0000000-0000-4000-8000-000000000702', 'STATIC', '/images/products/dap-alinado/dap-alinados-1.webp', 'dap-alinados-1.webp', 'image/webp', 65602, 1200, 1200, 'Presentación de DAP Aliñado'),
('e0000000-0000-4000-8000-000000000801', 'STATIC', '/images/products/dap-preparado-graso/preparado-graso-caja.webp', 'preparado-graso-caja.webp', 'image/webp', 63360, 1200, 1200, 'Caja de DAP Preparado Graso'),
('e0000000-0000-4000-8000-000000000802', 'STATIC', '/images/products/dap-preparado-graso/preparado-graso-con-productos.webp', 'preparado-graso-con-productos.webp', 'image/webp', 37636, 1200, 1200, 'DAP Preparado Graso con panes'),
('e0000000-0000-4000-8000-000000000803', 'STATIC', '/images/products/dap-preparado-graso/preparado-graso-con-productos-2.webp', 'preparado-graso-con-productos-2.webp', 'image/webp', 81470, 1200, 1200, 'DAP Preparado Graso con productos de panadería'),
('e0000000-0000-4000-8000-000000000901', 'STATIC', '/images/products/dap-aceite-solido/dap-aceite-solido-caja.webp', 'dap-aceite-solido-caja.webp', 'image/webp', 67368, 1200, 1200, 'Caja de Aceite Sólido DAP'),
('e0000000-0000-4000-8000-000000000902', 'STATIC', '/images/products/dap-aceite-solido/dap-aceite-solido.webp', 'dap-aceite-solido.webp', 'image/webp', 53592, 1200, 1200, 'Aceite Sólido DAP')
on conflict (storage_path) do nothing;

-- ------------------------------------------------------------
-- Productos: 9 reales (datos de fichas técnicas oficiales) +
-- 3 slots pendientes de definir. TODOS en DRAFT: el catálogo
-- público muestra "Catálogo en preparación" hasta que el cliente
-- apruebe y publique desde el CMS.
-- ------------------------------------------------------------
insert into public.products
  (id, name, slug, short_description, description, category_id, main_image_id, features, presentation, sort_order, status, seo_title, seo_description, internal_note)
values
(
  'd0000000-0000-4000-8000-000000000001',
  'Margarina DAP Hojaldre',
  'dap-hojaldre',
  'Margarina industrial con excelente plasticidad y resistencia al trabajo mecánico, especial para hojaldres.',
  'Margarina industrial fabricada a partir de una mezcla refinada de grasas y aceites vegetales comestibles, con excelente plasticidad y resistencia al trabajo mecánico, que permite lograr la formación de láminas uniformes y de gran volumen. Estas láminas proporcionan al producto final una textura crujiente y a la vez suave, con agradable aroma y sabor.',
  'a1000000-0000-4000-8000-000000000001',
  'e0000000-0000-4000-8000-000000000101',
  '[
    {"label": "Uso previsto", "value": "Materia prima en panaderías, reposterías e industrias de panificación. Indicada para hojaldres, croissants, pan danés y todo tipo de masa hojaldrada."},
    {"label": "Atemperado recomendado", "value": "Clima frío: 18 °C – 22 °C. Clima cálido: 22 °C – 25 °C."},
    {"label": "Color, olor y sabor", "value": "Amarillo crema, característicos a mantequilla."},
    {"label": "Vida útil", "value": "Seis (6) meses en su empaque cerrado, conservando las condiciones de almacenamiento recomendadas."},
    {"label": "Almacenamiento", "value": "Lugar fresco, seco y libre de olores contaminantes. Máximo 25 °C (tipo blanda) o 35 °C (tipo dura). Evitar la luz solar directa."},
    {"label": "Alérgenos", "value": "Contiene lecitina de soya."}
  ]'::jsonb,
  'Bloques de 500 g envueltos en papel antigraso, en caja de cartón corrugado de 10 kg (peso neto).',
  1,
  'DRAFT',
  'Margarina DAP Hojaldre',
  'Margarina industrial especial para hojaldres, croissants y masas hojaldradas, con excelente plasticidad y textura crujiente.',
  'Datos tomados de la ficha técnica oficial. Pendiente aprobación del cliente para publicar.'
),
(
  'd0000000-0000-4000-8000-000000000002',
  'Margarina DAP Alta Repostería Ponqué',
  'dap-alta-reposteria-ponque',
  'Margarina especial de consistencia cremosa que aporta gran volumen, rendimiento y una miga fina y homogénea.',
  'Margarina industrial fabricada a partir de una mezcla refinada de grasas y aceites vegetales comestibles. Es una margarina especial de consistencia cremosa y fácil incorporación a los ingredientes de la masa, a la cual proporciona gran volumen y rendimiento, una estructura de miga fina y homogénea, prolongado tiempo de vida útil y un delicioso sabor y aroma en el producto horneado.',
  'a1000000-0000-4000-8000-000000000001',
  'e0000000-0000-4000-8000-000000000201',
  '[
    {"label": "Uso previsto", "value": "Materia prima en panaderías, reposterías e industrias de panificación."},
    {"label": "Color, olor y sabor", "value": "Amarillo crema, característicos a mantequilla."},
    {"label": "Vida útil", "value": "Seis (6) meses en su empaque cerrado, conservando las condiciones de almacenamiento recomendadas."},
    {"label": "Almacenamiento", "value": "Lugar fresco, seco y libre de olores contaminantes. Máximo 25 °C (tipo blanda), 32 °C (tipo dura) o 38 °C (tipo dura costa). Evitar la luz solar directa."},
    {"label": "Alérgenos", "value": "Contiene lecitina de soya."}
  ]'::jsonb,
  'Bloques de 15 kg (peso neto) en caja de cartón corrugado.',
  2,
  'DRAFT',
  'Margarina DAP Alta Repostería Ponqué',
  'Margarina industrial de consistencia cremosa para repostería: gran volumen, rendimiento y miga fina y homogénea.',
  'Datos tomados de la ficha técnica oficial. La ficha presenta una inconsistencia en "Uso previsto" (menciona masas hojaldradas en un producto de repostería): confirmar con el cliente antes de publicar.'
),
(
  'd0000000-0000-4000-8000-000000000003',
  'Margarina DAP Industrial',
  'dap-industrial',
  'Margarina de consistencia suave y fácil incorporación, para todo tipo de pan, ponqué, tortas y galletería.',
  'Margarina industrial fabricada a partir de una mezcla refinada de grasas y aceites vegetales comestibles, de consistencia suave y fácil incorporación con los demás ingredientes. Proporciona gran volumen y rendimiento, y una estructura de miga fina y homogénea, contribuyendo al sabor, el aroma y la conservación.',
  'a1000000-0000-4000-8000-000000000001',
  'e0000000-0000-4000-8000-000000000301',
  '[
    {"label": "Uso previsto", "value": "Materia prima en panaderías, reposterías e industrias de panificación. Especial para todo tipo de pan, ponqué, tortas y galletería."},
    {"label": "Atemperado recomendado", "value": "Clima frío: 18 °C – 22 °C. Clima cálido: 22 °C – 25 °C. Clima costa: 26 °C – 32 °C."},
    {"label": "Color, olor y sabor", "value": "Amarillo crema, característicos a mantequilla."},
    {"label": "Vida útil", "value": "Seis (6) meses en su empaque cerrado, conservando las condiciones de almacenamiento recomendadas."},
    {"label": "Almacenamiento", "value": "Lugar fresco, seco y libre de olores contaminantes. Máximo 25 °C (tipo blanda), 32 °C (tipo dura) o 38 °C (tipo dura costa). Evitar la luz solar directa."},
    {"label": "Alérgenos", "value": "Contiene lecitina de soya."}
  ]'::jsonb,
  'Bloques de 15 kg (peso neto) en caja de cartón corrugado.',
  3,
  'DRAFT',
  'Margarina DAP Industrial',
  'Margarina industrial versátil para pan, ponqué, tortas y galletería, con miga fina y homogénea.',
  'Datos tomados de la ficha técnica oficial. Pendiente aprobación del cliente para publicar.'
),
(
  'd0000000-0000-4000-8000-000000000004',
  'Margarina DAP Multipropósito',
  'dap-multiproposito',
  'Margarina de alto rendimiento para ponqués, tortas, galletería industrial y panes aliñados.',
  'Margarina industrial fabricada a partir de una mezcla refinada de grasas y aceites vegetales comestibles. Es una margarina de alto rendimiento, diseñada para lograr una rápida y homogénea incorporación de los ingredientes de la masa, con insuperable sabor y aroma, y un prolongado tiempo de vida útil. Proporciona excelente volumen en batidos, con una estructura de miga fina y homogénea.',
  'a1000000-0000-4000-8000-000000000001',
  'e0000000-0000-4000-8000-000000000401',
  '[
    {"label": "Uso previsto", "value": "Materia prima en panaderías, reposterías e industrias de panificación. Especial para ponqué, torta y galletería industrial de alto rendimiento, y panes aliñados."},
    {"label": "Color, olor y sabor", "value": "Amarillo crema, característicos a mantequilla."},
    {"label": "Vida útil", "value": "Seis (6) meses en su empaque cerrado, conservando las condiciones de almacenamiento recomendadas."},
    {"label": "Almacenamiento", "value": "Lugar fresco, seco y libre de olores contaminantes. Máximo 25 °C (tipo blanda), 32 °C (tipo dura) o 38 °C (tipo dura costa). Evitar la luz solar directa."},
    {"label": "Alérgenos", "value": "Contiene lecitina de soya."}
  ]'::jsonb,
  'Bloques de 15 kg (peso neto) en caja de cartón corrugado.',
  4,
  'DRAFT',
  'Margarina DAP Multipropósito',
  'Margarina industrial de alto rendimiento para ponqués, tortas, galletería y panes aliñados.',
  'Datos tomados de la ficha técnica oficial. Pendiente aprobación del cliente para publicar.'
),
(
  'd0000000-0000-4000-8000-000000000005',
  'Margarina DAP Repostería',
  'dap-reposteria',
  'Margarina especial de consistencia cremosa para ponqués, tortas y galletería de alto rendimiento.',
  'Margarina fabricada a partir de una mezcla refinada de grasas y aceites vegetales comestibles. Es una margarina especial de consistencia cremosa y fácil incorporación a los ingredientes de la masa, a la cual proporciona gran volumen y rendimiento, una estructura de miga fina y homogénea, prolongado tiempo de vida útil y un delicioso sabor y aroma en el producto horneado.',
  'a1000000-0000-4000-8000-000000000001',
  'e0000000-0000-4000-8000-000000000501',
  '[
    {"label": "Uso previsto", "value": "Materia prima en panaderías, reposterías e industrias de panificación. Especial para ponqué, torta y galletería industrial de alto rendimiento, y panes aliñados. Proporciona excelente volumen en batidos."},
    {"label": "Color, olor y sabor", "value": "Amarillo crema, característicos a mantequilla."},
    {"label": "Vida útil", "value": "Seis (6) meses en su empaque cerrado, conservando las condiciones de almacenamiento recomendadas."},
    {"label": "Almacenamiento", "value": "Lugar fresco, seco y libre de olores contaminantes. Máximo 25 °C (tipo blanda), 32 °C (tipo dura) o 38 °C (tipo dura costa). Evitar la luz solar directa."},
    {"label": "Alérgenos", "value": "Contiene lecitina de soya."}
  ]'::jsonb,
  'Bloques de 15 kg (peso neto) en caja de cartón corrugado.',
  5,
  'DRAFT',
  'Margarina DAP Repostería',
  'Margarina especial de consistencia cremosa para repostería: volumen, rendimiento y miga fina.',
  'Datos tomados de la ficha técnica oficial. Pendiente aprobación del cliente para publicar.'
),
(
  'd0000000-0000-4000-8000-000000000006',
  'Margarina DAP Semi Hojaldrados',
  'dap-semi-hojaldrado',
  'Margarina especial que incorpora aire rápidamente en los cremados y logra alto volumen en el producto final.',
  'Margarina industrial fabricada a partir de una mezcla refinada de grasas y aceites vegetales comestibles. Es una margarina especial que proporciona una elevada y rápida incorporación de aire en la masa de los cremados, logra alto volumen en el producto final y una estructura de miga fina y homogénea, prolongando el tiempo de vida útil, con un delicioso sabor y aroma en el producto horneado.',
  'a1000000-0000-4000-8000-000000000001',
  'e0000000-0000-4000-8000-000000000601',
  '[
    {"label": "Uso previsto", "value": "Materia prima en panaderías, reposterías e industrias de panificación. Especial para ponqués, tortas, galletería esponjosa, bizcochería fina y panes especiales."},
    {"label": "Atemperado recomendado", "value": "Clima frío (TB): 18 °C – 22 °C. Clima cálido (TD): 22 °C – 25 °C. Clima costa (TDC): 26 °C – 32 °C."},
    {"label": "Color, olor y sabor", "value": "Amarillo crema, característicos a mantequilla."},
    {"label": "Vida útil", "value": "Seis (6) meses en su empaque cerrado, conservando las condiciones de almacenamiento recomendadas."},
    {"label": "Almacenamiento", "value": "Lugar fresco, seco y libre de olores contaminantes. Máximo 25 °C (tipo blanda), 32 °C (tipo dura) o 38 °C (tipo dura costa). Evitar la luz solar directa."},
    {"label": "Alérgenos", "value": "Contiene lecitina de soya."}
  ]'::jsonb,
  'Bloques de 15 kg (peso neto) en caja de cartón corrugado.',
  6,
  'DRAFT',
  'Margarina DAP Semi Hojaldrados',
  'Margarina especial para cremados: alto volumen, miga fina y homogénea, ideal para bizcochería fina.',
  'Datos tomados de la ficha técnica oficial. Pendiente aprobación del cliente para publicar.'
),
(
  'd0000000-0000-4000-8000-000000000007',
  'DAP Aliñado',
  'dap-alinado',
  'Preparado graso de suave textura plástica y rápida incorporación, para todo tipo de pan.',
  'Emulsión grasa fabricada a partir de una mezcla refinada de grasas y aceites vegetales comestibles. Es un preparado graso de suave textura plástica, de fácil manejo y rápida incorporación en la mezcla de la masa, con el que se obtiene un pan de buen volumen y suavidad, prolongando su tiempo de vida útil.',
  'a1000000-0000-4000-8000-000000000002',
  'e0000000-0000-4000-8000-000000000701',
  '[
    {"label": "Uso previsto", "value": "Materia prima en panaderías, reposterías e industrias de panificación. Indicado para todo tipo de pan: pan empacado, pan de molde, pan francés, tostadas, entre otros."},
    {"label": "Color, olor y sabor", "value": "Amarillo crema, característicos a mantequilla."},
    {"label": "Vida útil", "value": "Seis (6) meses en su empaque cerrado, conservando las condiciones de almacenamiento recomendadas."},
    {"label": "Almacenamiento", "value": "Lugar fresco, seco y libre de olores contaminantes, a temperatura ambiente no mayor a 38 °C. Evitar la luz solar directa."},
    {"label": "Alérgenos", "value": "Elaborado en líneas donde se procesan productos que contienen lecitina de soya."}
  ]'::jsonb,
  'Bloques de 15 kg (peso neto) en caja de cartón corrugado.',
  7,
  'DRAFT',
  'DAP Aliñado',
  'Preparado graso de textura suave y fácil incorporación para todo tipo de pan.',
  'Datos tomados de la ficha técnica oficial. Pendiente aprobación del cliente para publicar.'
),
(
  'd0000000-0000-4000-8000-000000000008',
  'DAP Preparado Graso',
  'dap-preparado-graso',
  'Preparado graso de fácil manejo que aporta volumen, suavidad y mayor vida útil al pan.',
  'Emulsión grasa fabricada a partir de una mezcla refinada de grasas y aceites vegetales comestibles. Es un preparado graso de suave textura plástica, de fácil manejo y rápida incorporación en la mezcla de la masa, con el que se obtiene un pan de buen volumen y suavidad, prolongando su tiempo de vida útil.',
  'a1000000-0000-4000-8000-000000000002',
  'e0000000-0000-4000-8000-000000000801',
  '[
    {"label": "Uso previsto", "value": "Materia prima en panaderías, reposterías e industrias de panificación, para la elaboración de todo tipo de pan: pan empacado, pan de molde, pan francés, tostadas, entre otros."},
    {"label": "Color, olor y sabor", "value": "Amarillo crema, característicos a mantequilla."},
    {"label": "Vida útil", "value": "Seis (6) meses en su empaque cerrado, conservando las condiciones de almacenamiento recomendadas."},
    {"label": "Almacenamiento", "value": "Lugar fresco, seco y libre de olores contaminantes, a temperatura ambiente no mayor a 38 °C. Evitar la luz solar directa."},
    {"label": "Alérgenos", "value": "Puede contener trazas de lecitina de soya."}
  ]'::jsonb,
  'Bloques de 15 kg (peso neto) en caja de cartón corrugado.',
  8,
  'DRAFT',
  'DAP Preparado Graso',
  'Preparado graso para panificación: volumen, suavidad y mayor vida útil en todo tipo de pan.',
  'Datos tomados de la ficha técnica oficial. Pendiente aprobación del cliente para publicar.'
),
(
  'd0000000-0000-4000-8000-000000000009',
  'Aceite Sólido DAP',
  'dap-aceite-solido',
  'Mezcla de grasas y aceites vegetales de consistencia plástica, ideal para fritura institucional e industrial.',
  'Mezcla de grasas y aceites vegetales comestibles de consistencia plástica, color crema y olor y sabor neutros. Ideal para fritura institucional e industrial, y para la preparación de bases para helados y rellenos de galletería y confitería.',
  'a1000000-0000-4000-8000-000000000003',
  'e0000000-0000-4000-8000-000000000901',
  '[
    {"label": "Uso previsto", "value": "Fritura institucional e industrial. Preparación de bases para helados y rellenos de galletería y confitería."},
    {"label": "Color, olor y sabor", "value": "Color crema; olor y sabor neutros."},
    {"label": "Vida útil", "value": "Doce (12) meses en su empaque cerrado, conservando las condiciones de almacenamiento recomendadas."},
    {"label": "Almacenamiento", "value": "Lugar fresco, seco y libre de olores contaminantes, a temperatura ambiente no mayor a 38 °C. Evitar la luz solar directa."},
    {"label": "Alérgenos", "value": "Puede contener trazas de lecitina de soya."}
  ]'::jsonb,
  'Bloques de 10 y 15 kg (peso neto) en caja de cartón corrugado.',
  9,
  'DRAFT',
  'Aceite Sólido DAP',
  'Aceite sólido de consistencia plástica para fritura institucional e industrial, bases de helados y rellenos.',
  'Datos tomados de la ficha técnica oficial. Pendiente aprobación del cliente para publicar.'
),
(
  'd0000000-0000-4000-8000-000000000010',
  'Producto pendiente de definir (1)',
  'producto-pendiente-1',
  null, null, null, null, '[]'::jsonb, null, 10, 'DRAFT', null, null,
  'CONTENIDO PENDIENTE: el contrato contempla 12 productos y el material entregado incluye 9. Completar con la información que envíe Ana (ver docs/CONTENT_PENDING.md).'
),
(
  'd0000000-0000-4000-8000-000000000011',
  'Producto pendiente de definir (2)',
  'producto-pendiente-2',
  null, null, null, null, '[]'::jsonb, null, 11, 'DRAFT', null, null,
  'CONTENIDO PENDIENTE: el contrato contempla 12 productos y el material entregado incluye 9. Completar con la información que envíe Ana (ver docs/CONTENT_PENDING.md).'
),
(
  'd0000000-0000-4000-8000-000000000012',
  'Producto pendiente de definir (3)',
  'producto-pendiente-3',
  null, null, null, null, '[]'::jsonb, null, 12, 'DRAFT', null, null,
  'CONTENIDO PENDIENTE: el contrato contempla 12 productos y el material entregado incluye 9. Completar con la información que envíe Ana (ver docs/CONTENT_PENDING.md).'
)
on conflict (slug) do nothing;

-- ------------------------------------------------------------
-- Galerías de producto (tabla normalizada product_media)
-- ------------------------------------------------------------
insert into public.product_media (product_id, media_asset_id, sort_order) values
('d0000000-0000-4000-8000-000000000001', 'e0000000-0000-4000-8000-000000000101', 1),
('d0000000-0000-4000-8000-000000000001', 'e0000000-0000-4000-8000-000000000102', 2),
('d0000000-0000-4000-8000-000000000002', 'e0000000-0000-4000-8000-000000000201', 1),
('d0000000-0000-4000-8000-000000000002', 'e0000000-0000-4000-8000-000000000202', 2),
('d0000000-0000-4000-8000-000000000003', 'e0000000-0000-4000-8000-000000000301', 1),
('d0000000-0000-4000-8000-000000000003', 'e0000000-0000-4000-8000-000000000302', 2),
('d0000000-0000-4000-8000-000000000004', 'e0000000-0000-4000-8000-000000000401', 1),
('d0000000-0000-4000-8000-000000000004', 'e0000000-0000-4000-8000-000000000402', 2),
('d0000000-0000-4000-8000-000000000005', 'e0000000-0000-4000-8000-000000000501', 1),
('d0000000-0000-4000-8000-000000000005', 'e0000000-0000-4000-8000-000000000502', 2),
('d0000000-0000-4000-8000-000000000006', 'e0000000-0000-4000-8000-000000000601', 1),
('d0000000-0000-4000-8000-000000000006', 'e0000000-0000-4000-8000-000000000602', 2),
('d0000000-0000-4000-8000-000000000007', 'e0000000-0000-4000-8000-000000000701', 1),
('d0000000-0000-4000-8000-000000000007', 'e0000000-0000-4000-8000-000000000702', 2),
('d0000000-0000-4000-8000-000000000008', 'e0000000-0000-4000-8000-000000000801', 1),
('d0000000-0000-4000-8000-000000000008', 'e0000000-0000-4000-8000-000000000802', 2),
('d0000000-0000-4000-8000-000000000008', 'e0000000-0000-4000-8000-000000000803', 3),
('d0000000-0000-4000-8000-000000000009', 'e0000000-0000-4000-8000-000000000901', 1),
('d0000000-0000-4000-8000-000000000009', 'e0000000-0000-4000-8000-000000000902', 2)
on conflict (product_id, media_asset_id) do nothing;

-- ------------------------------------------------------------
-- Preguntas frecuentes (5, extraídas del PDF oficial).
-- La n.º 2 queda en DRAFT: clasifica margarina y mantequilla
-- como "productos lácteos", afirmación en revisión.
-- ------------------------------------------------------------
insert into public.faqs (question, answer, sort_order, status, featured, internal_note) values
(
  '¿Todas nuestras margarinas proporcionan suavidad en los productos de panadería?',
  'Sí. Nuestras margarinas están fabricadas con las mejores materias primas para proporcionar una suavidad extraordinaria en todas las preparaciones, convirtiéndose en tu mejor aliada para la panadería.',
  1, 'PUBLISHED', true, null
),
(
  '¿Cuál es la diferencia entre mantequilla y margarina?',
  'La margarina y la mantequilla son productos lácteos con un alto contenido de grasa, pero su diferencia radica en los ingredientes que se utilizan para su fabricación.

La margarina es un producto fabricado a partir de aceites vegetales, grasas animales o una mezcla de ambos.

La mantequilla es una grasa sólida que se obtiene de la nata líquida que se separa de la leche, y está compuesta de ácidos grasos, agua, sales minerales y proteínas.',
  2, 'DRAFT', false,
  'EN REVISIÓN: la afirmación de que margarina y mantequilla son "productos lácteos" es técnicamente cuestionable (la margarina es de origen vegetal). No publicar hasta validar la redacción con el cliente. Ver docs/CONTENT_PENDING.md.'
),
(
  '¿Tienen margarinas especiales para los diferentes productos de panadería?',
  'Sí. Dentro de nuestro portafolio de productos manejamos margarinas industriales que abarcan opciones con diferentes contenidos grasos, ideales para cada uno de los procesos de la panificación, como hojaldres, ponqués, galletas y panes.',
  3, 'PUBLISHED', true, null
),
(
  '¿Cómo se debe almacenar correctamente la margarina?',
  'Para garantizar una duración óptima y la estabilidad necesaria para las preparaciones se debe:

- Mantener el producto en un lugar fresco y seco.
- Protegerlo de la contaminación cruzada con productos que tengan olores fuertes o penetrantes.
- Evitar que el producto esté expuesto directamente al calor o a la humedad.
- Cerrar el empaque de manera correcta cada vez que se destape.',
  4, 'PUBLISHED', true, null
),
(
  '¿Qué hace especial a nuestro hojaldre?',
  'Nuestro hojaldre se diferencia por su plasticidad y la facilidad que ofrece en el proceso de laminado. Además, ofrece un aroma y un sabor que lo hacen resaltar en las diferentes preparaciones de panadería.',
  5, 'PUBLISHED', false, null
)
on conflict do nothing;

-- ------------------------------------------------------------
-- Artículos del blog (4, extraídos del PDF oficial, con
-- corrección ortográfica). TODOS en DRAFT (borradores editables)
-- según el alcance acordado.
-- ------------------------------------------------------------
insert into public.blog_posts (id, title, slug, excerpt, body, status, seo_title, seo_description, internal_note) values
(
  'f0000000-0000-4000-8000-000000000001',
  'Amasijos colombianos: tradición que trasciende generaciones',
  'amasijos-colombianos-tradicion-que-trasciende-generaciones',
  'Almojábanas, pan de yuca, pandebono y bizcocho de achira: un recorrido por los amasijos más emblemáticos de Colombia.',
  'En cada lugar del mundo existen platos típicos y joyas culinarias que trascienden de generación en generación, y Colombia no es la excepción.

Los amasijos ocupan un lugar especial en el corazón de cada colombiano y, por ese motivo, durante generaciones se han mantenido como tradición en nuestros hogares. Su origen proviene de nuestras raíces indígenas y de la mezcla culinaria que se generó con la llegada de los españoles.

Cada rincón de Colombia tiene sus amasijos típicos y hoy queremos hablarte de los cuatro más emblemáticos.

## Almojábanas

Su nombre proviene de la palabra árabe «al-muyabbana», que significa «la que lleva queso». Su origen combina la cocina árabe y la española, por lo que se cree que llegó al país a través de los españoles, quienes les enseñaron la receta a los aborígenes; poco a poco se fue convirtiendo en un amasijo tradicional.

Se prepara a base de ingredientes como cuajada, harina de maíz, huevos, mantequilla, leche, sal y azúcar.

## Pan de yuca

Su origen viene desde antes de la colonización, ya que los pueblos indígenas de La Gran Colombia (lo que hoy es Colombia y Venezuela) procesaban la yuca y obtenían el almidón para hacer diferentes preparaciones.

La receta se realiza con almidón de yuca, queso blanco rallado, leche o agua, huevos, mantequilla, polvo para hornear, sal y azúcar al gusto.

## Pandebono

La historia cuenta que nació en una hacienda llamada «El Bono». En aquella época se vendía entre los campesinos, que lo llamaban «el pan de la hacienda Bono», pero poco a poco se fue popularizando y abreviando hasta llegar a su nombre actual y convertirse en el amasijo por excelencia del departamento del Valle del Cauca.

El pandebono se elabora a partir de ingredientes como almidón de yuca, harina de maíz, queso, huevos y leche.

## Bizcocho de achira

Es un amasijo con siglos de historia que proviene del departamento del Huila. Al ser crujiente y tan sabroso, poco a poco fue conquistando el corazón de los colombianos.

Su preparación se realiza con harina de achira, queso, huevo, mantequilla y sal.

Sin duda alguna, los amasijos son joyas de la comida colombiana que, con su sabor, aroma, forma y textura, han conquistado el corazón de cada colombiano. Por eso, en Compañía Mundial de Comercio te ofrecemos los mejores productos para sus preparaciones.',
  'DRAFT',
  'Amasijos colombianos: tradición que trasciende generaciones',
  'Almojábanas, pan de yuca, pandebono y bizcocho de achira: historia e ingredientes de los amasijos más queridos de Colombia.',
  'Borrador extraído del PDF oficial con corrección ortográfica. Pendiente aprobación del cliente para publicar.'
),
(
  'f0000000-0000-4000-8000-000000000002',
  'Los beneficios de comer pan: ¿mito o realidad?',
  'los-beneficios-de-comer-pan-mito-o-realidad',
  '¿Engorda? ¿Es dañino? Repasamos los beneficios reales del pan cuando se consume en las cantidades adecuadas.',
  'El pan es uno de los alimentos más consumidos del mundo y por eso forma parte de la dieta diaria de millones de personas: desde comida principal en el desayuno hasta acompañamiento en almuerzos y cenas. Algunas personas limitan su consumo por miedo a engordar o a ver afectada su salud, pero, en realidad, si lo incluyes en tu dieta en las cantidades adecuadas, puede tener múltiples beneficios, como:

- **Aporta energía:** al ser un carbohidrato complejo, consumirlo en las mañanas ayuda a mantener buenos niveles de energía en el transcurso del día.
- **Ayuda a evitar el estreñimiento por su contenido de fibra:** los panes integrales contribuyen a mejorar la salud intestinal y favorecen la digestión.
- **Genera sensación de saciedad:** por lo cual ayuda a controlar el apetito y evitar picoteos entre comidas.
- **Contiene vitaminas y minerales:** aporta vitaminas hidrosolubles del grupo B, hidratos de carbono, calcio, magnesio y proteínas.

A pesar de sus beneficios, durante años ha sido criticado porque algunos tipos de pan pueden incrementar la glicemia y, al comerse en exceso, pueden aportar muchas calorías. Sin embargo, en las cantidades adecuadas, el pan no es dañino para la salud: según la Organización Mundial de la Salud (OMS), el consumo de 250 gramos de pan al día es beneficioso, ya que aporta fibra e hidratos de carbono. Es muy recomendable consumirlo en compañía de proteínas o grasas saludables.',
  'DRAFT',
  'Los beneficios de comer pan: ¿mito o realidad?',
  'Beneficios reales del pan consumido en cantidades adecuadas: energía, fibra, saciedad, vitaminas y minerales.',
  'EN REVISIÓN: la atribución a la OMS de la recomendación de 250 g de pan al día no tiene fuente verificable. No publicar hasta validar o reformular esa frase. Ver docs/CONTENT_PENDING.md.'
),
(
  'f0000000-0000-4000-8000-000000000003',
  'El arte de hacer hojaldre',
  'el-arte-de-hacer-hojaldre',
  'Cuatro consejos vitales para lograr un hojaldre crujiente, fino y con capas perfectas.',
  'Hacer un hojaldre perfecto, que sea crujiente y se deshaga en la boca conquistando el paladar de cada cliente, es un arte. Por eso hoy te traemos cuatro consejos vitales para que tu hojaldre destaque.

## 1. Utiliza una margarina especial

La margarina es el ingrediente esencial que le dará la plasticidad, la resistencia, el olor y el sabor a la masa, por lo cual es muy importante elegir una de buena calidad.

En Compañía Mundial de Comercio comprendemos la importancia de este ingrediente, por lo cual fabricamos nuestra margarina DAP Hojaldre, especial para que tu hojaldre quede con la textura, la calidad y, sobre todo, el sabor premium que tus preparaciones necesitan.

## 2. La paciencia es clave en la preparación

No te apresures: cada fase del proceso de hacer hojaldre es importante, por lo cual cada minuto que emplees es fundamental para que tu masa desarrolle la estructura perfecta.

## 3. Utiliza ingredientes fríos

El uso de agua y mantequilla frías ayudará a que tu hojaldre suba adecuadamente, influyendo directamente en el resultado final de tu masa.

## 4. El pliegue del hojaldre

Asegúrate de que la masa no se pegue a la superficie al momento de hacer los pliegues. Estos se deben hacer como si estuvieras cerrando un libro y debes repetirlos al menos cuatro veces; esto hará que tu masa se haga más fina, desarrolle capas y su textura final sea la deseada.

Si este artículo te fue de utilidad, comparte el enlace con otra persona tan apasionada como tú por el hojaldre.',
  'DRAFT',
  'El arte de hacer hojaldre',
  'Cuatro consejos para un hojaldre perfecto: margarina especial, paciencia, ingredientes fríos y pliegues correctos.',
  'Borrador extraído del PDF oficial con corrección ortográfica. Pendiente aprobación del cliente para publicar.'
),
(
  'f0000000-0000-4000-8000-000000000004',
  'Consejos para almacenar adecuadamente las materias primas en panadería',
  'consejos-para-almacenar-materias-primas-en-panaderia',
  'Pautas de almacenamiento que protegen la calidad de tus ingredientes y la seguridad de tu negocio.',
  'El almacenamiento de los ingredientes en el mundo de la panadería y la pastelería es esencial, ya que genera un impacto importante en los resultados finales de cada uno de los productos que se hornean. Por eso, hoy te queremos dar algunas pautas que debes seguir para almacenar tu materia prima.

1. **Elige un espacio especial para el almacenamiento**, procurando que esté alejado de fuentes de calor, humedad y luz solar. Debes elegir, preferiblemente, un espacio fresco y seco, separado de la zona de preparación y horneado.

2. **Asegúrate de que la manipulación de los alimentos se haga de manera adecuada.** Tanto en la zona de preparación como en la de almacenamiento se deben seguir las prácticas de higiene necesarias, como el lavado de manos o el uso de guantes.

3. **Rota el inventario regularmente**, manteniendo un registro de la fecha en la que recibiste cada producto para utilizar siempre los ingredientes más antiguos. De esta manera minimizas el riesgo de que un ingrediente permanezca mucho tiempo almacenado y se utilice estando vencido.

4. **Realiza constantemente actividades de control de plagas**, como colocar trampas y hacer revisiones periódicas, evitando así la proliferación de insectos o roedores en las áreas de almacenamiento.

Almacenar adecuadamente la materia prima en una panadería o pastelería garantiza la calidad de los productos horneados y mantiene la seguridad e higiene alimentarias exigidas para cada negocio. Cumplir con estas normas es esencial para mantener estándares altos en tu negocio.',
  'DRAFT',
  'Consejos para almacenar adecuadamente las materias primas en panadería',
  'Cuatro pautas de almacenamiento para proteger la calidad y la seguridad alimentaria en panaderías y pastelerías.',
  'Borrador extraído del PDF oficial con corrección ortográfica. Pendiente aprobación del cliente para publicar.'
)
on conflict (slug) do nothing;
