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

-- ============================================================
-- 1) VISITANTE ANÓNIMO: solo lee contenido publicado
-- ============================================================
set local role anon;
set local request.jwt.claims = '{}';

do $$
declare n bigint;
begin
  -- Productos: todos están en DRAFT → el visitante no ve ninguno.
  select count(*) into n from public.products;
  if n <> 0 then
    raise exception 'FALLO: anon ve % productos en DRAFT (esperado 0)', n;
  end if;

  -- Blog: todos en DRAFT → 0 visibles.
  select count(*) into n from public.blog_posts;
  if n <> 0 then
    raise exception 'FALLO: anon ve % artículos en DRAFT (esperado 0)', n;
  end if;

  -- FAQs: 4 publicadas de 5 (la n.º 2 está en DRAFT).
  select count(*) into n from public.faqs;
  if n <> 4 then
    raise exception 'FALLO: anon ve % FAQs (esperado 4 publicadas)', n;
  end if;

  -- Contenido institucional: la sección iso_certification (DRAFT) no debe verse.
  select count(*) into n from public.company_content where section_key = 'iso_certification';
  if n <> 0 then
    raise exception 'FALLO: anon puede ver la sección iso_certification en DRAFT';
  end if;

  -- Marcas: solo la publicada es visible.
  select count(*) into n from public.brands;
  if n <> 1 then
    raise exception 'FALLO: anon ve % marcas (esperado 1 publicada)', n;
  end if;

  -- is_admin() debe ser false sin sesión.
  if public.is_admin() then
    raise exception 'FALLO: is_admin() devolvió true para anon';
  end if;
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
end $$;

-- ============================================================
-- 2) USUARIO AUTENTICADO SIN PERFIL ADMIN: no es admin, no escribe
-- ============================================================
set local role authenticated;
set local request.jwt.claims = '{"sub": "99999999-9999-4999-8999-999999999902", "role": "authenticated"}';

do $$
declare n bigint;
begin
  if public.is_admin() then
    raise exception 'FALLO: usuario sin perfil ADMIN fue reconocido como admin';
  end if;

  -- Sigue sin ver borradores.
  select count(*) into n from public.products;
  if n <> 0 then
    raise exception 'FALLO: usuario común ve % productos en DRAFT', n;
  end if;

  begin
    insert into public.products (name, slug) values ('hack', 'hack');
    raise exception 'FALLO: usuario común pudo insertar productos';
  exception
    when insufficient_privilege or check_violation then null;
  end;
end $$;

-- ============================================================
-- 3) ADMINISTRADOR: ve y gestiona borradores
-- ============================================================
set local role authenticated;
set local request.jwt.claims = '{"sub": "99999999-9999-4999-8999-999999999901", "role": "authenticated"}';

do $$
declare n bigint;
begin
  if not public.is_admin() then
    raise exception 'FALLO: el administrador no fue reconocido por is_admin()';
  end if;

  -- Ve los 12 productos en DRAFT.
  select count(*) into n from public.products;
  if n <> 12 then
    raise exception 'FALLO: admin ve % productos (esperado 12)', n;
  end if;

  -- Ve las 5 FAQs (incluida la DRAFT).
  select count(*) into n from public.faqs;
  if n <> 5 then
    raise exception 'FALLO: admin ve % FAQs (esperado 5)', n;
  end if;

  -- Ve las 2 marcas de prueba (incluida la DRAFT).
  select count(*) into n from public.brands;
  if n <> 2 then
    raise exception 'FALLO: admin ve % marcas (esperado 2)', n;
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

reset role;

do $$ begin
  raise notice '=== TODAS LAS PRUEBAS RLS PASARON ===';
end $$;

rollback;
