"use client";

import { useActionState, useState } from "react";
import { createProduct } from "@/actions/products";
import { initialActionState } from "@/lib/action-state";
import { ActionFeedback } from "@/components/admin/fields";
import { SubmitButton } from "@/components/admin/buttons";

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
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);

  return (
    <form action={formAction} className="space-y-4 rounded-lg border border-border bg-surface p-5">
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
          className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm"
        />
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
          className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm"
        />
        <p className="mt-1 text-xs text-muted-foreground">
          Aparecerá en la dirección: /productos/{slug || "…"}
        </p>
      </div>
      <ActionFeedback success={state.success} error={state.error} />
      <SubmitButton>Crear borrador</SubmitButton>
    </form>
  );
}
