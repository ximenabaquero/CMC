"use client";

import { useActionState, useEffect } from "react";
import type { ActionState } from "@/lib/action-state";
import { initialActionState } from "@/lib/action-state";
import { ActionFeedback, inputClass } from "./fields";
import { SubmitButton } from "./buttons";
import { useActionToast } from "./toast";
import { useAdminForm } from "./useAdminForm";

/**
 * Formulario de carga de un documento PDF (ficha técnica).
 * Recibe una Server Action ya vinculada al producto.
 */
export function UploadDocumentForm({
  action,
  buttonLabel = "Subir ficha técnica",
  maxUploadMb,
  defaultDisplayName,
}: {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  buttonLabel?: string;
  maxUploadMb: number;
  defaultDisplayName?: string;
}) {
  const [state, formAction] = useActionState(action, initialActionState);
  useActionToast(state);
  const { formProps } = useAdminForm(state);
  const fieldErrors = state.fieldErrors ?? {};

  useEffect(() => {
    if (state.status === "success") formProps.ref.current?.reset();
  }, [state, formProps.ref]);

  return (
    <form {...formProps} action={formAction} className="space-y-3">
      <div>
        <label htmlFor="sheet_file" className="mb-1 block text-sm font-medium">
          Archivo (solo PDF; máx. {maxUploadMb} MB)
        </label>
        <input
          id="sheet_file"
          name="file"
          type="file"
          accept="application/pdf"
          required
          className="w-full text-sm"
        />
      </div>
      <div>
        <label htmlFor="display_name" className="mb-1 block text-sm font-medium">
          Nombre visible del documento
        </label>
        <input
          id="display_name"
          name="display_name"
          type="text"
          minLength={3}
          maxLength={150}
          defaultValue={defaultDisplayName}
          placeholder="Ej.: Ficha técnica de Margarina DAP Hojaldre"
          aria-invalid={fieldErrors.display_name ? true : undefined}
          aria-describedby={
            fieldErrors.display_name ? "display_name-error display_name-hint" : "display_name-hint"
          }
          className={inputClass}
        />
        {fieldErrors.display_name ? (
          <p id="display_name-error" className="mt-1 text-sm text-accent">
            {fieldErrors.display_name[0]}
          </p>
        ) : null}
        <p id="display_name-hint" className="mt-1 text-xs text-muted-foreground">
          Es el nombre con el que se descargará el PDF. Si lo dejas vacío se usa el nombre del producto.
        </p>
      </div>
      <ActionFeedback state={state} />
      <SubmitButton variant="secondary" pendingLabel="Subiendo…">
        {buttonLabel}
      </SubmitButton>
    </form>
  );
}
