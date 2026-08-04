# Despliegue (procedimiento FUTURO — no ejecutado en esta fase)

Condiciones previas (acuerdo de la reunión 1, puntos 10-11):

1. La página fue revisada y aprobada por el cliente en el enlace de pruebas.
2. Se recibió el pago del saldo final.
3. Ana coordinó con el propietario de la empresa el acceso al dominio.

**En esta fase NO se despliega, NO se conecta el dominio y NO se cambian
registros DNS.**

## 1. Preparar cuentas (a nombre del cliente)

- Cuenta de Cloudflare con correo corporativo del cliente.
- Cuenta/organización de Supabase con correo corporativo del cliente.

## 2. Supabase de producción

1. Crear el proyecto (región más cercana: São Paulo `sa-east-1`).
2. Ejecutar en orden: `supabase/migrations/0001_schema.sql`,
   `0002_rls.sql`, `supabase/seed.sql`.
3. Ejecutar `supabase/tests/rls_checks.sql` → debe terminar en
   «TODAS LAS PRUEBAS RLS PASARON».
4. Deshabilitar el registro público (Authentication → Sign In / Up →
   «Allow new users to sign up» OFF).
5. Crear el primer administrador (docs/CMS_GUIDE.md).

## 3. Recursos de Cloudflare

Con `wrangler` autenticado en la cuenta del cliente:

```powershell
npx wrangler r2 bucket create cmc-website-media
npx wrangler r2 bucket create cmc-website-cache
npx wrangler d1 create cmc-website-tags   # copiar database_id a wrangler.jsonc (env.production)
```

Configurar secretos y variables del entorno productivo:

```powershell
npx wrangler secret put NEXT_PUBLIC_SUPABASE_URL --env production
npx wrangler secret put NEXT_PUBLIC_SUPABASE_ANON_KEY --env production
# (la clave service_role NO se sube al Worker: no se usa en operación normal)
```

Actualizar en `wrangler.jsonc` → `env.production`:
`NEXT_PUBLIC_SITE_URL` con el dominio definitivo y el `database_id` de D1.

## 4. Desplegar

```powershell
npm run preview                          # prueba local en runtime Workers
npx opennextjs-cloudflare build
npx opennextjs-cloudflare deploy -- --env production
```

Verificar en la URL `workers.dev` antes de tocar el dominio.

## 5. Dominio y correo — REGLAS ESTRICTAS

La empresa ya usa su dominio con **correos corporativos activos**. Por tanto:

- **NO** eliminar ni modificar registros **MX**.
- **NO** cambiar configuraciones de correo.
- **NO** tocar **SPF, DKIM ni DMARC** sin autorización escrita.
- Solicitar acceso al DNS **solo** cuando la publicación esté aprobada y
  pagada.

### 5.1 Inspección previa (obligatoria, de solo lectura)

Antes de cualquier cambio, documentar el estado actual:

```powershell
nslookup -type=NS dominio.com
nslookup -type=MX dominio.com
nslookup -type=TXT dominio.com          # SPF/verificaciones
nslookup -type=TXT _dmarc.dominio.com
nslookup -type=A dominio.com
nslookup -type=CNAME www.dominio.com
```

Guardar la salida completa (captura + texto) como respaldo.

### 5.2 Registros web a agregar (lo ÚNICO que se toca)

Dos escenarios:

- **A. El DNS ya está (o se migra) en Cloudflare**: al migrar,
  Cloudflare importa los registros existentes — verificar que TODOS los
  registros de correo (MX/TXT) queden idénticos antes de cambiar los
  nameservers. Luego, en el Worker: **Settings → Domains & Routes → Add
  custom domain** para `dominio.com` y `www.dominio.com` (Cloudflare crea
  los registros automáticamente).
- **B. El DNS permanece donde está**: no es posible usar Custom Domains de
  Workers sin la zona en Cloudflare; coordinar la migración de zona (opción
  A) o publicar temporalmente en `workers.dev` hasta autorizarla.

### 5.3 Verificación posterior

1. Repetir la inspección DNS y comparar: los registros de correo deben
   estar **idénticos**.
2. Enviar y recibir un correo de prueba con una cuenta corporativa.
3. Verificar `https://dominio.com`, `https://www.dominio.com`, `/admin`,
   sitemap y robots.
4. Actualizar `NEXT_PUBLIC_SITE_URL` si cambió y redesplegar.

## 6. Entrega

- Accesos de Supabase y Cloudflare en manos del cliente.
- Credencial del administrador entregada por canal seguro.
- Registrar fecha de publicación y estado en docs/VERIFICATION_LOG.md.
