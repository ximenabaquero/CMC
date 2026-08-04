-- ============================================================
-- Migración 0001 — Esquema base
-- Compañía Mundial de Comercio S.A.S. — Sitio corporativo + CMS
-- Aplicar con: Supabase SQL Editor o `supabase db push`
-- ============================================================

-- ------------------------------------------------------------
-- Trigger compartido para mantener updated_at
-- ------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ------------------------------------------------------------
-- profiles — perfiles vinculados a auth.users (rol único ADMIN)
-- El primer administrador se crea manualmente: ver docs/CMS_GUIDE.md.
-- No existe registro público de usuarios.
-- ------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text,
  role text not null default 'ADMIN' check (role in ('ADMIN')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- ------------------------------------------------------------
-- media_assets — metadatos de imágenes.
-- storage_provider separa explícitamente los dos mecanismos:
--   STATIC → activos oficiales versionados en public/ (storage_path = ruta bajo /)
--   R2     → archivos cargados desde el CMS al adaptador (R2 en prod, local en dev)
-- Nunca se genera URL de R2 para un activo STATIC ni viceversa.
-- Los binarios NUNCA se guardan en la base de datos.
-- ------------------------------------------------------------
create table public.media_assets (
  id uuid primary key default gen_random_uuid(),
  storage_provider text not null check (storage_provider in ('STATIC', 'R2')),
  storage_path text not null unique,
  public_url text,
  file_name text not null,
  mime_type text not null,
  size_bytes bigint not null default 0 check (size_bytes >= 0),
  width integer check (width is null or width > 0),
  height integer check (height is null or height > 0),
  alt_text text not null check (btrim(alt_text) <> ''),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users (id) on delete set null
);

create trigger media_assets_set_updated_at
  before update on public.media_assets
  for each row execute function public.set_updated_at();

-- ------------------------------------------------------------
-- site_settings — configuración global (fila única).
-- Los campos de contacto son opcionales: el sitio público solo
-- muestra los canales configurados (no nulos).
-- ------------------------------------------------------------
create table public.site_settings (
  id smallint primary key default 1 check (id = 1),
  company_name text not null,
  slogan text,
  phone text,
  whatsapp text,
  email text,
  address text,
  city text,
  schedule text,
  facebook_url text,
  instagram_url text,
  linkedin_url text,
  tiktok_url text,
  seo_title text,
  seo_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users (id) on delete set null
);

create trigger site_settings_set_updated_at
  before update on public.site_settings
  for each row execute function public.set_updated_at();

-- ------------------------------------------------------------
-- company_content — bloques editables de contenido institucional
-- (secciones de Inicio y Nosotros). `data` guarda estructuras
-- como la lista de pilares. `internal_note` documenta contenido
-- en revisión editorial (no visible al público).
-- ------------------------------------------------------------
create table public.company_content (
  id uuid primary key default gen_random_uuid(),
  section_key text not null unique,
  title text,
  body text,
  data jsonb,
  status text not null default 'DRAFT' check (status in ('DRAFT', 'PUBLISHED')),
  internal_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users (id) on delete set null
);

create trigger company_content_set_updated_at
  before update on public.company_content
  for each row execute function public.set_updated_at();

-- ------------------------------------------------------------
-- product_categories
-- ------------------------------------------------------------
create table public.product_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users (id) on delete set null
);

create trigger product_categories_set_updated_at
  before update on public.product_categories
  for each row execute function public.set_updated_at();

-- ------------------------------------------------------------
-- products — catálogo (12 registros iniciales en DRAFT).
-- `features` es jsonb: [{ "label": "...", "value": "..." }, ...]
-- ------------------------------------------------------------
create table public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  short_description text,
  description text,
  category_id uuid references public.product_categories (id) on delete set null,
  main_image_id uuid references public.media_assets (id) on delete set null,
  features jsonb not null default '[]'::jsonb,
  presentation text,
  sort_order integer not null default 0,
  status text not null default 'DRAFT' check (status in ('DRAFT', 'PUBLISHED')),
  seo_title text,
  seo_description text,
  internal_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users (id) on delete set null
);

create index products_status_sort_idx on public.products (status, sort_order);
create index products_category_idx on public.products (category_id);

create trigger products_set_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

-- ------------------------------------------------------------
-- product_media — galería normalizada de productos (no jsonb).
-- Integridad referencial + orden de imágenes.
-- ------------------------------------------------------------
create table public.product_media (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  media_asset_id uuid not null references public.media_assets (id) on delete cascade,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  unique (product_id, media_asset_id)
);

create index product_media_product_sort_idx on public.product_media (product_id, sort_order);

-- ------------------------------------------------------------
-- blog_posts — artículos en Markdown (renderizado sanitizado).
-- ------------------------------------------------------------
create table public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  excerpt text,
  body text not null,
  cover_image_id uuid references public.media_assets (id) on delete set null,
  status text not null default 'DRAFT' check (status in ('DRAFT', 'PUBLISHED')),
  published_at timestamptz,
  seo_title text,
  seo_description text,
  internal_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users (id) on delete set null
);

create index blog_posts_status_published_idx on public.blog_posts (status, published_at desc);

create trigger blog_posts_set_updated_at
  before update on public.blog_posts
  for each row execute function public.set_updated_at();

-- ------------------------------------------------------------
-- faqs — preguntas frecuentes. `featured` marca las destacadas
-- que aparecen en la página de Inicio.
-- ------------------------------------------------------------
create table public.faqs (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  answer text not null,
  sort_order integer not null default 0,
  status text not null default 'DRAFT' check (status in ('DRAFT', 'PUBLISHED')),
  featured boolean not null default false,
  internal_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users (id) on delete set null
);

create index faqs_status_sort_idx on public.faqs (status, sort_order);

create trigger faqs_set_updated_at
  before update on public.faqs
  for each row execute function public.set_updated_at();
