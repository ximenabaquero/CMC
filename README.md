# Sitio corporativo — Compañía Mundial de Comercio S.A.S.

Sitio web corporativo con CMS propio para **Compañía Mundial de Comercio S.A.S.**,
empresa colombiana dedicada a la producción y distribución de margarinas,
mantequillas y aceites.

## Stack

| Función | Tecnología |
|---|---|
| Aplicación full-stack | Next.js 15 (App Router) + TypeScript estricto + Tailwind CSS v4 |
| Base de datos y auth | Supabase (PostgreSQL + Auth) con Row Level Security |
| Runtime en producción | Cloudflare Workers vía `@opennextjs/cloudflare` |
| Imágenes del CMS | Cloudflare R2 (binding `MEDIA_BUCKET`); adaptador local en desarrollo |
| Caché | SSG + revalidación bajo demanda (R2 incremental cache + D1 tag cache) |

Documentación completa en [docs/](docs/):

- [ARCHITECTURE.md](docs/ARCHITECTURE.md) — arquitectura y decisiones técnicas.
- [CMS_GUIDE.md](docs/CMS_GUIDE.md) — guía del panel para personas no técnicas.
- [CONTENT_PENDING.md](docs/CONTENT_PENDING.md) — contenido pendiente y en revisión editorial.
- [INFRASTRUCTURE.md](docs/INFRASTRUCTURE.md) — servicios, planes gratuitos, costos y backups.
- [DEPLOYMENT.md](docs/DEPLOYMENT.md) — procedimiento de despliegue futuro (sin tocar DNS/correo).
- [VERIFICATION_LOG.md](docs/VERIFICATION_LOG.md) — registro de verificaciones técnicas.

## Desarrollo local

Requisitos: Node.js 20+, npm y un proyecto de Supabase (gratuito).

```powershell
npm install
Copy-Item .env.example .env.local   # completar las variables de Supabase
npm run dev                          # http://localhost:3000
```

### Configurar la base de datos

En el SQL Editor del proyecto de Supabase (o con `supabase db push`), ejecutar en orden:

1. `supabase/migrations/0001_schema.sql`
2. `supabase/migrations/0002_rls.sql`
3. `supabase/seed.sql`
4. (Verificación) `supabase/tests/rls_checks.sql` — debe terminar con
   «TODAS LAS PRUEBAS RLS PASARON».

Después, **deshabilitar el registro público**: Authentication → Sign In / Up →
desactivar “Allow new users to sign up”.

### Crear el primer administrador

Sin contraseñas fijas en el código. Ver el procedimiento paso a paso en
[docs/CMS_GUIDE.md](docs/CMS_GUIDE.md#crear-el-primer-administrador).

### Importar los activos oficiales del cliente

Los logos e imágenes de producto entregados por el cliente se importan con:

```powershell
npm run import-assets -- --source="RUTA\Página web CMC"
```

El script valida la carpeta, lista lo que importará, no sobrescribe sin
`--force`, pre-dimensiona a WebP (máx. 1200 px) y genera
`scripts/assets-manifest.json`. Los archivos quedan en `public/brand/` y
`public/images/products/` (proveedor `STATIC` en `media_assets`).

## Scripts

| Comando | Descripción |
|---|---|
| `npm run dev` | Desarrollo local |
| `npm run build` | Build de producción de Next.js |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript sin emitir |
| `npm run preview` | Build de OpenNext + preview en el runtime real de Workers |
| `npm run deploy` | Despliegue a Cloudflare (NO usar hasta aprobar la publicación) |
| `npm run cf-typegen` | Regenera los tipos de los bindings de Cloudflare |
| `npm run import-assets` | Importa los activos oficiales del cliente |

## Variables de entorno

Ver [.env.example](.env.example). Nunca subir `.env.local` ni claves al
repositorio. En producción, las variables sensibles se configuran como
secretos de wrangler (`npx wrangler secret put NOMBRE`).

## Advisories conocidas

`npm audit` reporta vulnerabilidades en `postcss` y `sharp` **empaquetados
dentro de next@15** (solo se corrigen en Next 16, fuera del alcance acordado).
Ambos son dependencias de build: `sharp` no se ejecuta en Workers (imágenes
`unoptimized`) y `postcss` solo corre al compilar. Revisar al planear la
actualización mayor de Next.
