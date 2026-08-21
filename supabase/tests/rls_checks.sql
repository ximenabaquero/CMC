-- ============================================================
-- Pruebas de Row Level Security — pegar el archivo COMPLETO en el
-- SQL Editor de Supabase (o ejecutarlo con psql / Management API).
--
-- Todo el cuerpo es UNA sola sentencia `do $$ … $$` a propósito:
--   * ninguna herramienta puede trocearlo,
--   * los conteos esperados viven en variables plpgsql (antes había
--     una tabla TEMPORAL que el SQL Editor no conserva entre
--     sentencias: fallaba con 42P01 «relation rls_expected does not
--     exist»),
--   * los cambios de rol se hacen dentro del bloque con set_config,
--   * y los datos de prueba se borran al final. Si algo falla, la
--     sentencia entera se revierte sola, así que tampoco quedan
--     restos. El begin/rollback exterior es una segunda red.
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

do $$
declare
  -- Datos de prueba (ids fijos para poder limpiarlos con certeza).
  v_admin       uuid := '99999999-9999-4999-8999-999999999901';
  v_user        uuid := '99999999-9999-4999-8999-999999999902';
  v_brand_pub   uuid := '99999999-9999-4999-8999-999999999911';
  v_brand_draft uuid := '99999999-9999-4999-8999-999999999912';
  v_img1        uuid := '99999999-9999-4999-8999-999999999921';
  v_img2        uuid := '99999999-9999-4999-8999-999999999922';
  v_img3        uuid := '99999999-9999-4999-8999-999999999923';
  v_ficha       uuid := '99999999-9999-4999-8999-999999999924';
  v_img_body    uuid := '99999999-9999-4999-8999-999999999925';
  v_product     uuid := '99999999-9999-4999-8999-999999999931';
  v_post        uuid := '99999999-9999-4999-8999-999999999941';

  -- Conteos esperados: se calculan como postgres sobre el estado REAL
  -- de la base (no se asume que el contenido esté publicado o en
  -- borrador) y luego se comparan con lo que ve cada rol.
  e_published_products     bigint;
  e_total_products         bigint;
  e_published_posts        bigint;
  e_published_faqs         bigint;
  e_total_faqs             bigint;
  e_published_brands       bigint;
  e_total_brands           bigint;
  e_published_iso          bigint;
  e_published_product_media bigint;
  e_published_post_media   bigint;
  e_total_post_media       bigint;

  n      bigint;
  v_main uuid;
begin
  -- ------------------------------------------------------------
  -- 0) Datos de prueba (como postgres): un administrador y un
  --    usuario común SIN perfil, marcas publicada/borrador, un
  --    producto DRAFT con galería y ficha, y un artículo DRAFT con
  --    una imagen en el cuerpo.
  -- ------------------------------------------------------------
  insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at)
  values
    (v_admin, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'admin-prueba@example.com', 'x', now(), now(), now()),
    (v_user,  '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'comun-prueba@example.com', 'x', now(), now(), now());

  insert into public.profiles (id, email, full_name, role)
  values (v_admin, 'admin-prueba@example.com', 'Admin de prueba', 'ADMIN');

  insert into public.brands (id, name, status) values
    (v_brand_pub,   'Marca publicada de prueba', 'PUBLISHED'),
    (v_brand_draft, 'Marca borrador de prueba',  'DRAFT');

  insert into public.media_assets (id, storage_provider, storage_path, file_name, mime_type, size_bytes, alt_text) values
    (v_img1,     'R2', 'prueba-rls-1.webp',      'prueba-rls-1.webp',      'image/webp',      100, 'Imagen de prueba 1'),
    (v_img2,     'R2', 'prueba-rls-2.webp',      'prueba-rls-2.webp',      'image/webp',      100, 'Imagen de prueba 2'),
    (v_img3,     'R2', 'prueba-rls-3.webp',      'prueba-rls-3.webp',      'image/webp',      100, 'Imagen de prueba 3'),
    (v_ficha,    'R2', 'prueba-rls-ficha.pdf',   'ficha-de-prueba.pdf',    'application/pdf', 100, 'Ficha técnica de prueba'),
    (v_img_body, 'R2', 'prueba-rls-cuerpo.webp', 'prueba-rls-cuerpo.webp', 'image/webp',      100, 'Imagen del cuerpo de un artículo');

  insert into public.products (id, name, slug, main_image_id, status)
  values (v_product, 'Producto prueba RLS', 'producto-prueba-rls', v_img1, 'DRAFT');

  insert into public.product_media (product_id, media_asset_id, sort_order) values
    (v_product, v_img1, 0),
    (v_product, v_img2, 1),
    (v_product, v_img3, 2);

  insert into public.blog_posts (id, title, slug, body, status)
  values (v_post, 'Artículo prueba RLS', 'articulo-prueba-rls', 'Cuerpo de prueba.', 'DRAFT');

  insert into public.post_media (post_id, media_asset_id) values (v_post, v_img_body);

  -- ------------------------------------------------------------
  -- 1) Expectativas sobre el estado real (todavía como postgres).
  -- ------------------------------------------------------------
  select count(*) into e_published_products from public.products where status = 'PUBLISHED';
  select count(*) into e_total_products     from public.products;
  select count(*) into e_published_posts    from public.blog_posts where status = 'PUBLISHED';
  select count(*) into e_published_faqs     from public.faqs where status = 'PUBLISHED';
  select count(*) into e_total_faqs         from public.faqs;
  select count(*) into e_published_brands   from public.brands where status = 'PUBLISHED';
  select count(*) into e_total_brands       from public.brands;
  select count(*) into e_published_iso
    from public.company_content
   where section_key = 'iso_certification' and status = 'PUBLISHED';
  select count(*) into e_published_product_media
    from public.product_media pm
    join public.products p on p.id = pm.product_id
   where p.status = 'PUBLISHED';
  select count(*) into e_published_post_media
    from public.post_media pm
    join public.blog_posts bp on bp.id = pm.post_id
   where bp.status = 'PUBLISHED';
  select count(*) into e_total_post_media from public.post_media;

  -- ============================================================
  -- 2) VISITANTE ANÓNIMO: solo lee contenido publicado
  -- ============================================================
  perform set_config('role', 'anon', true);
  perform set_config('request.jwt.claims', '{}', true);

  -- Productos: anon ve exactamente los publicados.
  select count(*) into n from public.products;
  if n <> e_published_products then
    raise exception 'FALLO: anon ve % productos (esperados % publicados)', n, e_published_products;
  end if;

  -- Blog: solo publicados.
  select count(*) into n from public.blog_posts;
  if n <> e_published_posts then
    raise exception 'FALLO: anon ve % artículos (esperados % publicados)', n, e_published_posts;
  end if;

  -- FAQs: solo publicadas.
  select count(*) into n from public.faqs;
  if n <> e_published_faqs then
    raise exception 'FALLO: anon ve % FAQs (esperadas % publicadas)', n, e_published_faqs;
  end if;

  -- Contenido institucional: iso_certification solo si está publicada.
  select count(*) into n from public.company_content where section_key = 'iso_certification';
  if n <> e_published_iso then
    raise exception 'FALLO: anon ve % filas de iso_certification (esperadas %)', n, e_published_iso;
  end if;

  -- Marcas: solo publicadas.
  select count(*) into n from public.brands;
  if n <> e_published_brands then
    raise exception 'FALLO: anon ve % marcas (esperadas % publicadas)', n, e_published_brands;
  end if;

  -- Galerías: solo las de productos publicados.
  select count(*) into n from public.product_media;
  if n <> e_published_product_media then
    raise exception 'FALLO: anon ve % filas de product_media (esperadas %)', n, e_published_product_media;
  end if;

  -- Imágenes del cuerpo (0005): solo las de artículos publicados.
  select count(*) into n from public.post_media;
  if n <> e_published_post_media then
    raise exception 'FALLO: anon ve % filas de post_media (esperadas %)', n, e_published_post_media;
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

  -- Las funciones de galería (0004) no son ejecutables por anon.
  begin
    perform public.set_product_main_image(v_product, v_img1);
    raise exception 'FALLO: anon pudo ejecutar set_product_main_image';
  exception
    when insufficient_privilege then null; -- esperado (sin EXECUTE)
  end;

  -- Escritura anónima: debe fallar (RLS).
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
    insert into public.post_media (post_id, media_asset_id) values (v_post, v_img3);
    raise exception 'FALLO: anon pudo insertar en post_media';
  exception
    when insufficient_privilege or check_violation then null;
  end;

  -- ============================================================
  -- 3) USUARIO AUTENTICADO SIN PERFIL ADMIN: no es admin, no escribe
  -- ============================================================
  perform set_config('role', 'authenticated', true);
  perform set_config('request.jwt.claims',
                     format('{"sub": "%s", "role": "authenticated"}', v_user), true);

  if public.is_admin() then
    raise exception 'FALLO: usuario sin perfil ADMIN fue reconocido como admin';
  end if;

  -- Sigue sin ver borradores (solo publicados, como anon).
  select count(*) into n from public.products;
  if n <> e_published_products then
    raise exception 'FALLO: usuario común ve % productos (esperados % publicados)', n, e_published_products;
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
    perform public.set_product_main_image(v_product, v_img2);
    raise exception 'FALLO: usuario común ejecutó set_product_main_image con efecto';
  exception
    when raise_exception then
      if sqlerrm like 'FALLO:%' then raise; end if; -- esperado: error de pertenencia
  end;

  -- ============================================================
  -- 4) ADMINISTRADOR: ve y gestiona borradores
  -- ============================================================
  perform set_config('request.jwt.claims',
                     format('{"sub": "%s", "role": "authenticated"}', v_admin), true);

  if not public.is_admin() then
    raise exception 'FALLO: el administrador no fue reconocido por is_admin()';
  end if;

  -- Ve TODOS los productos, incluidos borradores.
  select count(*) into n from public.products;
  if n <> e_total_products then
    raise exception 'FALLO: admin ve % productos (esperados % totales)', n, e_total_products;
  end if;

  -- Ve todas las FAQs, incluidas las DRAFT.
  select count(*) into n from public.faqs;
  if n <> e_total_faqs then
    raise exception 'FALLO: admin ve % FAQs (esperadas % totales)', n, e_total_faqs;
  end if;

  -- Ve todas las marcas, incluidas las DRAFT.
  select count(*) into n from public.brands;
  if n <> e_total_brands then
    raise exception 'FALLO: admin ve % marcas (esperadas % totales)', n, e_total_brands;
  end if;

  -- Ve las imágenes del cuerpo de TODOS los artículos, incluidos borradores.
  select count(*) into n from public.post_media;
  if n <> e_total_post_media then
    raise exception 'FALLO: admin ve % filas de post_media (esperadas % totales)', n, e_total_post_media;
  end if;

  -- Puede vincular y desvincular imágenes del cuerpo.
  insert into public.post_media (post_id, media_asset_id) values (v_post, v_img3);
  delete from public.post_media where post_id = v_post and media_asset_id = v_img3;
  if not found then
    raise exception 'FALLO: admin no pudo borrar una fila de post_media';
  end if;

  -- Puede escribir contenido (sobre los datos de prueba, nunca sobre
  -- los reales: si la herramienta hiciera commit, no habría tocado nada).
  update public.products set short_description = 'editado por la prueba' where id = v_product;
  if not found then
    raise exception 'FALLO: admin no pudo actualizar un producto';
  end if;

  update public.blog_posts set excerpt = 'editado por la prueba' where id = v_post;
  if not found then
    raise exception 'FALLO: admin no pudo actualizar un artículo';
  end if;

  insert into public.faqs (question, answer, status) values ('prueba admin', 'ok', 'DRAFT');
  delete from public.faqs where question = 'prueba admin';

  update public.brands set sort_order = 5 where id = v_brand_draft;
  if not found then
    raise exception 'FALLO: admin no pudo actualizar una marca';
  end if;

  -- Funciones de galería (0004) como administrador: ciclo completo.

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

  -- ============================================================
  -- 5) Limpieza de los datos de prueba (de vuelta como postgres).
  --    Si algo hubiera fallado antes, la sentencia entera se habría
  --    revertido y tampoco quedaría rastro.
  -- ============================================================
  -- 'none' equivale a RESET ROLE: se vuelve al rol de la sesión sin
  -- suponer que se llama `postgres` (el editor podría conectarse con otro).
  perform set_config('role', 'none', true);
  perform set_config('request.jwt.claims', '{}', true);

  delete from public.post_media where post_id = v_post;
  delete from public.blog_posts where id = v_post;
  delete from public.product_media where product_id = v_product;
  delete from public.products where id = v_product;
  delete from public.media_assets where id in (v_img1, v_img2, v_img3, v_ficha, v_img_body);
  delete from public.brands where id in (v_brand_pub, v_brand_draft);
  delete from public.profiles where id = v_admin;
  delete from auth.users where id in (v_admin, v_user);

  raise notice '=== TODAS LAS PRUEBAS RLS PASARON ===';
end $$;

rollback;
