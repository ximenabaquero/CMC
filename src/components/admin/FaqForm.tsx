"use client";

import { useActionState } from "react";
import type { ActionState } from "@/lib/action-state";
import { initialActionState } from "@/lib/action-state";
import type { Faq } from "@/lib/supabase/types";
import {
  ActionFeedback,
  CheckboxField,
  StatusField,
  TextAreaField,
  TextField,
} from "@/components/admin/fields";
import { SubmitButton } from "@/components/admin/buttons";
import { useActionToast } from "@/components/admin/toast";
import { UnsavedBadge, useAdminForm } from "@/components/admin/useAdminForm";

export function FaqForm({
  faq,
  action,
}: {
  faq?: Faq;
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
}) {
  const [state, formAction] = useActionState(action, initialActionState);
  useActionToast(state);
  const { formProps, dirty } = useAdminForm(state);
  const fieldErrors = state.fieldErrors ?? {};

  return (
    <form
      {...formProps}
      action={formAction}
      className="space-y-4 rounded-lg border border-border bg-surface p-5"
    >
      <TextAreaField
        label="Pregunta"
        name="question"
        defaultValue={faq?.question}
        required
        rows={2}
        maxLength={300}
        error={fieldErrors.question?.[0]}
      />
      <TextAreaField
        label="Respuesta"
        name="answer"
        defaultValue={faq?.answer}
        required
        rows={6}
        maxLength={5000}
        hint="Para listas comienza la línea con «- »."
        error={fieldErrors.answer?.[0]}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          label="Orden"
          name="sort_order"
          type="number"
          defaultValue={String(faq?.sort_order ?? 0)}
          hint="Menor número aparece primero."
          error={fieldErrors.sort_order?.[0]}
        />
        <StatusField defaultValue={faq?.status ?? "DRAFT"} error={fieldErrors.status?.[0]} />
      </div>
      <CheckboxField
        label="Destacar en la página de Inicio"
        name="featured"
        defaultChecked={faq?.featured}
      />
      <ActionFeedback state={state} />
      <div className="flex flex-wrap items-center gap-3">
        <SubmitButton pendingLabel={faq ? "Guardando…" : "Creando…"}>
          {faq ? "Guardar cambios" : "Crear pregunta"}
        </SubmitButton>
        <UnsavedBadge dirty={dirty} />
      </div>
    </form>
  );
}
