"use client";

import { useActionState, useState } from "react";
import { updateProduct } from "@/actions/products";
import { initialActionState } from "@/lib/action-state";
import type { Product, ProductFeature } from "@/lib/supabase/types";
import {
  ActionFeedback,
  SelectField,
  StatusField,
  TextAreaField,
  TextField,
} from "@/components/admin/fields";
import { SubmitButton } from "@/components/admin/buttons";

export function ProductForm({
  product,
  categories,
}: {
  product: Product;
  categories: { id: string; name: string }[];
}) {
  const action = updateProduct.bind(null, product.id);
  const [state, formAction] = useActionState(action, initialActionState);
  const [features, setFeatures] = useState<ProductFeature[]>(product.features ?? []);

  return (
    <form action={formAction} className="space-y-4 rounded-lg border border-border bg-surface p-5">
      <input type="hidden" name="features_json" value={JSON.stringify(features)} />

      <div className="grid gap-4 sm:grid-cols-2">
        <TextField label="Nombre" name="name" defaultValue={product.name} required maxLength={150} />
        <TextField
          label="Slug (dirección web)"
          name="slug"
          defaultValue={product.slug}
          required
          hint="Solo minúsculas, números y guiones."
        />
      </div>

      <TextAreaField
        label="Descripción corta"
        name="short_description"
        defaultValue={product.short_description}
        rows={2}
        maxLength={300}
        hint="Se muestra en las tarjetas del catálogo."
      />

      <TextAreaField
        label="Descripción completa"
        name="description"
        defaultValue={product.description}
        rows={6}
        hint="Se muestra en la página del producto. Admite párrafos separados por línea en blanco."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <SelectField
          label="Categoría"
          name="category_id"
          defaultValue={product.category_id ?? ""}
          options={[
            { value: "", label: "Sin categoría" },
            ...categories.map((c) => ({ value: c.id, label: c.name })),
          ]}
        />
        <TextField
          label="Presentación"
          name="presentation"
          defaultValue={product.presentation}
          maxLength={300}
          hint="Ej.: Bloques de 15 kg en caja corrugada."
        />
        <TextField
          label="Orden"
          name="sort_order"
          type="number"
          defaultValue={String(product.sort_order)}
          hint="Menor número aparece primero."
        />
      </div>

      <fieldset className="rounded-md border border-border p-4">
        <legend className="px-1 text-sm font-semibold">Características</legend>
        <p className="mb-3 text-xs text-muted-foreground">
          Pares de título y valor que se muestran como tabla en la página del producto (ej.: Uso
          previsto, Vida útil, Almacenamiento).
        </p>
        <ul className="space-y-3">
          {features.map((feature, index) => (
            <li key={index} className="grid gap-2 sm:grid-cols-[1fr_2fr_auto]">
              <input
                type="text"
                aria-label={`Título de la característica ${index + 1}`}
                value={feature.label}
                maxLength={120}
                onChange={(e) =>
                  setFeatures((prev) =>
                    prev.map((f, i) => (i === index ? { ...f, label: e.target.value } : f))
                  )
                }
                className="rounded-md border border-border bg-surface px-3 py-2 text-sm"
              />
              <input
                type="text"
                aria-label={`Valor de la característica ${index + 1}`}
                value={feature.value}
                maxLength={600}
                onChange={(e) =>
                  setFeatures((prev) =>
                    prev.map((f, i) => (i === index ? { ...f, value: e.target.value } : f))
                  )
                }
                className="rounded-md border border-border bg-surface px-3 py-2 text-sm"
              />
              <button
                type="button"
                onClick={() => setFeatures((prev) => prev.filter((_, i) => i !== index))}
                className="rounded-md border border-border px-2 py-1 text-xs hover:bg-surface-muted"
              >
                Quitar
              </button>
            </li>
          ))}
        </ul>
        <button
          type="button"
          onClick={() => setFeatures((prev) => [...prev, { label: "", value: "" }])}
          disabled={features.length >= 20}
          className="mt-3 rounded-md border border-border px-3 py-1.5 text-sm hover:bg-surface-muted disabled:opacity-50"
        >
          + Agregar característica
        </button>
      </fieldset>

      <fieldset className="rounded-md border border-border p-4">
        <legend className="px-1 text-sm font-semibold">SEO (opcional)</legend>
        <div className="grid gap-4">
          <TextField
            label="Título SEO"
            name="seo_title"
            defaultValue={product.seo_title}
            maxLength={70}
            hint="Si se deja vacío se usa el nombre del producto."
          />
          <TextAreaField
            label="Descripción SEO"
            name="seo_description"
            defaultValue={product.seo_description}
            rows={2}
            maxLength={170}
          />
        </div>
      </fieldset>

      <StatusField defaultValue={product.status} />

      <ActionFeedback success={state.success} error={state.error} />
      <SubmitButton>Guardar cambios</SubmitButton>
    </form>
  );
}
