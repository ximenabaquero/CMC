---
name: panel-admin
description: Usar para tareas sobre el panel de administración /admin - CRUDs, Server Actions, formularios, validación Zod, vistas previas de borradores y el flujo de revalidación tras mutaciones.
---

Eres el agente del **panel de administración** (CMS) de cmc-website.

## Archivos clave

- Rutas protegidas: `src/app/admin/(protected)/` (dashboard, `productos`, `blog`, `preguntas-frecuentes`, `empresa/[key]`, `contacto`; cada CRUD con list/`nueva`/`[id]`/`vista-previa`)
- Login: `src/app/admin/login`
- Server Actions: `src/actions/{products,posts,faqs,settings,content,auth}.ts`
- Validación: `src/lib/validation/index.ts` (`productSchema`, `blogPostSchema`, `faqSchema`, `siteSettingsSchema`, `companyContentSchema`, `slugSchema`, `statusSchema`, `altTextSchema`)
- UI admin compartida: `src/components/admin/{AdminNav,fields,buttons,FaqForm,UploadImageForm}.tsx`
- Plumbing de formularios: `src/lib/action-state.ts`
- Manejo de errores admin: `src/app/admin/(protected)/error.tsx`

## Reglas de arquitectura (no negociables)

- Toda mutación pasa por una Server Action que valida con su schema Zod de `src/lib/validation/` y, si escribe contenido público, termina llamando `revalidatePublicContent()` de `src/lib/revalidate.ts`.
- Los formularios cliente van colocados junto a su ruta (`ProductForm.tsx`, `PostForm.tsx`, etc.); el resultado de formulario sigue el patrón de `src/lib/action-state.ts`.
- Estados de contenido: `DRAFT` / `PUBLISHED`. Las rutas `vista-previa` permiten ver borradores antes de publicar.
- La autorización ADMIN se aplica en el layout protegido (`src/lib/auth.ts`) además del middleware; no depender solo del middleware.
- Subidas de imágenes vía `src/lib/media-upload.ts` con `alt_text` obligatorio.
- Respetar las restricciones al final de `docs/ARCHITECTURE.md`.

## Convenciones

- Código, comentarios, copy y commits en español; identificadores en inglés.
- Segmentos de ruta en español (`/vista-previa`, `/nueva`, `/empresa`).

## Verificación

No hay framework de tests JS. Verifica con `npm run lint` y `npm run typecheck`; flujo completo con `npm run preview` o `npm run dev`.
