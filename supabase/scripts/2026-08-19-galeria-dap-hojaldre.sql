-- ============================================================
-- Ampliación de la galería de DAP Hojaldre con 3 fotos aprobadas
-- (lote fotos-adicionales, aprobación 2026-08-19).
--
-- Requiere: los WebP ya versionados en
--   public/images/products/dap-hojaldre/ (importados con
--   `npm run import-assets`; tamaños tomados de scripts/assets-manifest.json).
--
-- Ejecutar COMPLETO en el SQL Editor de Supabase. Idempotente:
-- re-ejecutarlo no duplica filas. No toca main_image_id (la caja
-- sigue siendo la portada del catálogo) ni el orden existente
-- (0 = caja, 1 = aplicación); las nuevas entran en 2, 3 y 4.
--
-- Sin UUID codificados: el producto se resuelve por slug y los
-- medios por storage_path.
-- ============================================================

begin;

-- Guarda: el estado debe ser el previo (2 filas) o el ya aplicado (5).
do $$
declare
  v_product_id uuid;
  v_count bigint;
begin
  select id into v_product_id from public.products where slug = 'dap-hojaldre';
  if v_product_id is null then
    raise exception 'No existe el producto con slug dap-hojaldre.';
  end if;

  select count(*) into v_count from public.product_media where product_id = v_product_id;
  if v_count not in (2, 5) then
    raise exception 'Estado inesperado: % filas en product_media de DAP Hojaldre (se esperaban 2 o 5).', v_count;
  end if;
end $$;

-- 1) Metadatos de los tres WebP (STATIC: la URL es la ruta bajo public/).
insert into public.media_assets
  (storage_provider, storage_path, file_name, mime_type, size_bytes, width, height, alt_text)
values
  ('STATIC', '/images/products/dap-hojaldre/dap-hojaldre-caja-bloques-01.webp',
   'dap-hojaldre-caja-bloques-01.webp', 'image/webp', 50070, 1200, 1200,
   'Caja de 10 kg de margarina DAP Hojaldre junto a bloques de 500 g'),
  ('STATIC', '/images/products/dap-hojaldre/dap-hojaldre-margarina-preparacion-01.webp',
   'dap-hojaldre-margarina-preparacion-01.webp', 'image/webp', 47576, 1200, 1200,
   'Bol con margarina DAP Hojaldre cremada junto a vaso medidor y bloques de 500 g'),
  ('STATIC', '/images/products/dap-hojaldre/dap-hojaldre-margarina-preparacion-02.webp',
   'dap-hojaldre-margarina-preparacion-02.webp', 'image/webp', 39712, 1200, 1200,
   'Margarina DAP Hojaldre en bloque y cremada en bol de acero')
on conflict (storage_path) do nothing;

-- 2) Vínculo a la galería: sort_order continúa sin huecos tras la
--    aplicación existente (0 = caja, 1 = aplicación → nuevas 2, 3, 4).
insert into public.product_media (product_id, media_asset_id, sort_order)
select p.id, m.id, v.sort_order
from (values
  ('/images/products/dap-hojaldre/dap-hojaldre-caja-bloques-01.webp', 2),
  ('/images/products/dap-hojaldre/dap-hojaldre-margarina-preparacion-01.webp', 3),
  ('/images/products/dap-hojaldre/dap-hojaldre-margarina-preparacion-02.webp', 4)
) as v(storage_path, sort_order)
join public.products p on p.slug = 'dap-hojaldre'
join public.media_assets m on m.storage_path = v.storage_path
on conflict do nothing;

-- Verificación final: 5 filas, sin huecos, portada intacta.
do $$
declare
  v_product_id uuid;
  v_count bigint;
  v_max integer;
  v_main_ok boolean;
begin
  select id into v_product_id from public.products where slug = 'dap-hojaldre';

  select count(*), max(sort_order) into v_count, v_max
  from public.product_media where product_id = v_product_id;
  if v_count <> 5 then
    raise exception 'FALLO: % filas en la galería (se esperaban 5).', v_count;
  end if;
  if v_max <> 4 then
    raise exception 'FALLO: huecos en sort_order (max = %, se esperaba 4).', v_max;
  end if;

  -- main_image_id debe seguir siendo la fila con sort_order = 0.
  select exists (
    select 1
    from public.products p
    join public.product_media pm
      on pm.product_id = p.id and pm.media_asset_id = p.main_image_id
    where p.id = v_product_id and pm.sort_order = 0
  ) into v_main_ok;
  if not v_main_ok then
    raise exception 'FALLO: main_image_id ya no coincide con sort_order = 0.';
  end if;

  raise notice '=== GALERÍA DAP HOJALDRE AMPLIADA (5 imágenes) ===';
end $$;

commit;

-- Tras ejecutar: el sitio SSG mostrará la galería ampliada en el próximo
-- build/revalidación (o al guardar el producto desde el admin).
