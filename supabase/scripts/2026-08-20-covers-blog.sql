-- ============================================================
-- Portadas fotográficas para 3 de los 4 artículos del blog
-- (fotos entregadas por la clienta el 2026-08-20).
--
-- Requiere: los WebP ya versionados en public/images/blog/
--   (derivados con la receta del importador: máx. 1200 px, WebP q82).
--   Tamaños y dimensiones tomados de los archivos reales.
--
-- Ejecutar COMPLETO en el SQL Editor de Supabase (dev y producción).
-- Idempotente: re-ejecutarlo no duplica medios ni cambia portadas ya
-- asignadas a estas mismas fotos.
--
-- Sin UUID codificados: los artículos se resuelven por slug y los
-- medios por storage_path.
--
-- NO cubre «consejos-para-almacenar-materias-primas-en-panaderia»:
-- ese artículo sigue con la portada tipográfica `EditorialCover`
-- (ver docs/FOTOS_ADICIONALES.md).
-- ============================================================

begin;

-- Guarda: los 3 artículos deben existir y estar sin portada, o ya
-- apuntando a estas mismas fotos (re-ejecución).
do $$
declare
  v_slug text;
  v_path text;
  v_cover uuid;
  v_target uuid;
begin
  for v_slug, v_path in
    select * from (values
      ('amasijos-colombianos-tradicion-que-trasciende-generaciones', '/images/blog/amasijos-maiz-tabla-01.webp'),
      ('los-beneficios-de-comer-pan-mito-o-realidad', '/images/blog/panes-surtidos-canasta-01.webp'),
      ('el-arte-de-hacer-hojaldre', '/images/blog/hojaldre-capas-macro-01.webp')
    ) as v(slug, path)
  loop
    select cover_image_id into v_cover from public.blog_posts where slug = v_slug;
    if not found then
      raise exception 'No existe el artículo con slug %.', v_slug;
    end if;

    select id into v_target from public.media_assets where storage_path = v_path;

    if v_cover is not null and (v_target is null or v_cover <> v_target) then
      raise exception 'El artículo % ya tiene otra portada asignada (%). Revisar antes de sobrescribir.', v_slug, v_cover;
    end if;
  end loop;
end $$;

-- 1) Metadatos de las tres fotos (STATIC: la URL es la ruta bajo public/).
insert into public.media_assets
  (storage_provider, storage_path, file_name, mime_type, size_bytes, width, height, alt_text)
values
  ('STATIC', '/images/blog/amasijos-maiz-tabla-01.webp',
   'amasijos-maiz-tabla-01.webp', 'image/webp', 131960, 1200, 675,
   'Amasijos colombianos de maíz recién horneados sobre una tabla de madera'),
  ('STATIC', '/images/blog/panes-surtidos-canasta-01.webp',
   'panes-surtidos-canasta-01.webp', 'image/webp', 96592, 985, 555,
   'Canasta de mimbre con surtido de panes sobre un paño de lino blanco'),
  ('STATIC', '/images/blog/hojaldre-capas-macro-01.webp',
   'hojaldre-capas-macro-01.webp', 'image/webp', 61210, 1200, 801,
   'Corte de una masa de hojaldre que deja ver sus capas finas y crujientes')
on conflict (storage_path) do nothing;

-- 2) Asignación de portada por slug.
update public.blog_posts p
set cover_image_id = m.id
from (values
  ('amasijos-colombianos-tradicion-que-trasciende-generaciones', '/images/blog/amasijos-maiz-tabla-01.webp'),
  ('los-beneficios-de-comer-pan-mito-o-realidad', '/images/blog/panes-surtidos-canasta-01.webp'),
  ('el-arte-de-hacer-hojaldre', '/images/blog/hojaldre-capas-macro-01.webp')
) as v(slug, storage_path)
join public.media_assets m on m.storage_path = v.storage_path
where p.slug = v.slug
  and p.cover_image_id is distinct from m.id;

-- Verificación final: las 3 portadas apuntan a la foto correcta.
do $$
declare
  v_ok bigint;
begin
  select count(*) into v_ok
  from public.blog_posts p
  join public.media_assets m on m.id = p.cover_image_id
  join (values
    ('amasijos-colombianos-tradicion-que-trasciende-generaciones', '/images/blog/amasijos-maiz-tabla-01.webp'),
    ('los-beneficios-de-comer-pan-mito-o-realidad', '/images/blog/panes-surtidos-canasta-01.webp'),
    ('el-arte-de-hacer-hojaldre', '/images/blog/hojaldre-capas-macro-01.webp')
  ) as v(slug, storage_path) on v.slug = p.slug and v.storage_path = m.storage_path;

  if v_ok <> 3 then
    raise exception 'FALLO: % de 3 artículos quedaron con la portada esperada.', v_ok;
  end if;

  raise notice '=== 3 PORTADAS DE BLOG ASIGNADAS (amasijos, pan, hojaldre) ===';
end $$;

commit;

-- Tras ejecutar: el sitio SSG mostrará las portadas en el próximo
-- build/revalidación (o al guardar cualquier artículo desde el admin,
-- que dispara revalidatePublicContent()).
