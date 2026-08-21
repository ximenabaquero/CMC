-- ============================================================
-- Pruebas de Row Level Security — ejecutar en el SQL Editor de
-- Supabase (o psql) DESPUÉS de aplicar migraciones y seed.
--
-- Todo corre dentro de una transacción que se revierte al final:
-- no deja datos de prueba.
--
-- Si alguna verificación falla, el script se detiene con una
-- EXCEPCIÓN descriptiva. Si termina con "TODAS LAS PRUEBAS RLS
-- PASARON", las políticas funcionan.
--
-- Nota adicional (manual): verificar en el dashboard que
-- Authentication → Sign In / Up → "Allow new users to sign up"
-- esté DESACTIVADO (no hay registro público).
-- ============================================================

begin;

-- ------------------------------------------------------------
-- Datos de prueba: un usuario administrador y un usuario común
-- (insertados directamente como superusuario; se revierten).
-- ------------------------------------------------------------
insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at)
values
  ('99999999-9999-4999-8999-999999999901', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'admin-prueba@example.com', 'x', now(), now(), now()),
  ('99999999-9999-4999-8999-999999999902', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'comun-prueba@example.com', 'x', now(), now(), now());

insert into public.profiles (id, email, full_name, role)
values ('99999999-9999-4999-8999-999999999901', 'admin-prueba@example.com', 'Admin de prueba', 'ADMIN');
-- El usuario "común" NO tiene perfil: no debe ser admin.

-- Marcas de prueba (0003): una publicada y una en borrador.
insert into public.brands (id, name, status)
values
  ('99999999-9999-4999-8999-999999999911', 'Marca publicada de prueba', 'PUBLISHED'),
  ('99999999-9999-4999-8999-999999999912', 'Marca borrador de prueba', 'DRAFT');

-- Producto de prueba con galería y ficha (0004): funciones de galería
-- y technical_sheet_media_id. El producto queda en DRAFT.
insert into public.media_assets (id, storage_provider, storage_path, file_name, mime_type, size_bytes, alt_text)
values
  ('99999999-9999-4999-8999-999999999921', 'R2', 'prueba-rls-1.webp', 'prueba-rls-1.webp', 'image/webp', 100, 'Imagen de prueba 1'),
  ('99999999-9999-4999-8999-999999999922', 'R2', 'prueba-rls-2.webp', 'prueba-rls-2.webp', 'image/webp', 100, 'Imagen de prueba 2'),
  ('99999999-9999-4999-8999-999999999923', 'R2', 'prueba-rls-3.webp', 'prueba-rls-3.webp', 'image/webp', 100, 'Imagen de prueba 3'),
  ('99999999-9999-4999-8999-999999999924', 'R2', 'prueba-rls-ficha.pdf', 'ficha-de-prueba.pdf', 'application/pdf', 100, 'Ficha técnica de prueba'),
  ('99999999-9999-4999-8999-999999999925', 'R2', 'prueba-rls-cuerpo.webp', 'prueba-rls-cuerpo.webp', 'image/webp', 100, 'Imagen del cuerpo de un artículo');

insert into public.products (id, name, slug, main_image_id, status)
values ('99999999-9999-4999-8999-999999999931', 'Producto prueba RLS', 'producto-prueba-rls', '99999999-9999-4999-8999-999999999921', 'DRAFT');

insert into public.product_media (product_id, media_asset_id, sort_order) values
  ('99999999-9999-4999-8999-999999999931', '99999999-9999-4999-8999-999999999921', 0),
  ('99999999-9999-4999-8999-999999999931', '99999999-9999-4999-8999-999999999922', 1),
  ('99999999-9999-4999-8999-999999999931', '99999999-9999-4999-8999-999999999923', 2);

-- Artículo de prueba con una imagen en el cuerpo (0005): la fila de
-- post_media debe heredar la visibilidad del artículo, que queda DRAFT.
insert into public.blog_posts (id, title, slug, body, status)
values ('99999999-9999-4999-8999-999999999941', 'Artículo prueba RLS', 'articulo-prueba-rls', 'Cuerpo de prueba.', 'DRAFT');

insert into public.post_media (post_id, media_asset_id) values
  ('99999999-9999-4999-8999-999999999941', '99999999-9999-4999-8999-999999999925');

-- Conteos esperados calculados sobre el estado real de la base (como
-- superusuario, antes de cambiar de rol): las pruebas no asumen que el
-- contenido esté en borrador o publicado — validan que cada rol vea
-- exactamente lo que las políticas permiten para el estado actual.
create temporary table rls_expected as
select
  (select count(*) from public.products where status = 'PUBLISHED') as published_products,
  (select count(*) from public.products) as total_products,
  (select count(*) from public.blog_posts where status = 'PUBLISHED') as published_posts,
  (select count(*) from public.faqs where status = 'PUBLISHED') as published_faqs,
  (select count(*) from public.faqs) as total_faqs,
  (select count(*) from public.brands where status = 'PUBLISHED') as published_brands,
  (select count(*) from public.brands) as total_brands,
  (select count(*) from public.company_content where section_key = 'iso_certification' and status = 'PUBLISHED') as published_iso,
  (select count(*)
     from public.product_media pm
     join public.products p on p.id = pm.product_id
    where p.status = 'PUBLISHED') as published_product_media,
  (select count(*)
     from public.post_media pm
     join public.blog_posts bp on bp.id = pm.post_id
    where bp.status = 'PUBLISHED') as published_post_media,
  (select count(*) from public.post_media) as total_post_media;

grant select on rls_expected to anon, authenticated;

-- ============================================================
-- 1) VISITANTE ANÓNIMO: solo lee contenido publicado
-- ============================================================
set local role anon;
set local request.jwt.claims = '{}';

do $$
declare n bigint; expected bigint;
begin
  -- Productos: anon ve exactamente los publicados.
  select count(*) into n from public.products;
  select published_products into expected from rls_expected;
  if n <> expected then
    raise exception 'FALLO: anon ve % productos (esperados % publicados)', n, expected;
  end if;

  -- Blog: solo publicados.
  select count(*) into n from public.blog_posts;
  select published_posts into expected from rls_expected;
  if n <> expected then
    raise exception 'FALLO: anon ve % artículos (esperados % publicados)', n, expected;
  end if;

  -- FAQs: solo publicadas.
  select count(*) into n from public.faqs;
  select published_faqs into expected from rls_expected;
  if n <> expected then
    raise exception 'FALLO: anon ve % FAQs (esperadas % publicadas)', n, expected;
  end if;

  -- Contenido institucional: iso_certification solo si está publicada.
  select count(*) into n from public.company_content where section_key = 'iso_certification';
  select published_iso into expected from rls_expected;
  if n <> expected then
    raise exception 'FALLO: anon ve % filas de iso_certification (esperadas %)', n, expected;
  end if;

  -- Marcas: solo publicadas.
  select count(*) into n from public.brands;
  select published_brands into expected from rls_expected;
  if n <> expected then
    raise exception 'FALLO: anon ve % marcas (esperadas % publicadas)', n, expected;
  end if;

  -- Galerías: solo las de productos publicados.
  select count(*) into n from public.product_media;
  select published_product_media into expected from rls_expected;
  if n <> expected then
    raise exception 'FALLO: anon ve % filas de product_media (esperadas %)', n, expected;
  end if;

  -- Imágenes del cuerpo (0005): solo las de artículos publicados.
  select count(*) into n from public.post_media;
  select published_post_media into expected from rls_expected;
  if n <> expected then
    raise exception 'FALLO: anon ve % filas de post_media (esperadas %)', n, expected;
  end if;

  -- media_assets: lectura pública (necesaria para resolver imágenes).
  select count(*) into n from public.media_assets;
  if n = 0 then
    raise exception 'FALLO: anon no puede leer media_assets';
  end if;

  -- is_admin() debe ser false sin sesión.
  if public.is_admin() then
    raise exception 'FALLO: is_admin() devolvió true para anon';
  end if;
end $$;

-- Las funciones de galería (0004) no son ejecutables por anon.
do $$
begin
  begin
    perform public.set_product_main_image(
      '99999999-9999-4999-8999-999999999931',
      '99999999-9999-4999-8999-999999999921'
    );
    raise exception 'FALLO: anon pudo ejecutar set_product_main_image';
  exception
    when insufficient_privilege then null; -- esperado (sin EXECUTE)
  end;
end $$;

-- Escritura anónima: debe fallar (RLS).
do $$
begin
  begin
    insert into public.faqs (question, answer, status) values ('x', 'x', 'PUBLISHED');
    raise exception 'FALLO: anon pudo insertar en faqs';
  exception
    when insufficient_privilege or check_violation then null; -- esperado (42501)
  end;

  begin
    update public.faqs set answer = 'hack' where true;
    if found then
      raise exception 'FALLO: anon pudo actualizar faqs';
    end if;
  exception
    when insufficient_privilege then null;
  end;

  begin
    delete from public.faqs where true;
    if found then
      raise exception 'FALLO: anon pudo borrar faqs';
    end if;
  exception
    when insufficient_privilege then null;
  end;

  begin
    insert into public.brands (name, status) values ('hack', 'PUBLISHED');
    raise exception 'FALLO: anon pudo insertar en brands';
  exception
    when insufficient_privilege or check_violation then null;
  end;

  begin
    insert into public.post_media (post_id, media_asset_id)
    values ('99999999-9999-4999-8999-999999999941', '99999999-9999-4999-8999-999999999923');
    raise exception 'FALLO: anon pudo insertar en post_media';
  exception
    when insufficient_privilege or check_violation then null;
  end;
end $$;

-- ============================================================
-- 2) USUARIO AUTENTICADO SIN PERFIL ADMIN: no es admin, no escribe
-- ============================================================
set local role authenticated;
set local request.jwt.claims = '{"sub": "99999999-9999-4999-8999-999999999902", "role": "authenticated"}';

do $$
declare n bigint; expected bigint;
begin
  if public.is_admin() then
    raise exception 'FALLO: usuario sin perfil ADMIN fue reconocido como admin';
  end if;

  -- Sigue sin ver borradores (solo publicados, como anon).
  select count(*) into n from public.products;
  select published_products into expected from rls_expected;
  if n <> expected then
    raise exception 'FALLO: usuario común ve % productos (esperados % publicados)', n, expected;
  end if;

  begin
    insert into public.products (name, slug) values ('hack', 'hack');
    raise exception 'FALLO: usuario común pudo insertar productos';
  exception
    when insufficient_privilege or check_violation then null;
  end;

  -- Las funciones de galería no tienen efecto sin perfil ADMIN: la RLS
  -- oculta el producto DRAFT y la validación de pertenencia falla.
  begin
    perform public.set_product_main_image(
      '99999999-9999-4999-8999-999999999931',
      '99999999-9999-4999-8999-999999999922'
    );
    raise exception 'FALLO: usuario común ejecutó set_product_main_image con efecto';
  exception
    when raise_exception then
      if sqlerrm like 'FALLO:%' then raise; end if; -- esperado: error de pertenencia
  end;
end $$;

-- ============================================================
-- 3) ADMINISTRADOR: ve y gestiona borradores
-- ============================================================
set local role authenticated;
set local request.jwt.claims = '{"sub": "99999999-9999-4999-8999-999999999901", "role": "authenticated"}';

do $$
declare n bigint; expected bigint;
begin
  if not public.is_admin() then
    raise exception 'FALLO: el administrador no fue reconocido por is_admin()';
  end if;

  -- Ve TODOS los productos, incluidos borradores.
  select count(*) into n from public.products;
  select total_products into expected from rls_expected;
  if n <> expected then
    raise exception 'FALLO: admin ve % productos (esperados % totales)', n, expected;
  end if;

  -- Ve todas las FAQs, incluidas las DRAFT.
  select count(*) into n from public.faqs;
  select total_faqs into expected from rls_expected;
  if n <> expected then
    raise exception 'FALLO: admin ve % FAQs (esperadas % totales)', n, expected;
  end if;

  -- Ve todas las marcas, incluidas las DRAFT.
  select count(*) into n from public.brands;
  select total_brands into expected from rls_expected;
  if n <> expected then
    raise exception 'FALLO: admin ve % marcas (esperadas % totales)', n, expected;
  end if;

  -- Ve las imágenes del cuerpo de TODOS los artículos, incluidos borradores.
  select count(*) into n from public.post_media;
  select total_post_media into expected from rls_expected;
  if n <> expected then
    raise exception 'FALLO: admin ve % filas de post_media (esperadas % totales)', n, expected;
  end if;

  -- Puede vincular y desvincular imágenes del cuerpo.
  insert into public.post_media (post_id, media_asset_id)
  values ('99999999-9999-4999-8999-999999999941', '99999999-9999-4999-8999-999999999923');
  delete from public.post_media
   where post_id = '99999999-9999-4999-8999-999999999941'
     and media_asset_id = '99999999-9999-4999-8999-999999999923';
  if not found then
    raise exception 'FALLO: admin no pudo borrar una fila de post_media';
  end if;

  -- Puede escribir.
  update public.products
     set short_description = coalesce(short_description, '')
   where slug = 'dap-hojaldre';
  if not found then
    raise exception 'FALLO: admin no pudo actualizar un producto';
  end if;

  insert into public.faqs (question, answer, status) values ('prueba admin', 'ok', 'DRAFT');
  delete from public.faqs where question = 'prueba admin';

  update public.brands
     set sort_order = 5
   where id = '99999999-9999-4999-8999-999999999912';
  if not found then
    raise exception 'FALLO: admin no pudo actualizar una marca';
  end if;
end $$;

-- Funciones de galería (0004) como administrador: ciclo completo.
do $$
declare
  v_product uuid := '99999999-9999-4999-8999-999999999931';
  v_img1 uuid := '99999999-9999-4999-8999-999999999921';
  v_img2 uuid := '99999999-9999-4999-8999-999999999922';
  v_img3 uuid := '99999999-9999-4999-8999-999999999923';
  v_ficha uuid := '99999999-9999-4999-8999-999999999924';
  v_main uuid;
  n bigint;
begin
  -- 1) Imagen principal atómica: elegir la segunda imagen.
  perform public.set_product_main_image(v_product, v_img2);

  select main_image_id into v_main from public.products where id = v_product;
  if v_main is distinct from v_img2 then
    raise exception 'FALLO: set_product_main_image no actualizó main_image_id';
  end if;
  select count(*) into n from public.product_media
   where product_id = v_product and sort_order = 0 and media_asset_id = v_img2;
  if n <> 1 then
    raise exception 'FALLO: la imagen principal no quedó en sort_order 0';
  end if;
  select count(*) into n from public.product_media where product_id = v_product and sort_order = 0;
  if n <> 1 then
    raise exception 'FALLO: hay % imágenes con sort_order 0 (esperada 1)', n;
  end if;

  -- 2) La función rechaza una imagen ajena a la galería.
  begin
    perform public.set_product_main_image(v_product, v_ficha);
    raise exception 'FALLO: se aceptó como principal un asset fuera de la galería';
  exception
    when raise_exception then
      if sqlerrm like 'FALLO:%' then raise; end if;
  end;

  -- 3) Reordenar secundarias: subir la última.
  perform public.swap_product_media_order(v_product, v_img3, 'up');
  select count(*) into n from public.product_media
   where product_id = v_product and media_asset_id = v_img3 and sort_order = 1;
  if n <> 1 then
    raise exception 'FALLO: swap_product_media_order no movió la imagen';
  end if;

  -- La principal (sort 0) no se mueve con swap.
  perform public.swap_product_media_order(v_product, v_img2, 'down');
  select count(*) into n from public.product_media
   where product_id = v_product and media_asset_id = v_img2 and sort_order = 0;
  if n <> 1 then
    raise exception 'FALLO: swap movió la imagen principal';
  end if;

  -- 4) Quitar la principal: promueve la que queda en 0.
  v_main := public.remove_product_media_entry(v_product, v_img2);
  if v_main is null then
    raise exception 'FALLO: remove_product_media_entry no promovió una nueva principal';
  end if;
  select main_image_id into v_main from public.products where id = v_product;
  select count(*) into n from public.product_media
   where product_id = v_product and sort_order = 0 and media_asset_id = v_main;
  if n <> 1 then
    raise exception 'FALLO: la nueva principal no coincide con sort_order 0';
  end if;
  select count(*) into n from public.product_media where product_id = v_product;
  if n <> 2 then
    raise exception 'FALLO: quedan % filas en la galería (esperadas 2)', n;
  end if;

  -- 5) Ficha técnica: asignable y con on delete set null.
  update public.products set technical_sheet_media_id = v_ficha where id = v_product;
  delete from public.media_assets where id = v_ficha;
  select technical_sheet_media_id into v_main from public.products where id = v_product;
  if v_main is not null then
    raise exception 'FALLO: technical_sheet_media_id no quedó en null al borrar el asset';
  end if;
end $$;

reset role;

do $$ begin
  raise notice '=== TODAS LAS PRUEBAS RLS PASARON ===';
end $$;

rollback;
