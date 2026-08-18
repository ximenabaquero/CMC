"use client";

import { useActionState } from "react";
import type { ActionState } from "@/lib/action-state";
import { initialActionState } from "@/lib/action-state";
import { useActionToast } from "./toast";
import { useAdminForm } from "./useAdminForm";

/**
 * Edición del texto alternativo de una imagen de la galería.
 * Recibe una Server Action ya vinculada al asset y al producto.
 */
export function AltTextForm({
  action,
  currentAlt,
}: {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  currentAlt: string;
}) {
  const [state, formAction, pending] = useActionState(action, initialActionState);
  useActionToast(state);
  const { formProps } = useAdminForm(state);
  const fieldError = state.fieldErrors?.alt_text?.[0];

  return (
    <form {...formProps} action={formAction} className="space-y-1">
      <div className="flex gap-1">
        <input
          name="alt_text"
          type="text"
          required
          minLength={3}
          maxLength={300}
          defaultValue={currentAlt}
          aria-label="Texto alternativo"
          aria-invalid={fieldError ? true : undefined}
          className="w-full rounded-md border border-border bg-surface px-2 py-1 text-sm"
        />
        <button
          type="submit"
          disabled={pending}
          className="shrink-0 rounded-md border border-border px-2.5 py-1 text-sm hover:bg-surface-muted disabled:opacity-60"
        >
          {pending ? "…" : "Guardar"}
        </button>
      </div>
      {fieldError ? (
        <p role="alert" className="text-xs text-accent">
          {fieldError}
        </p>
      ) : state.status === "error" && state.message ? (
        <p role="alert" className="text-xs text-accent">
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
