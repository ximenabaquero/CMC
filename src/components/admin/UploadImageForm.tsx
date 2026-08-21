"use client";

import { useActionState, useEffect, useId } from "react";
import type { ActionState } from "@/lib/action-state";
import { initialActionState } from "@/lib/action-state";
import { ActionFeedback, inputClass } from "./fields";
import { SubmitButton } from "./buttons";
import { useActionToast } from "./toast";
import { useAdminForm } from "./useAdminForm";

/**
 * Formulario de carga de imagen con texto alternativo obligatorio.
 * Recibe una Server Action ya vinculada al recurso (producto/artículo).
 *
 * Los `id` se derivan de `useId()` y no son literales: `/admin/blog/[id]`
 * monta dos instancias (imágenes del cuerpo y portada) y con ids fijos el
 * `htmlFor` resolvía siempre al primer formulario del DOM — al pulsar la
 * etiqueta «Archivo…» de la portada se abría el selector del cuerpo y la
 * foto terminaba en el formulario equivocado. Los `name` sí siguen fijos:
 * son el contrato con la Server Action.
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
  const uid = useId();
  const fileId = `${uid}-file`;
  const altId = `${uid}-alt_text`;

  useEffect(() => {
    if (state.status === "success") formProps.ref.current?.reset();
  }, [state, formProps.ref]);

  return (
    <form {...formProps} action={formAction} className="space-y-3">
      <div>
        <label htmlFor={fileId} className="mb-1 block text-sm font-medium">
          Archivo (JPEG, PNG, WebP o AVIF; máx. {maxUploadMb} MB)
        </label>
        <input
          id={fileId}
          name="file"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          required
          className="w-full text-sm"
        />
      </div>
      <div>
        <label htmlFor={altId} className="mb-1 block text-sm font-medium">
          Texto alternativo (describe la imagen) *
        </label>
        <input
          id={altId}
          name="alt_text"
          type="text"
          required
          minLength={3}
          maxLength={300}
          placeholder="Ej.: Caja de Margarina DAP Hojaldre"
          aria-invalid={fieldErrors.alt_text ? true : undefined}
          aria-describedby={fieldErrors.alt_text ? `${altId}-error` : undefined}
          className={inputClass}
        />
        {fieldErrors.alt_text ? (
          <p id={`${altId}-error`} className="mt-1 text-sm text-accent">
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
