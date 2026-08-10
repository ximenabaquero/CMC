# Registro de verificaciones

Registro de las verificaciones técnicas ejecutadas durante el desarrollo.
Los límites del plan gratuito de Workers están documentados en
`docs/INFRASTRUCTURE.md`.

## 2026-08-04 — Fase 2: verificación temprana de límites de Cloudflare

Base del proyecto (Next.js 15.5.22 + OpenNext 1.20.2, sin Supabase ni markdown aún):

| Verificación | Resultado |
|---|---|
| `npx opennextjs-cloudflare build` (Windows 11) | OK |
| `npx wrangler deploy --dry-run --outdir bundled` | OK |
| Tamaño del Worker (gzip) | **884.29 KiB** de 3 MB permitidos (~29 %) |
| Tamaño del Worker (sin comprimir) | 4 183.75 KiB |
| Preview en runtime workerd (`npm run preview`) | HTTP 200 en `/` |
| Bindings resueltos | `NEXT_TAG_CACHE_D1` (D1), `NEXT_INC_CACHE_R2_BUCKET` (R2), `MEDIA_BUCKET` (R2), `ASSETS` |

Conclusión: margen amplio frente al límite de 3 MB gzip del plan gratuito.
Se repetirá la medición tras agregar `@supabase/supabase-js`, `@supabase/ssr`,
`zod` y el render de markdown (ver verificación final).

## 2026-08-10 — Rediseño visual de productos destacados en la home

Cambios: `HomeProductCard` (lienzo blanco uniforme, sin fondos por índice,
`object-contain` sin recortes, área de imagen de 288/320/360 px) y grid de la
home a 2 columnas máximo (2×2 con los 4 productos actuales). Header con logo
animado `cmc-logo-entrada-preview.gif` (bucle; estático con reduced motion).

| Verificación | Resultado |
|---|---|
| `npm run lint` / `npm run typecheck` | OK |
| `npm run build` (29 páginas estáticas) | OK |
| Home 1440 px (Chrome headless, screenshot) | Grid 2×2, lienzo blanco, packshots grandes, alturas consistentes |
| Home 500 px (layout móvil < `sm`) | 1 columna, sin desbordamiento horizontal, textos completos |
| Logo animado del header | Renderiza en dev; fallback estático vía `motion-reduce` |

Nota: los productos actuales solo cubren imágenes apaisadas con fondo propio;
los casos PNG transparente / vertical / fondo de color quedan cubiertos por
construcción (`object-contain` + alto fijo + lienzo blanco) y deben revisarse
visualmente cuando se suban archivos así desde el admin.
