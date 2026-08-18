-- ============================================================
-- Migración 0004 — Fichas técnicas PDF y galería consistente
--
--   1. products.technical_sheet_media_id: una ficha técnica (PDF en
--      media_assets) por producto, espejo del patrón main_image_id.
--   2. Unicidad de orden en la galería: unique (product_id, sort_order)
--      DEFERRABLE para que los renumerados dentro de una función no
--      choquen entre sí.
--   3. Funciones de galería (security invoker: las escrituras internas
--      pasan por RLS, así que solo un administrador real puede
--      ejecutarlas con efecto):
--        * set_product_main_image  → imagen principal atómica
--          (main_image_id + sort_order 0) sin posibilidad de dos ceros.
--        * swap_product_media_order → reordenar imágenes secundarias.
--        * remove_product_media_entry → quitar de la galería,
--          renumerar y promover nueva principal si hace falta.
--
-- Invariante resultante: la imagen en sort_order = 0 es siempre la
-- imagen principal (products.main_image_id); las secundarias ocupan
-- 1..n sin huecos.
--
-- Verificación: supabase/tests/rls_checks.sql
-- ============================================================

-- ------------------------------------------------------------
-- 1) Ficha técnica del producto
-- ------------------------------------------------------------
alter table public.products
  add column technical_sheet_media_id uuid references public.media_assets (id) on delete set null;

create index products_technical_sheet_idx
  on public.products (technical_sheet_media_id)
  where technical_sheet_media_id is not null;

-- ------------------------------------------------------------
-- 2) Unicidad de orden por producto (deferred: los renumerados de las
--    funciones de abajo se validan al final de la transacción).
-- ------------------------------------------------------------
alter table public.product_media
  add constraint product_media_product_sort_unique
  unique (product_id, sort_order) deferrable initially deferred;

-- ------------------------------------------------------------
-- 3a) Imagen principal atómica.
--     Valida pertenencia a la galería, actualiza main_image_id y
--     renumera: elegida = 0, resto 1..n (orden previo preservado).
-- ------------------------------------------------------------
create or replace function public.set_product_main_image(
  p_product_id uuid,
  p_media_asset_id uuid
)
returns void
language plpgsql
volatile
set search_path = public, pg_temp
as $$
begin
  if not exists (
    select 1 from public.product_media
    where product_id = p_product_id and media_asset_id = p_media_asset_id
  ) then
    raise exception 'La imagen no pertenece a la galería del producto.';
  end if;

  update public.products
     set main_image_id = p_media_asset_id
   where id = p_product_id;
  if not found then
    raise exception 'No se pudo actualizar la imagen principal del producto.';
  end if;

  update public.product_media pm
     set sort_order = ranked.new_order
    from (
      select id,
             row_number() over (
               order by (media_asset_id <> p_media_asset_id), sort_order, created_at
             ) - 1 as new_order
        from public.product_media
       where product_id = p_product_id
    ) ranked
   where pm.id = ranked.id
     and pm.sort_order <> ranked.new_order;
end;
$$;

-- ------------------------------------------------------------
-- 3b) Subir/bajar una imagen secundaria (posiciones >= 1).
--     La posición 0 solo cambia vía set_product_main_image.
--     No-op silencioso si no hay vecino o si es la principal.
-- ------------------------------------------------------------
create or replace function public.swap_product_media_order(
  p_product_id uuid,
  p_media_asset_id uuid,
  p_direction text
)
returns void
language plpgsql
volatile
set search_path = public, pg_temp
as $$
declare
  v_current integer;
  v_neighbor_id uuid;
  v_neighbor_order integer;
begin
  if p_direction not in ('up', 'down') then
    raise exception 'Dirección inválida: use up o down.';
  end if;

  select sort_order into v_current
    from public.product_media
   where product_id = p_product_id and media_asset_id = p_media_asset_id;
  if v_current is null then
    raise exception 'La imagen no pertenece a la galería del producto.';
  end if;
  if v_current < 1 then
    return; -- la principal no se mueve desde aquí
  end if;

  if p_direction = 'up' then
    select media_asset_id, sort_order into v_neighbor_id, v_neighbor_order
      from public.product_media
     where product_id = p_product_id and sort_order >= 1 and sort_order < v_current
     order by sort_order desc
     limit 1;
  else
    select media_asset_id, sort_order into v_neighbor_id, v_neighbor_order
      from public.product_media
     where product_id = p_product_id and sort_order > v_current
     order by sort_order asc
     limit 1;
  end if;

  if v_neighbor_id is null then
    return; -- ya está en el extremo
  end if;

  update public.product_media
     set sort_order = case media_asset_id
                        when p_media_asset_id then v_neighbor_order
                        else v_current
                      end
   where product_id = p_product_id
     and media_asset_id in (p_media_asset_id, v_neighbor_id);
end;
$$;

-- ------------------------------------------------------------
-- 3c) Quitar de la galería: borra la fila, renumera 0..n y, si la
--     eliminada era la principal, promueve la que quedó en 0 (o null).
--     Devuelve el main_image_id resultante para que la capa de
--     aplicación gestione la limpieza de archivos huérfanos.
-- ------------------------------------------------------------
create or replace function public.remove_product_media_entry(
  p_product_id uuid,
  p_media_asset_id uuid
)
returns uuid
language plpgsql
volatile
set search_path = public, pg_temp
as $$
declare
  v_main uuid;
  v_new_main uuid;
begin
  delete from public.product_media
   where product_id = p_product_id and media_asset_id = p_media_asset_id;
  if not found then
    raise exception 'La imagen no pertenece a la galería del producto.';
  end if;

  update public.product_media pm
     set sort_order = ranked.new_order
    from (
      select id,
             row_number() over (order by sort_order, created_at) - 1 as new_order
        from public.product_media
       where product_id = p_product_id
    ) ranked
   where pm.id = ranked.id
     and pm.sort_order <> ranked.new_order;

  select main_image_id into v_main
    from public.products
   where id = p_product_id;

  if v_main is not distinct from p_media_asset_id then
    select media_asset_id into v_new_main
      from public.product_media
     where product_id = p_product_id and sort_order = 0;

    update public.products
       set main_image_id = v_new_main
     where id = p_product_id;
    return v_new_main;
  end if;

  return v_main;
end;
$$;

-- EXECUTE restringido: anon nunca las ejecuta; authenticated las puede
-- invocar pero sin perfil ADMIN la RLS interna deja las escrituras en
-- cero filas y la función termina en excepción de pertenencia.
revoke execute on function public.set_product_main_image(uuid, uuid) from public, anon;
revoke execute on function public.swap_product_media_order(uuid, uuid, text) from public, anon;
revoke execute on function public.remove_product_media_entry(uuid, uuid) from public, anon;
grant execute on function public.set_product_main_image(uuid, uuid) to authenticated;
grant execute on function public.swap_product_media_order(uuid, uuid, text) to authenticated;
grant execute on function public.remove_product_media_entry(uuid, uuid) to authenticated;
