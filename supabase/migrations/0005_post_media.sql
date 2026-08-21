-- ============================================================
-- Migración 0005 — Imágenes dentro del cuerpo de los artículos
--
-- El blog solo admitía una imagen por artículo (la portada,
-- blog_posts.cover_image_id). Esta tabla puente registra las
-- imágenes que el editor sube para ILUSTRAR el cuerpo: el Markdown
-- las referencia por URL, y post_media guarda de qué artículo es
-- cada una para poder listarlas en el panel y borrarlas del
-- almacenamiento cuando se quitan o cuando se elimina el artículo
-- (sin ella, cada archivo subido quedaría huérfano en R2).
--
-- Espejo simplificado de product_media: aquí el orden no significa
-- nada (lo fija el propio texto), así que no hay sort_order.
-- ============================================================

create table public.post_media (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.blog_posts (id) on delete cascade,
  media_asset_id uuid not null references public.media_assets (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (post_id, media_asset_id)
);

create index post_media_post_id_idx on public.post_media (post_id);

-- RLS: mismas reglas que product_media — la fila hereda la
-- visibilidad del artículo al que pertenece; escribir, solo admin.
alter table public.post_media enable row level security;

create policy "post_media_select_published_or_admin"
  on public.post_media for select
  using (
    public.is_admin()
    or exists (
      select 1 from public.blog_posts bp
      where bp.id = post_id and bp.status = 'PUBLISHED'
    )
  );

create policy "post_media_insert_admin"
  on public.post_media for insert
  with check (public.is_admin());

create policy "post_media_update_admin"
  on public.post_media for update
  using (public.is_admin())
  with check (public.is_admin());

create policy "post_media_delete_admin"
  on public.post_media for delete
  using (public.is_admin());
