-- ============================================================
-- Migración 0002 — Row Level Security
--
-- Reglas:
--   * Visitantes (anon) solo leen contenido PUBLISHED.
--   * Nadie escribe sin ser administrador autenticado.
--   * El administrador (perfil activo con role = 'ADMIN') lee y
--     gestiona todo, incluidos borradores.
--   * El registro público de usuarios debe estar DESHABILITADO en
--     la configuración del proyecto Supabase (Authentication →
--     Sign In / Up → desactivar "Allow new users to sign up").
--     Ver docs/INFRASTRUCTURE.md.
--
-- Verificación: supabase/tests/rls_checks.sql
-- ============================================================

-- ------------------------------------------------------------
-- Función endurecida para identificar administradores.
--  * security definer: consulta profiles sin recursión de políticas.
--  * search_path fijado explícitamente (evita suplantación de objetos).
--  * Retorna false si no hay sesión (auth.uid() null).
--  * Exige un perfil existente con role = 'ADMIN'.
--  * EXECUTE limitado: se revoca de public y se concede solo a los
--    roles que evalúan políticas (anon la necesita para evaluar las
--    políticas de lectura sin error; para anon siempre retorna false).
-- ------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select case
    when auth.uid() is null then false
    else exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role = 'ADMIN'
    )
  end;
$$;

revoke execute on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

-- ------------------------------------------------------------
-- profiles
-- ------------------------------------------------------------
alter table public.profiles enable row level security;

create policy "profiles_select_own_or_admin"
  on public.profiles for select
  using (id = auth.uid() or public.is_admin());

create policy "profiles_insert_admin"
  on public.profiles for insert
  with check (public.is_admin());

create policy "profiles_update_admin"
  on public.profiles for update
  using (public.is_admin())
  with check (public.is_admin());

create policy "profiles_delete_admin"
  on public.profiles for delete
  using (public.is_admin());

-- ------------------------------------------------------------
-- media_assets: lectura pública (las imágenes referenciadas por
-- contenido publicado deben poder resolverse); escritura solo admin.
-- ------------------------------------------------------------
alter table public.media_assets enable row level security;

create policy "media_assets_select_all"
  on public.media_assets for select
  using (true);

create policy "media_assets_insert_admin"
  on public.media_assets for insert
  with check (public.is_admin());

create policy "media_assets_update_admin"
  on public.media_assets for update
  using (public.is_admin())
  with check (public.is_admin());

create policy "media_assets_delete_admin"
  on public.media_assets for delete
  using (public.is_admin());

-- ------------------------------------------------------------
-- site_settings: lectura pública, escritura solo admin.
-- ------------------------------------------------------------
alter table public.site_settings enable row level security;

create policy "site_settings_select_all"
  on public.site_settings for select
  using (true);

create policy "site_settings_insert_admin"
  on public.site_settings for insert
  with check (public.is_admin());

create policy "site_settings_update_admin"
  on public.site_settings for update
  using (public.is_admin())
  with check (public.is_admin());

create policy "site_settings_delete_admin"
  on public.site_settings for delete
  using (public.is_admin());

-- ------------------------------------------------------------
-- product_categories: lectura pública, escritura solo admin.
-- ------------------------------------------------------------
alter table public.product_categories enable row level security;

create policy "product_categories_select_all"
  on public.product_categories for select
  using (true);

create policy "product_categories_insert_admin"
  on public.product_categories for insert
  with check (public.is_admin());

create policy "product_categories_update_admin"
  on public.product_categories for update
  using (public.is_admin())
  with check (public.is_admin());

create policy "product_categories_delete_admin"
  on public.product_categories for delete
  using (public.is_admin());

-- ------------------------------------------------------------
-- company_content / products / blog_posts / faqs:
-- anon lee solo PUBLISHED; admin lee y escribe todo.
-- ------------------------------------------------------------
alter table public.company_content enable row level security;

create policy "company_content_select_published_or_admin"
  on public.company_content for select
  using (status = 'PUBLISHED' or public.is_admin());

create policy "company_content_insert_admin"
  on public.company_content for insert
  with check (public.is_admin());

create policy "company_content_update_admin"
  on public.company_content for update
  using (public.is_admin())
  with check (public.is_admin());

create policy "company_content_delete_admin"
  on public.company_content for delete
  using (public.is_admin());

alter table public.products enable row level security;

create policy "products_select_published_or_admin"
  on public.products for select
  using (status = 'PUBLISHED' or public.is_admin());

create policy "products_insert_admin"
  on public.products for insert
  with check (public.is_admin());

create policy "products_update_admin"
  on public.products for update
  using (public.is_admin())
  with check (public.is_admin());

create policy "products_delete_admin"
  on public.products for delete
  using (public.is_admin());

-- product_media hereda la visibilidad del producto al que pertenece.
alter table public.product_media enable row level security;

create policy "product_media_select_published_or_admin"
  on public.product_media for select
  using (
    public.is_admin()
    or exists (
      select 1 from public.products pr
      where pr.id = product_id and pr.status = 'PUBLISHED'
    )
  );

create policy "product_media_insert_admin"
  on public.product_media for insert
  with check (public.is_admin());

create policy "product_media_update_admin"
  on public.product_media for update
  using (public.is_admin())
  with check (public.is_admin());

create policy "product_media_delete_admin"
  on public.product_media for delete
  using (public.is_admin());

alter table public.blog_posts enable row level security;

create policy "blog_posts_select_published_or_admin"
  on public.blog_posts for select
  using (status = 'PUBLISHED' or public.is_admin());

create policy "blog_posts_insert_admin"
  on public.blog_posts for insert
  with check (public.is_admin());

create policy "blog_posts_update_admin"
  on public.blog_posts for update
  using (public.is_admin())
  with check (public.is_admin());

create policy "blog_posts_delete_admin"
  on public.blog_posts for delete
  using (public.is_admin());

alter table public.faqs enable row level security;

create policy "faqs_select_published_or_admin"
  on public.faqs for select
  using (status = 'PUBLISHED' or public.is_admin());

create policy "faqs_insert_admin"
  on public.faqs for insert
  with check (public.is_admin());

create policy "faqs_update_admin"
  on public.faqs for update
  using (public.is_admin())
  with check (public.is_admin());

create policy "faqs_delete_admin"
  on public.faqs for delete
  using (public.is_admin());
