-- ============================================================
-- Migración 0003 — Marcas aliadas (carrusel de la página de inicio)
-- Compañía Mundial de Comercio S.A.S. — Sitio corporativo + CMS
-- Aplicar con: Supabase SQL Editor o `supabase db push`
-- ============================================================

-- ------------------------------------------------------------
-- brands — marcas que la compañía maneja/distribuye. Se muestran
-- como carrusel de logos en la página de inicio. Sin slug: no hay
-- página de detalle por marca. `internal_note` sirve, entre otras
-- cosas, para registrar el estado de la autorización escrita de
-- cada marca para exhibir su logo (ver docs/CONTENT_PENDING.md).
-- ------------------------------------------------------------
create table public.brands (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  logo_media_id uuid references public.media_assets (id) on delete set null,
  website_url text,
  sort_order integer not null default 0,
  status text not null default 'DRAFT' check (status in ('DRAFT', 'PUBLISHED')),
  internal_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users (id) on delete set null
);

create index brands_status_sort_idx on public.brands (status, sort_order);

create trigger brands_set_updated_at
  before update on public.brands
  for each row execute function public.set_updated_at();

-- ------------------------------------------------------------
-- RLS: anon lee solo PUBLISHED; admin lee y escribe todo.
-- Los logos son legibles por anon vía la política existente
-- media_assets_select_all (migración 0002).
-- ------------------------------------------------------------
alter table public.brands enable row level security;

create policy "brands_select_published_or_admin"
  on public.brands for select
  using (status = 'PUBLISHED' or public.is_admin());

create policy "brands_insert_admin"
  on public.brands for insert
  with check (public.is_admin());

create policy "brands_update_admin"
  on public.brands for update
  using (public.is_admin())
  with check (public.is_admin());

create policy "brands_delete_admin"
  on public.brands for delete
  using (public.is_admin());
