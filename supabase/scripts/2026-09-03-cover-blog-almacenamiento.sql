-- ============================================================
-- Portada del cuarto artículo del blog: «Consejos para almacenar
-- adecuadamente las materias primas en panadería» (foto entregada
-- por la clienta el 2026-09-03).
--
-- Cierra el hueco que dejó abierto `2026-08-20-covers-blog.sql`: la
-- foto de croissants entregada entonces (325×245) era demasiado
-- pequeña y no hablaba del tema, así que el artículo se quedó con la
-- portada tipográfica `EditorialCover`. Esta sí es una escena de
-- almacenamiento — estantería metálica con sacos de harina, granos y
-- contenedores herméticos rotulados —, que es literalmente de lo que
-- trata el texto.
--
-- Requiere: el WebP ya versionado en
--   public/images/blog/almacen-materias-primas-01.webp
--   (derivado con la receta del importador: máx. 1200 px, WebP q82).
--   Tamaño y dimensiones tomados del archivo real.
--
-- Ejecutar COMPLETO en el SQL Editor de Supabase (dev y producción).
-- Idempotente: re-ejecutarlo no duplica el medio ni cambia una portada
-- ya asignada a esta misma foto.
--
-- Sin UUID codificados: el artículo se resuelve por slug y el medio por
-- storage_path.
--
-- ALTERNATIVA (la vía preferida por la usuaria desde el 2026-08-21):
-- subir el archivo desde /admin/blog/<artículo> → «Imagen de portada»,
-- hecho sobre el sitio publicado y no sobre `npm run dev`. Este script
-- es el respaldo, igual que su hermano del 2026-08-20.
-- ============================================================

begin;

-- Guarda: el artículo debe existir y estar sin portada, o ya apuntando
-- a esta misma foto (re-ejecución).
do $$
declare
  v_slug   constant text := 'consejos-para-almacenar-materias-primas-en-panaderia';
  v_path   constant text := '/images/blog/almacen-materias-primas-01.webp';
  v_cover  uuid;
  v_target uuid;
begin
  select cover_image_id into v_cover from public.blog_posts where slug = v_slug;
  if not found then
    raise exception 'No existe el artículo con slug %.', v_slug;
  end if;

  select id into v_target from public.media_assets where storage_path = v_path;

  if v_cover is not null and (v_target is null or v_cover <> v_target) then
    raise exception 'El artículo % ya tiene otra portada asignada (%). Revisar antes de sobrescribir.', v_slug, v_cover;
  end if;
end $$;

-- 1) Metadatos de la foto (STATIC: la URL es la ruta bajo public/).
insert into public.media_assets
  (storage_provider, storage_path, file_name, mime_type, size_bytes, width, height, alt_text)
values
  ('STATIC', '/images/blog/almacen-materias-primas-01.webp',
   'almacen-materias-primas-01.webp', 'image/webp', 122748, 1200, 675,
   'Bodega de materias primas de panadería con sacos de harina sobre estibas y contenedores herméticos de granos en estanterías metálicas')
on conflict (storage_path) do nothing;

-- 2) Asignación de portada por slug.
update public.blog_posts p
set cover_image_id = m.id
from public.media_assets m
where m.storage_path = '/images/blog/almacen-materias-primas-01.webp'
  and p.slug = 'consejos-para-almacenar-materias-primas-en-panaderia'
  and p.cover_image_id is distinct from m.id;

-- Verificación final.
do $$
declare
  v_ok bigint;
begin
  select count(*) into v_ok
  from public.blog_posts p
  join public.media_assets m on m.id = p.cover_image_id
  where p.slug = 'consejos-para-almacenar-materias-primas-en-panaderia'
    and m.storage_path = '/images/blog/almacen-materias-primas-01.webp';

  if v_ok <> 1 then
    raise exception 'FALLO: el artículo de almacenamiento no quedó con la portada esperada.';
  end if;

  raise notice '=== PORTADA DE BLOG ASIGNADA (almacenamiento de materias primas) ===';
  raise notice 'Los 4 artículos del blog ya tienen portada fotográfica.';
end $$;

commit;

-- Tras ejecutar: el sitio SSG mostrará la portada en el próximo
-- build/revalidación (o al guardar cualquier artículo desde el admin,
-- que dispara revalidatePublicContent()).
