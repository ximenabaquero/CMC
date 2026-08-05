"use client";

import { useActionState } from "react";
import { updateBrand } from "@/actions/brands";
import { initialActionState } from "@/lib/action-state";
import type { Brand } from "@/lib/supabase/types";
import {
  ActionFeedback,
  StatusField,
  TextAreaField,
  TextField,
} from "@/components/admin/fields";
import { SubmitButton } from "@/components/admin/buttons";

export function BrandForm({ brand }: { brand: Brand }) {
  const [state, formAction] = useActionState(updateBrand.bind(null, brand.id), initialActionState);

  return (
    <form action={formAction} className="space-y-4 rounded-lg border border-border bg-surface p-5">
      <TextField label="Nombre de la marca" name="name" defaultValue={brand.name} required maxLength={150} />
      <TextField
        label="Sitio web (opcional)"
        name="website_url"
        type="url"
        defaultValue={brand.website_url}
        hint="Si se indica, el logo enlaza a esta dirección (https://…)."
        maxLength={300}
      />
      <TextField
        label="Orden"
        name="sort_order"
        type="number"
        defaultValue={String(brand.sort_order)}
        hint="Las marcas se muestran de menor a mayor orden."
      />
      <StatusField defaultValue={brand.status} />
      <TextAreaField
        label="Nota interna (no visible al público)"
        name="internal_note"
        defaultValue={brand.internal_note}
        rows={3}
        hint="Por ejemplo: estado de la autorización escrita para usar el logo."
        maxLength={1000}
      />
      <ActionFeedback success={state.success} error={state.error} />
      <SubmitButton>Guardar cambios</SubmitButton>
    </form>
  );
}
