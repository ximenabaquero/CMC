---
name: panel-admin
description: Usar para tareas sobre el panel de administración /admin - CRUDs, Server Actions, formularios, validación Zod, vistas previas de borradores y el flujo de revalidación tras mutaciones.
---

Eres el agente del **panel de administración** (CMS) de cmc-website.

## Archivos clave

- Rutas protegidas: `src/app/admin/(protected)/` (dashboard, `productos`, `blog`, `marcas`, `preguntas-frecuentes`, `empresa/[key]`, `contacto`; cada CRUD con list/`nueva`/`[id]`/`vista-previa`)
- Login: `src/app/admin/login`
- Server Actions: `src/actions/{products,posts,brands,faqs,settings,content,auth}.ts`
- Validación: `src/lib/validation/index.ts` (`productSchema`, `blogPostSchema`, `brandSchema`, `faqSchema`, `siteSettingsSchema`, `companyContentSchema`, `slugSchema`, `statusSchema`, `altTextSchema`, `documentNameSchema`)
- UI admin compartida: `src/components/admin/{AdminNav,fields,buttons,FaqForm,UploadImageForm,UploadDocumentForm,AltTextForm}.tsx`
- Feedback global: `src/components/admin/toast.tsx` (`ToastProvider` montado en el layout protegido, `useToast`, `useActionToast`), `FlashToast.tsx` (toast tras redirect vía query param), `ActionForm.tsx` (form cliente genérico para acciones sin campos)
- Componentes de consistencia visual: `src/components/admin/{StatusBadge,PageHeader,EmptyState,useUnsavedChanges}.tsx` y `src/app/admin/(protected)/loading.tsx`
- Plumbing de formularios: `src/lib/action-state.ts`
- Manejo de errores admin: `src/app/admin/(protected)/error.tsx` (solo fallos de carga de página; las Server Actions ya no lanzan hacia el usuario)

## Reglas de arquitectura (no negociables)

- Toda mutación pasa por una Server Action que valida con su schema Zod de `src/lib/validation/` y, si escribe contenido público, termina llamando `revalidatePublicContent()` de `src/lib/revalidate.ts`.
- **Contrato de Server Actions**: toda action devuelve `ActionState { status: "idle"|"success"|"error"; message; fieldErrors?; ts? }` construido con los helpers `actionSuccess(message | null)` / `actionError(message, fieldErrors?)` / `zodActionError(error)` de `src/lib/action-state.ts`. Las actions **nunca** devuelven `void` ni lanzan errores hacia el usuario (los deletes hacen `redirect()` en éxito y devuelven `actionError` en fallo). `actionSuccess(null)` = éxito silencioso sin toast (ej. reordenar galería). El campo `ts` (Date.now del servidor) es el anti-duplicado del toast: sin `ts` no se notifica. **Todo update comprueba filas afectadas**: se encadena `.select("id")` y, si no vuelve ninguna fila (RLS filtra en silencio con `error: null`), se devuelve `actionError(NO_ROWS_MESSAGE)` sin revalidar — nunca un éxito en falso (añadido 2026-08-20 tras diagnóstico en producción).
- **Política de feedback**: éxito → toast (verde, `useActionToast`); error de formulario → toast + `ActionFeedback` inline persistente + errores por campo (`fieldErrors` → prop `error` de `TextField`/`TextAreaField`/`SelectField`, con `aria-invalid`/`aria-describedby`); error en botones sin formulario visible (galería, deletes, quitar logo/portada/ficha) → solo toast, cableado con `<ActionForm>`. Los redirects de crear/eliminar muestran su confirmación con `<FlashToast>` (lee `?creado=1`/`?eliminado=1` desde el server page y limpia la URL con `history.replaceState`). Prohibidos los modales de éxito; `window.confirm` sigue siendo la confirmación previa de eliminaciones (`ConfirmSubmitButton`).
- Los formularios cliente van colocados junto a su ruta (`ProductForm.tsx`, `PostForm.tsx`, etc.); consumen la action con `useActionState`, disparan `useActionToast(state)` y los de edición muestran "Cambios sin guardar" con `useUnsavedChanges`.
- Estados de contenido: `DRAFT` / `PUBLISHED`. Las rutas `vista-previa` permiten ver borradores antes de publicar.
- La autorización ADMIN se aplica en el layout protegido (`src/lib/auth.ts`) además del middleware; no depender solo del middleware.
- Subidas de imágenes vía `src/lib/media-upload.ts` con `alt_text` obligatorio; fichas técnicas PDF vía `src/lib/document-upload.ts` (clases de medio separadas, no mezclarlas).
- Galería de producto: invariante «posición 0 = imagen principal (la caja)». `setProductMainImage`, `moveProductImage` y `removeProductImage` llaman a las funciones SQL atómicas de la migración 0004 (`set_product_main_image`, `swap_product_media_order`, `remove_product_media_entry`) — no reimplementar ese flujo con updates sueltos. `updateMediaAltText` edita el alt; `uploadTechnicalSheet`/`removeTechnicalSheet` gestionan el PDF del producto con limpieza de huérfanos (`deleteAssetIfOrphan` considera galerías, `main_image_id` y `technical_sheet_media_id`).
- Miniaturas de producto en el admin: lienzo blanco + `object-contain` (igual que el público; el empaque no se recorta).
- Imágenes dentro del cuerpo de un artículo (2026-08-21): `uploadPostImage` / `removePostImage` en `src/actions/posts.ts` sobre la tabla `post_media` (migración 0005). `removePostImage` se **niega** si la URL del activo sigue apareciendo en `blog_posts.body` (borrarla dejaría una imagen rota) y `deletePost` limpia los archivos del cuerpo además de la portada. La colocación en el texto la hace el cliente: `PostForm` recibe la sección de imágenes como `children` —fuera de su `<form>`, porque subir/quitar son formularios propios y no pueden anidarse— y abre el contexto de `src/components/admin/markdown-insert.tsx`, que el botón «Insertar en el texto» consume para escribir `![alt](url)` en el cursor. Tras una inserción programática hay que llamar a `formProps.onInput()` a mano: `useAdminForm` marca «cambios sin guardar» por evento, no por `setState`.
- Respetar las restricciones al final de `docs/ARCHITECTURE.md`.

## Convenciones

- Código, comentarios, copy y commits en español; identificadores en inglés.
- Segmentos de ruta en español (`/vista-previa`, `/nueva`, `/empresa`).

## Verificación

No hay framework de tests JS. Verifica con `npm run lint` y `npm run typecheck`; flujo completo con `npm run preview` o `npm run dev`.

## Mantenimiento del contexto

Si tu cambio agrega/renombra rutas admin, Server Actions o schemas Zod, actualiza **en el mismo turno**: este archivo y `docs/CMS_GUIDE.md` (si cambia el flujo que ve el editor). El cambio no está terminado si la documentación describe el estado anterior.
