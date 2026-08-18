-- ============================================================
-- Normalización del catálogo — 2026-08-17
--
-- Aplica a una base YA poblada con el seed anterior los mismos
-- cambios que el seed nuevo (el seed usa "on conflict do nothing"
-- y no toca filas existentes):
--   1. Rutas/nombres nuevos de las 19 imágenes STATIC de producto.
--   2. Registro de las 9 fichas técnicas PDF (STATIC).
--   3. Galería 0-based (caja = 0).
--   4. products.technical_sheet_media_id de los 9 productos DAP.
--   5. Corrección de contenido verificada contra la ficha:
--      alérgenos de DAP Aliñado ("se procesan y empacan").
--   6. Los 3 productos placeholder ("Producto pendiente de definir")
--      vuelven a DRAFT: se detectó (2026-08-17) que estaban PUBLISHED
--      y aparecían en el catálogo público.
--
-- REQUISITOS: haber aplicado antes la migración
-- supabase/migrations/0004_technical_sheet_gallery.sql.
--
-- Ejecutar completo en el SQL Editor de Supabase. Es idempotente:
-- correrlo dos veces no cambia nada. Si el estado inicial no es el
-- esperado, aborta sin modificar datos.
-- ============================================================

begin;

-- ------------------------------------------------------------
-- 0) Verificaciones previas
-- ------------------------------------------------------------
do $$
declare n bigint;
begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'products'
      and column_name = 'technical_sheet_media_id'
  ) then
    raise exception 'Falta la migración 0004 (technical_sheet_media_id). Aplícala primero.';
  end if;

  select count(*) into n from public.products;
  if n <> 12 then
    raise exception 'Estado inesperado: % productos (se esperaban 12). Revisa antes de continuar.', n;
  end if;

  select count(*) into n
  from public.media_assets
  where storage_provider = 'STATIC' and storage_path like '/images/products/%' and mime_type = 'image/webp';
  if n <> 19 then
    raise exception 'Estado inesperado: % imágenes STATIC de producto (se esperaban 19).', n;
  end if;
end $$;

-- ------------------------------------------------------------
-- 1) Rutas y nombres nuevos de las 19 imágenes (UUIDs del seed)
-- ------------------------------------------------------------
update public.media_assets set storage_path = '/images/products/dap-hojaldre/dap-hojaldre-caja.webp', file_name = 'dap-hojaldre-caja.webp', size_bytes = 67876, width = 1200, height = 1200, alt_text = 'Caja de Margarina DAP Hojaldre' where id = 'e0000000-0000-4000-8000-000000000101';
update public.media_assets set storage_path = '/images/products/dap-hojaldre/dap-hojaldre-aplicacion-01.webp', file_name = 'dap-hojaldre-aplicacion-01.webp', size_bytes = 52354, width = 1200, height = 1200, alt_text = 'Margarina DAP Hojaldre con preparaciones de hojaldre' where id = 'e0000000-0000-4000-8000-000000000102';
update public.media_assets set storage_path = '/images/products/dap-alta-reposteria-ponque/dap-alta-reposteria-ponque-caja.webp', file_name = 'dap-alta-reposteria-ponque-caja.webp', size_bytes = 81612, width = 1200, height = 1200, alt_text = 'Caja de Margarina DAP Alta Repostería Ponqué' where id = 'e0000000-0000-4000-8000-000000000201';
update public.media_assets set storage_path = '/images/products/dap-alta-reposteria-ponque/dap-alta-reposteria-ponque-aplicacion-01.webp', file_name = 'dap-alta-reposteria-ponque-aplicacion-01.webp', size_bytes = 57742, width = 1200, height = 1200, alt_text = 'Margarina DAP Alta Repostería Ponqué con productos horneados' where id = 'e0000000-0000-4000-8000-000000000202';
update public.media_assets set storage_path = '/images/products/dap-industrial/dap-industrial-caja.webp', file_name = 'dap-industrial-caja.webp', size_bytes = 53004, width = 1200, height = 1200, alt_text = 'Caja de Margarina DAP Industrial' where id = 'e0000000-0000-4000-8000-000000000301';
update public.media_assets set storage_path = '/images/products/dap-industrial/dap-industrial-aplicacion-01.webp', file_name = 'dap-industrial-aplicacion-01.webp', size_bytes = 39466, width = 1200, height = 1200, alt_text = 'Margarina DAP Industrial con panes y galletería' where id = 'e0000000-0000-4000-8000-000000000302';
update public.media_assets set storage_path = '/images/products/dap-multiproposito/dap-multiproposito-caja.webp', file_name = 'dap-multiproposito-caja.webp', size_bytes = 79926, width = 1200, height = 1200, alt_text = 'Caja de Margarina DAP Multipropósito' where id = 'e0000000-0000-4000-8000-000000000401';
update public.media_assets set storage_path = '/images/products/dap-multiproposito/dap-multiproposito-aplicacion-01.webp', file_name = 'dap-multiproposito-aplicacion-01.webp', size_bytes = 47130, width = 1200, height = 1200, alt_text = 'Margarina DAP Multipropósito con panes aliñados y amasijos' where id = 'e0000000-0000-4000-8000-000000000402';
update public.media_assets set storage_path = '/images/products/dap-reposteria/dap-reposteria-caja.webp', file_name = 'dap-reposteria-caja.webp', size_bytes = 74728, width = 1200, height = 1200, alt_text = 'Caja de Margarina DAP Repostería' where id = 'e0000000-0000-4000-8000-000000000501';
update public.media_assets set storage_path = '/images/products/dap-reposteria/dap-reposteria-aplicacion-01.webp', file_name = 'dap-reposteria-aplicacion-01.webp', size_bytes = 35746, width = 1200, height = 1200, alt_text = 'Margarina DAP Repostería con galletería y torta marmolada' where id = 'e0000000-0000-4000-8000-000000000502';
update public.media_assets set storage_path = '/images/products/dap-semi-hojaldrado/dap-semi-hojaldrado-caja.webp', file_name = 'dap-semi-hojaldrado-caja.webp', size_bytes = 76780, width = 1200, height = 1200, alt_text = 'Caja de Margarina DAP Semi Hojaldrados' where id = 'e0000000-0000-4000-8000-000000000601';
update public.media_assets set storage_path = '/images/products/dap-semi-hojaldrado/dap-semi-hojaldrado-aplicacion-01.webp', file_name = 'dap-semi-hojaldrado-aplicacion-01.webp', size_bytes = 48832, width = 1200, height = 1200, alt_text = 'Margarina DAP Semi Hojaldrados con productos horneados' where id = 'e0000000-0000-4000-8000-000000000602';
-- Nota: en el material anterior las fotos de DAP Aliñado estaban
-- intercambiadas (la "principal" era el bodegón). Con estas rutas el
-- asset …701 vuelve a ser la caja, que ya es main_image_id.
update public.media_assets set storage_path = '/images/products/dap-alinado/dap-alinado-caja.webp', file_name = 'dap-alinado-caja.webp', size_bytes = 65602, width = 1200, height = 1200, alt_text = 'Caja de DAP Aliñado' where id = 'e0000000-0000-4000-8000-000000000701';
update public.media_assets set storage_path = '/images/products/dap-alinado/dap-alinado-aplicacion-01.webp', file_name = 'dap-alinado-aplicacion-01.webp', size_bytes = 57858, width = 1200, height = 1200, alt_text = 'DAP Aliñado con canasta de panes' where id = 'e0000000-0000-4000-8000-000000000702';
update public.media_assets set storage_path = '/images/products/dap-preparado-graso/dap-preparado-graso-caja.webp', file_name = 'dap-preparado-graso-caja.webp', size_bytes = 63360, width = 1200, height = 1200, alt_text = 'Caja de DAP Preparado Graso' where id = 'e0000000-0000-4000-8000-000000000801';
update public.media_assets set storage_path = '/images/products/dap-preparado-graso/dap-preparado-graso-aplicacion-01.webp', file_name = 'dap-preparado-graso-aplicacion-01.webp', size_bytes = 37636, width = 1200, height = 1200, alt_text = 'DAP Preparado Graso con panes' where id = 'e0000000-0000-4000-8000-000000000802';
update public.media_assets set storage_path = '/images/products/dap-preparado-graso/dap-preparado-graso-aplicacion-02.webp', file_name = 'dap-preparado-graso-aplicacion-02.webp', size_bytes = 81470, width = 1200, height = 1200, alt_text = 'DAP Preparado Graso con productos de panadería' where id = 'e0000000-0000-4000-8000-000000000803';
update public.media_assets set storage_path = '/images/products/dap-aceite-solido/dap-aceite-solido-caja.webp', file_name = 'dap-aceite-solido-caja.webp', size_bytes = 67368, width = 1200, height = 1200, alt_text = 'Caja de Aceite Sólido DAP' where id = 'e0000000-0000-4000-8000-000000000901';
update public.media_assets set storage_path = '/images/products/dap-aceite-solido/dap-aceite-solido-aplicacion-01.webp', file_name = 'dap-aceite-solido-aplicacion-01.webp', size_bytes = 53592, width = 1200, height = 1200, alt_text = 'Aceite Sólido DAP con canasta de fritos' where id = 'e0000000-0000-4000-8000-000000000902';

-- ------------------------------------------------------------
-- 2) Fichas técnicas PDF (STATIC, id e0…0N90)
-- ------------------------------------------------------------
insert into public.media_assets (id, storage_provider, storage_path, file_name, mime_type, size_bytes, width, height, alt_text) values
('e0000000-0000-4000-8000-000000000190', 'STATIC', '/images/products/dap-hojaldre/ficha-tecnica-dap-hojaldre.pdf', 'ficha-tecnica-dap-hojaldre.pdf', 'application/pdf', 572631, null, null, 'Ficha técnica de Margarina DAP Hojaldre (PDF)'),
('e0000000-0000-4000-8000-000000000290', 'STATIC', '/images/products/dap-alta-reposteria-ponque/ficha-tecnica-dap-alta-reposteria-ponque.pdf', 'ficha-tecnica-dap-alta-reposteria-ponque.pdf', 'application/pdf', 1073793, null, null, 'Ficha técnica de Margarina DAP Alta Repostería Ponqué (PDF)'),
('e0000000-0000-4000-8000-000000000390', 'STATIC', '/images/products/dap-industrial/ficha-tecnica-dap-industrial.pdf', 'ficha-tecnica-dap-industrial.pdf', 'application/pdf', 554990, null, null, 'Ficha técnica de Margarina DAP Industrial (PDF)'),
('e0000000-0000-4000-8000-000000000490', 'STATIC', '/images/products/dap-multiproposito/ficha-tecnica-dap-multiproposito.pdf', 'ficha-tecnica-dap-multiproposito.pdf', 'application/pdf', 842577, null, null, 'Ficha técnica de Margarina DAP Multipropósito (PDF)'),
('e0000000-0000-4000-8000-000000000590', 'STATIC', '/images/products/dap-reposteria/ficha-tecnica-dap-reposteria.pdf', 'ficha-tecnica-dap-reposteria.pdf', 'application/pdf', 570408, null, null, 'Ficha técnica de Margarina DAP Repostería (PDF)'),
('e0000000-0000-4000-8000-000000000690', 'STATIC', '/images/products/dap-semi-hojaldrado/ficha-tecnica-dap-semi-hojaldrado.pdf', 'ficha-tecnica-dap-semi-hojaldrado.pdf', 'application/pdf', 497956, null, null, 'Ficha técnica de Margarina DAP Semi Hojaldrados (PDF)'),
('e0000000-0000-4000-8000-000000000790', 'STATIC', '/images/products/dap-alinado/ficha-tecnica-dap-alinado.pdf', 'ficha-tecnica-dap-alinado.pdf', 'application/pdf', 500805, null, null, 'Ficha técnica de DAP Aliñado (PDF)'),
('e0000000-0000-4000-8000-000000000890', 'STATIC', '/images/products/dap-preparado-graso/ficha-tecnica-dap-preparado-graso.pdf', 'ficha-tecnica-dap-preparado-graso.pdf', 'application/pdf', 445417, null, null, 'Ficha técnica de DAP Preparado Graso (PDF)'),
('e0000000-0000-4000-8000-000000000990', 'STATIC', '/images/products/dap-aceite-solido/ficha-tecnica-dap-aceite-solido.pdf', 'ficha-tecnica-dap-aceite-solido.pdf', 'application/pdf', 414223, null, null, 'Ficha técnica de Aceite Sólido DAP (PDF)')
on conflict (storage_path) do nothing;

-- ------------------------------------------------------------
-- 3) Galería 0-based (solo productos cuyo mínimo siga siendo > 0)
-- ------------------------------------------------------------
update public.product_media pm
set sort_order = pm.sort_order - 1
where pm.product_id in (
  select product_id from public.product_media
  group by product_id
  having min(sort_order) > 0
);

-- ------------------------------------------------------------
-- 4) Ficha técnica de cada producto (solo si aún no tiene)
-- ------------------------------------------------------------
update public.products set technical_sheet_media_id = 'e0000000-0000-4000-8000-000000000190' where id = 'd0000000-0000-4000-8000-000000000001' and technical_sheet_media_id is null;
update public.products set technical_sheet_media_id = 'e0000000-0000-4000-8000-000000000290' where id = 'd0000000-0000-4000-8000-000000000002' and technical_sheet_media_id is null;
update public.products set technical_sheet_media_id = 'e0000000-0000-4000-8000-000000000390' where id = 'd0000000-0000-4000-8000-000000000003' and technical_sheet_media_id is null;
update public.products set technical_sheet_media_id = 'e0000000-0000-4000-8000-000000000490' where id = 'd0000000-0000-4000-8000-000000000004' and technical_sheet_media_id is null;
update public.products set technical_sheet_media_id = 'e0000000-0000-4000-8000-000000000590' where id = 'd0000000-0000-4000-8000-000000000005' and technical_sheet_media_id is null;
update public.products set technical_sheet_media_id = 'e0000000-0000-4000-8000-000000000690' where id = 'd0000000-0000-4000-8000-000000000006' and technical_sheet_media_id is null;
update public.products set technical_sheet_media_id = 'e0000000-0000-4000-8000-000000000790' where id = 'd0000000-0000-4000-8000-000000000007' and technical_sheet_media_id is null;
update public.products set technical_sheet_media_id = 'e0000000-0000-4000-8000-000000000890' where id = 'd0000000-0000-4000-8000-000000000008' and technical_sheet_media_id is null;
update public.products set technical_sheet_media_id = 'e0000000-0000-4000-8000-000000000990' where id = 'd0000000-0000-4000-8000-000000000009' and technical_sheet_media_id is null;

-- ------------------------------------------------------------
-- 4b) La imagen principal debe ser la caja del empaque (regla de la
--     fase). Detectado en la BD dev: dap-reposteria tenía la foto de
--     aplicación (…0502) como principal; se restaura la caja (…0501).
-- ------------------------------------------------------------
update public.products
   set main_image_id = 'e0000000-0000-4000-8000-000000000501'
 where id = 'd0000000-0000-4000-8000-000000000005'
   and main_image_id is distinct from 'e0000000-0000-4000-8000-000000000501';

-- ------------------------------------------------------------
-- 5) Corrección de contenido verificada contra la ficha técnica:
--    DAP Aliñado — alérgenos ("se procesan y empacan").
-- ------------------------------------------------------------
update public.products
set features = jsonb_set(
      features,
      '{4,value}',
      '"Elaborado en líneas donde se procesan y empacan productos que contienen lecitina de soya."'
    )
where id = 'd0000000-0000-4000-8000-000000000007'
  and features -> 4 ->> 'label' = 'Alérgenos';

-- ------------------------------------------------------------
-- 6) Placeholders fuera del sitio público (siempre DRAFT)
-- ------------------------------------------------------------
update public.products
set status = 'DRAFT'
where slug in ('producto-pendiente-1', 'producto-pendiente-2', 'producto-pendiente-3')
  and status <> 'DRAFT';

-- ------------------------------------------------------------
-- 7) Verificación final
-- ------------------------------------------------------------
do $$
declare n bigint;
begin
  select count(*) into n
  from public.media_assets
  where storage_provider = 'STATIC' and storage_path like '/images/products/%';
  if n <> 28 then
    raise exception 'FALLO: % media_assets STATIC de producto (se esperaban 28: 19 imágenes + 9 fichas).', n;
  end if;

  select count(*) into n
  from public.products p
  join public.product_media pm
    on pm.product_id = p.id and pm.sort_order = 0 and pm.media_asset_id = p.main_image_id
  where p.slug in ('dap-hojaldre','dap-alta-reposteria-ponque','dap-industrial','dap-multiproposito',
                   'dap-reposteria','dap-semi-hojaldrado','dap-alinado','dap-preparado-graso','dap-aceite-solido');
  if n <> 9 then
    raise exception 'FALLO: solo % productos tienen la caja como principal en sort_order 0 (se esperaban 9).', n;
  end if;

  select count(*) into n from public.products where technical_sheet_media_id is not null;
  if n <> 9 then
    raise exception 'FALLO: % productos con ficha técnica (se esperaban 9).', n;
  end if;

  select count(*) into n from public.product_media where sort_order < 0;
  if n <> 0 then
    raise exception 'FALLO: hay sort_order negativos tras la renumeración.';
  end if;

  select count(*) into n from public.products
   where slug like 'producto-pendiente-%' and status <> 'DRAFT';
  if n <> 0 then
    raise exception 'FALLO: % placeholders siguen publicados.', n;
  end if;

  raise notice '=== NORMALIZACIÓN DEL CATÁLOGO APLICADA CORRECTAMENTE ===';
end $$;

commit;
