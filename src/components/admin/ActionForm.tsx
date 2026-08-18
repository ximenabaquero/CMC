"use client";

import { useActionState } from "react";
import { initialActionState, type ActionState } from "@/lib/action-state";
import { useActionToast } from "@/components/admin/toast";

/**
 * Formulario para acciones sin campos visibles (galería, eliminar,
 * quitar logo/portada/ficha): conecta la Server Action con
 * useActionState y comunica el resultado por toast. Los botones hijos
 * (SubmitButton, GhostSubmitButton, ConfirmSubmitButton) obtienen el
 * pending de useFormStatus como en cualquier otro formulario.
 */
export function ActionForm({
  action,
  children,
  className,
}: {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  children: React.ReactNode;
  className?: string;
}) {
  const [state, formAction] = useActionState(action, initialActionState);
  useActionToast(state);

  return (
    <form action={formAction} className={className}>
      {children}
    </form>
  );
}
