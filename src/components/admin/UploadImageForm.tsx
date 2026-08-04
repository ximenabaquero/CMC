"use client";

import { useActionState, useRef, useEffect } from "react";
import type { ActionState } from "@/lib/action-state";
import { initialActionState } from "@/lib/action-state";
import { ActionFeedback } from "./fields";

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
  const [state, formAction, pending] = useActionState(action, initialActionState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) formRef.current?.reset();
  }, [state.success]);

  return (
    <form ref={formRef} action={formAction} className="space-y-3">
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
          className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm"
        />
      </div>
      <ActionFeedback success={state.success} error={state.error} />
      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-secondary px-4 py-2 text-sm font-medium text-white transition hover:bg-secondary-hover disabled:opacity-60"
      >
        {pending ? "Subiendo…" : buttonLabel}
      </button>
    </form>
  );
}
