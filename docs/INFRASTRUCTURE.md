# Infraestructura, planes gratuitos y costos

Todas las cuentas productivas deben quedar **a nombre de la empresa
cliente** (correo corporativo). No se usan tarjetas, credenciales ni
cuentas personales de la desarrolladora. Si en el futuro se superan los
límites gratuitos, el cliente asume directamente los costos.

## Qué servicio cumple cada función

| Servicio | Función | Plan inicial |
|---|---|---|
| Supabase (proyecto) | Base de datos PostgreSQL + autenticación del panel | Free |
| Cloudflare Workers | Ejecuta la aplicación (sitio + panel) | Workers Free |
| Cloudflare R2 (bucket `cmc-website-media`) | Imágenes subidas desde el CMS | R2 Free |
| Cloudflare R2 (bucket `cmc-website-cache`) | Caché incremental de páginas generadas | R2 Free |
| Cloudflare D1 (`cmc-website-tags`) | Tag cache para revalidación bajo demanda | D1 Free |
| Dominio del cliente | DNS gestionado en Cloudflare (a futuro) | Ya lo paga el cliente |

## Qué incluye el plan gratuito (valores vigentes a agosto de 2026 — verificar antes de desplegar)

- **Supabase Free**: 500 MB de base, 50 000 usuarios auth, 5 GB de
  transferencia. **Los proyectos se pausan tras ~1 semana sin actividad** y
  se restauran con un clic. Sin copias de seguridad automáticas.
  Mitigación: el workflow de GitHub Actions
  `.github/workflows/supabase-keep-alive.yml` ejecuta
  `supabase_keep_alive.py` tres veces al día (consulta `select` con la clave
  anon a `site_settings` vía PostgREST). Requiere los secretos
  `SUPABASE_URL`, `SUPABASE_ANON_KEY` y `SUPABASE_TABLE` en el repositorio
  de GitHub. Reduce el riesgo de pausa pero no lo elimina por contrato; la
  única garantía es Supabase Pro.
- **Workers Free**: 100 000 solicitudes/día, 10 ms de CPU por solicitud,
  tamaño del Worker ≤ 3 MB comprimido (el nuestro: ~0,9 MB base; ver
  VERIFICATION_LOG.md).
- **R2 Free**: 10 GB de almacenamiento, 1 M operaciones clase A y 10 M
  clase B al mes. Sin costo de egreso.
- **D1 Free**: 5 GB, 5 M lecturas/día y 100 000 escrituras/día (el tag
  cache usa una fracción mínima).

## Qué situaciones podrían generar un costo

- Tráfico sostenido por encima de 100 000 solicitudes/día → Workers Paid
  (5 USD/mes aprox.).
- Más de 10 GB en imágenes subidas al CMS → R2 cobra por GB adicional.
- Base de datos > 500 MB o necesidad de backups automáticos / que el
  proyecto no se pause → Supabase Pro (25 USD/mes aprox.).
- Optimización de imágenes con Cloudflare Images (NO activada; requiere
  autorización del cliente).

La aplicación **no cambia** al pasar a planes pagos: son los mismos
servicios con límites mayores (sin reescritura).

## Cómo revisar el consumo

- Supabase: Dashboard → proyecto → **Usage**.
- Cloudflare: Dashboard → **Workers & Pages → métricas del Worker**,
  **R2 → bucket → Metrics**, **D1 → base → Metrics**.
- Recomendado: activar alertas de facturación en Cloudflare (Billing →
  Notifications) y revisar Usage de Supabase una vez al mes.

## Cómo transferir o administrar las cuentas

1. Crear las cuentas de Supabase y Cloudflare con un **correo corporativo
   de la empresa** (p. ej. administracion@…): así nacen a nombre del
   cliente y no hay que transferirlas.
2. Si ya existieran en una cuenta de la desarrolladora:
   - Supabase: crear una organización de la empresa e invitar/transferir el
     proyecto (Organization settings → Transfer project), o exportar el
     esquema+datos y recrearlo.
   - Cloudflare: el dominio se agrega en la cuenta del cliente; el Worker,
     los buckets R2 y la base D1 se recrean con `wrangler` en esa cuenta
     (los nombres están en `wrangler.jsonc`).
3. La desarrolladora puede quedar como **miembro invitado** con el mínimo
   permiso necesario para mantenimiento, revocable por el cliente.

## Copias de seguridad

- **Base de datos**: en el plan Free no hay backups automáticos. Antes de
  cada ronda de cambios importantes, exportar desde SQL Editor o con
  `supabase db dump` (CLI). Guardar el archivo `.sql` en el almacenamiento
  de la empresa. El seed y las migraciones del repositorio permiten
  reconstruir la estructura y el contenido inicial en cualquier momento.
- **Imágenes del CMS (R2)**: descargar periódicamente con
  `rclone` o `wrangler r2 object get` (o desde el dashboard). Los activos
  oficiales están además versionados en el repositorio git.
- **Código**: repositorio git (recomendado: remoto privado en GitHub de la
  cuenta de la empresa o compartido con ella).

## Reglas

- No se programan mecanismos artificiales para evadir límites o el pausado
  por inactividad (prohibido por términos de servicio y por el acuerdo).
- Las claves (`anon`, `service_role`, tokens de Cloudflare) nunca se suben
  al repositorio; en producción van como secretos de wrangler.
