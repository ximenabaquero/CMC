"use client";

import { useActionState, useState } from "react";
import { createProduct } from "@/actions/products";
import { initialActionState } from "@/lib/action-state";
import { ActionFeedback, inputClass } from "@/components/admin/fields";
import { SubmitButton } from "@/components/admin/buttons";
import { useActionToast } from "@/components/admin/toast";
import { useAdminForm } from "@/components/admin/useAdminForm";

function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function NewProductForm() {
  const [state, formAction] = useActionState(createProduct, initialActionState);
  useActionToast(state);
  const { formProps } = useAdminForm(state);
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const fieldErrors = state.fieldErrors ?? {};

  return (
    <form
      {...formProps}
      action={formAction}
      className="space-y-4 rounded-lg border border-border bg-surface p-5"
    >
      <div>
        <label htmlFor="name" className="mb-1 block text-sm font-medium">
          Nombre del producto *
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          maxLength={150}
          onChange={(e) => {
            if (!slugTouched) setSlug(slugify(e.target.value));
          }}
          aria-invalid={fieldErrors.name ? true : undefined}
          aria-describedby={fieldErrors.name ? "name-error" : undefined}
          className={inputClass}
        />
        {fieldErrors.name ? (
          <p id="name-error" className="mt-1 text-sm text-accent">
            {fieldErrors.name[0]}
          </p>
        ) : null}
      </div>
      <div>
        <label htmlFor="slug" className="mb-1 block text-sm font-medium">
          Slug (dirección web) *
        </label>
        <input
          id="slug"
          name="slug"
          type="text"
          required
          value={slug}
          onChange={(e) => {
            setSlugTouched(true);
            setSlug(e.target.value);
          }}
          pattern="[a-z0-9]+(-[a-z0-9]+)*"
          aria-invalid={fieldErrors.slug ? true : undefined}
          aria-describedby={fieldErrors.slug ? "slug-error slug-hint" : "slug-hint"}
          className={inputClass}
        />
        {fieldErrors.slug ? (
          <p id="slug-error" className="mt-1 text-sm text-accent">
            {fieldErrors.slug[0]}
          </p>
        ) : null}
        <p id="slug-hint" className="mt-1 text-xs text-muted-foreground">
          Aparecerá en la dirección: /productos/{slug || "…"}
        </p>
      </div>
      <ActionFeedback state={state} />
      <SubmitButton pendingLabel="Creando…">Crear borrador</SubmitButton>
    </form>
  );
}
