"use client";

import { useActionState } from "react";
import { createBrand } from "@/actions/brands";
import { initialActionState } from "@/lib/action-state";
import { ActionFeedback, TextField } from "@/components/admin/fields";
import { SubmitButton } from "@/components/admin/buttons";

export function NewBrandForm() {
  const [state, formAction] = useActionState(createBrand, initialActionState);

  return (
    <form action={formAction} className="space-y-4 rounded-lg border border-border bg-surface p-5">
      <TextField label="Nombre de la marca" name="name" required maxLength={150} />
      <ActionFeedback success={state.success} error={state.error} />
      <SubmitButton>Crear borrador</SubmitButton>
    </form>
  );
}
