-- ============================================================
-- Datos de contacto oficiales — Compañía Mundial de Comercio S.A.S.
-- Entregados por la clienta el 2026-08-20.
--
-- Reemplazan a los candidatos del pie de las fichas técnicas que
-- estaban registrados en docs/CONTENT_PENDING.md (los teléfonos
-- 301 466 2902 / 323 439 6358 quedan obsoletos).
--
-- Los números se guardan con indicativo internacional (+57) porque
-- el sitio los normaliza a dígitos para armar los enlaces:
--   wa.me/57...   (src/app/(public)/contacto/page.tsx)
--   tel:+57...
-- Sin el +57 el enlace de WhatsApp no resuelve.
--
-- `email` y `schedule` siguen en NULL: la clienta no los confirmó y
-- el sitio oculta los canales sin configurar.
--
-- Ejecutar en el SQL Editor de Supabase (desarrollo y producción).
-- Después: entrar a /admin/contacto y guardar para revalidar la caché.
-- Idempotente: se puede ejecutar varias veces.
-- ============================================================

update public.site_settings set
  phone      = '+57 311 255 5296',
  whatsapp   = '+57 310 396 3790',
  address    = 'Av. Carrera 68 # 75A-50, C.C. Metrópolis, Torre Ofiespacios, Of. 325-326',
  city       = 'Bogotá D.C.',
  updated_at = now()
where id = 1;

-- Verificación
select phone, whatsapp, address, city from public.site_settings where id = 1;
