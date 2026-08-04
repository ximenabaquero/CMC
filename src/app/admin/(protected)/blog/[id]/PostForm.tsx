"use client";

import { useActionState, useState } from "react";
import { updatePost } from "@/actions/posts";
import { initialActionState } from "@/lib/action-state";
import type { BlogPost } from "@/lib/supabase/types";
import { ActionFeedback, StatusField, TextAreaField, TextField } from "@/components/admin/fields";
import { SubmitButton } from "@/components/admin/buttons";
import { Markdown } from "@/lib/markdown";

export function PostForm({ post }: { post: BlogPost }) {
  const action = updatePost.bind(null, post.id);
  const [state, formAction] = useActionState(action, initialActionState);
  const [body, setBody] = useState(post.body);
  const [showPreview, setShowPreview] = useState(false);

  return (
    <form action={formAction} className="space-y-4 rounded-lg border border-border bg-surface p-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField label="Título" name="title" defaultValue={post.title} required maxLength={180} />
        <TextField
          label="Slug (dirección web)"
          name="slug"
          defaultValue={post.slug}
          required
          hint="Solo minúsculas, números y guiones."
        />
      </div>

      <TextAreaField
        label="Resumen"
        name="excerpt"
        defaultValue={post.excerpt}
        rows={2}
        maxLength={300}
        hint="Se muestra en la lista del blog y en los buscadores."
      />

      <div>
        <div className="mb-1 flex items-center justify-between">
          <label htmlFor="body" className="block text-sm font-medium">
            Contenido *
          </label>
          <button
            type="button"
            onClick={() => setShowPreview((v) => !v)}
            className="rounded-md border border-border px-2 py-1 text-xs hover:bg-surface-muted"
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
            required
            rows={18}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="w-full rounded-md border border-border bg-surface px-3 py-2 font-mono text-sm"
          />
        )}
        {/* El contenido viaja siempre, incluso en modo vista previa */}
        {showPreview ? <input type="hidden" name="body" value={body} /> : null}
        <p className="mt-1 text-xs text-muted-foreground">
          Formato: escribe párrafos normales. Para un subtítulo usa «## Subtítulo», para negrita
          «**texto**» y para listas comienza la línea con «- ».
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
          />
          <TextAreaField
            label="Descripción SEO"
            name="seo_description"
            defaultValue={post.seo_description}
            rows={2}
            maxLength={170}
          />
        </div>
      </fieldset>

      <StatusField defaultValue={post.status} />

      <ActionFeedback success={state.success} error={state.error} />
      <SubmitButton>Guardar cambios</SubmitButton>
    </form>
  );
}
