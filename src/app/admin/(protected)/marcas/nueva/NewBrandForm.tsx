"use client";

import { useActionState } from "react";
import { createBrand } from "@/actions/brands";
import { initialActionState } from "@/lib/action-state";
import { ActionFeedback, TextField } from "@/components/admin/fields";
import { SubmitButton } from "@/components/admin/buttons";
import { useActionToast } from "@/components/admin/toast";
import { useAdminForm } from "@/components/admin/useAdminForm";

export function NewBrandForm() {
  const [state, formAction] = useActionState(createBrand, initialActionState);
  useActionToast(state);
  const { formProps } = useAdminForm(state);
  const fieldErrors = state.fieldErrors ?? {};

  return (
    <form
      {...formProps}
      action={formAction}
      className="space-y-4 rounded-lg border border-border bg-surface p-5"
    >
      <TextField
        label="Nombre de la marca"
        name="name"
        required
        maxLength={150}
        error={fieldErrors.name?.[0]}
      />
      <ActionFeedback state={state} />
      <SubmitButton pendingLabel="Creando…">Crear borrador</SubmitButton>
    </form>
  );
}
