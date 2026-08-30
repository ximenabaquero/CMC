"use client";

import { useActionState, useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { updatePost } from "@/actions/posts";
import { initialActionState } from "@/lib/action-state";
import type { BlogPost } from "@/lib/supabase/types";
import { ActionFeedback, StatusField, TextAreaField, TextField } from "@/components/admin/fields";
import { SubmitButton } from "@/components/admin/buttons";
import { useActionToast } from "@/components/admin/toast";
import { InsertMarkdownProvider } from "@/components/admin/markdown-insert";
import { useAdminForm } from "@/components/admin/useAdminForm";
import { FormFooter } from "@/components/admin/FormFooter";
import { Markdown } from "@/lib/markdown";

/**
 * `children` = la sección «Imágenes dentro del artículo», renderizada en
 * el servidor y colocada FUERA del <form> (sus botones son formularios
 * propios). Llega hasta aquí para quedar bajo el mismo proveedor que
 * expone la inserción en el cursor del textarea.
 */
export function PostForm({ post, children }: { post: BlogPost; children?: ReactNode }) {
  const action = updatePost.bind(null, post.id);
  const [state, formAction] = useActionState(action, initialActionState);
  useActionToast(state);
  const { formProps, dirty } = useAdminForm(state);
  const [body, setBody] = useState(post.body);
  const [showPreview, setShowPreview] = useState(false);
  const bodyRef = useRef<HTMLTextAreaElement>(null);
  // Última posición del cursor conocida. Se registra al mover el cursor
  // porque al subir una imagen el foco se va del textarea; si nunca se
  // tocó el texto, la imagen se añade al final en vez de al principio.
  const lastCaret = useRef<number | null>(null);
  // Posición del cursor pendiente de aplicar: el textarea es controlado,
  // así que hay que esperar al re-render para moverlo.
  const pendingCaret = useRef<number | null>(null);
  const fieldErrors = state.fieldErrors ?? {};

  useEffect(() => {
    if (pendingCaret.current === null) return;
    const textarea = bodyRef.current;
    if (textarea) {
      textarea.focus();
      textarea.setSelectionRange(pendingCaret.current, pendingCaret.current);
    }
    pendingCaret.current = null;
  }, [body]);

  /**
   * Inserta un bloque de Markdown donde está el cursor, separado por
   * líneas en blanco (si no, Markdown lo pegaría al párrafo). Si estaba
   * abierta la vista previa, vuelve al modo edición para que se vea.
   */
  const insertAtCursor = useCallback(
    (markdown: string) => {
      const at = Math.min(lastCaret.current ?? body.length, body.length);
      const before = body.slice(0, at).replace(/\s+$/, "");
      const after = body.slice(at).replace(/^\s+/, "");
      const head = before ? `${before}\n\n${markdown}` : markdown;

      setShowPreview(false);
      setBody(after ? `${head}\n\n${after}` : `${head}\n`);
      lastCaret.current = head.length;
      pendingCaret.current = head.length;
      // El hook marca «cambios sin guardar» por evento del formulario, y
      // esta escritura es programática.
      formProps.onInput();
    },
    [body, formProps]
  );

  const form = (
    <form
      {...formProps}
      action={formAction}
      className="space-y-4 rounded-lg border border-border bg-surface p-5"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          label="Título"
          name="title"
          defaultValue={post.title}
          required
          maxLength={180}
          error={fieldErrors.title?.[0]}
        />
        <TextField
          label="Slug (dirección web)"
          name="slug"
          defaultValue={post.slug}
          required
          hint="Solo minúsculas, números y guiones."
          error={fieldErrors.slug?.[0]}
        />
      </div>

      <TextAreaField
        label="Resumen"
        name="excerpt"
        defaultValue={post.excerpt}
        rows={2}
        maxLength={300}
        hint="Se muestra en la lista del blog y en los buscadores."
        error={fieldErrors.excerpt?.[0]}
      />

      <div>
        <div className="mb-1 flex items-center justify-between">
          <label htmlFor="body" className="block text-sm font-medium">
            Contenido *
          </label>
          <button
            type="button"
            onClick={() => setShowPreview((v) => !v)}
            className="min-h-10 rounded-md border border-border px-2.5 py-1 text-sm hover:bg-surface-muted"
            aria-pressed={showPreview}
          >
            {showPreview ? "Volver a editar" : "Ver cómo se verá"}
          </button>
        </div>
        {showPreview ? (
          <div className="rounded-md border border-border bg-background p-4">
            <Markdown>{body}</Markdown>
          </div>
        ) : (
          <textarea
            id="body"
            name="body"
            ref={bodyRef}
            required
            rows={18}
            value={body}
            onChange={(e) => {
              setBody(e.target.value);
              lastCaret.current = e.target.selectionStart;
            }}
            onSelect={(e) => {
              lastCaret.current = e.currentTarget.selectionStart;
            }}
            aria-invalid={fieldErrors.body ? true : undefined}
            aria-describedby={fieldErrors.body ? "body-error" : undefined}
            className="w-full rounded-md border border-border bg-surface px-3 py-2 font-mono text-sm"
          />
        )}
        {/* El contenido viaja siempre, incluso en modo vista previa */}
        {showPreview ? <input type="hidden" name="body" value={body} /> : null}
        {fieldErrors.body ? (
          <p id="body-error" className="mt-1 text-sm text-accent">
            {fieldErrors.body[0]}
          </p>
        ) : null}
        <p className="mt-1 text-xs text-muted-foreground">
          Formato: escribe párrafos normales. Para un subtítulo usa «## Subtítulo», para negrita
          «**texto**» y para listas comienza la línea con «- ». Para poner una foto dentro del
          texto, súbela abajo en «Imágenes dentro del artículo» y pulsa «Insertar en el texto»
          con el cursor donde quieras que aparezca.
        </p>
      </div>

      <fieldset className="rounded-md border border-border p-4">
        <legend className="px-1 text-sm font-semibold">SEO (opcional)</legend>
        <div className="grid gap-4">
          <TextField
            label="Título SEO"
            name="seo_title"
            defaultValue={post.seo_title}
            maxLength={70}
            hint="Si se deja vacío se usa el título del artículo."
            error={fieldErrors.seo_title?.[0]}
          />
          <TextAreaField
            label="Descripción SEO"
            name="seo_description"
            defaultValue={post.seo_description}
            rows={2}
            maxLength={170}
            error={fieldErrors.seo_description?.[0]}
          />
        </div>
      </fieldset>

      <StatusField defaultValue={post.status} error={fieldErrors.status?.[0]} />

      <ActionFeedback state={state} />
      <FormFooter dirty={dirty}>
        <SubmitButton>Guardar cambios</SubmitButton>
      </FormFooter>
    </form>
  );

  return (
    <InsertMarkdownProvider insert={insertAtCursor}>
      {form}
      {children}
    </InsertMarkdownProvider>
  );
}
