"use client";

import { useActionState, useEffect } from "react";
import type { ActionState } from "@/lib/action-state";
import { initialActionState } from "@/lib/action-state";
import { ActionFeedback, inputClass } from "./fields";
import { SubmitButton } from "./buttons";
import { useActionToast } from "./toast";
import { useAdminForm } from "./useAdminForm";

/**
 * Formulario de carga de imagen con texto alternativo obligatorio.
 * Recibe una Server Action ya vinculada al recurso (producto/artículo).
 */
export function UploadImageForm({
  action,
  buttonLabel = "Subir imagen",
  maxUploadMb,
}: {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  buttonLabel?: string;
  maxUploadMb: number;
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
        <label htmlFor="file" className="mb-1 block text-sm font-medium">
          Archivo (JPEG, PNG, WebP o AVIF; máx. {maxUploadMb} MB)
        </label>
        <input
          id="file"
          name="file"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          required
          className="w-full text-sm"
        />
      </div>
      <div>
        <label htmlFor="alt_text" className="mb-1 block text-sm font-medium">
          Texto alternativo (describe la imagen) *
        </label>
        <input
          id="alt_text"
          name="alt_text"
          type="text"
          required
          minLength={3}
          maxLength={300}
          placeholder="Ej.: Caja de Margarina DAP Hojaldre"
          aria-invalid={fieldErrors.alt_text ? true : undefined}
          aria-describedby={fieldErrors.alt_text ? "alt_text-error" : undefined}
          className={inputClass}
        />
        {fieldErrors.alt_text ? (
          <p id="alt_text-error" className="mt-1 text-sm text-accent">
            {fieldErrors.alt_text[0]}
          </p>
        ) : null}
      </div>
      <ActionFeedback state={state} />
      <SubmitButton variant="secondary" pendingLabel="Subiendo…">
        {buttonLabel}
      </SubmitButton>
    </form>
  );
}
