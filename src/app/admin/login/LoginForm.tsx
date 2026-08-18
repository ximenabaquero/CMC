"use client";

import { useActionState } from "react";
import { login } from "@/actions/auth";
import { initialActionState } from "@/lib/action-state";
import { ActionFeedback, TextField } from "@/components/admin/fields";
import { SubmitButton } from "@/components/admin/buttons";
import { useAdminForm } from "@/components/admin/useAdminForm";

export function LoginForm() {
  const [state, formAction] = useActionState(login, initialActionState);
  const { formProps } = useAdminForm(state);
  const fieldErrors = state.fieldErrors ?? {};

  return (
    <form {...formProps} action={formAction} className="space-y-4" noValidate>
      <TextField
        label="Correo electrónico"
        name="email"
        type="email"
        required
        autoComplete="email"
        error={fieldErrors.email?.[0]}
      />
      <TextField
        label="Contraseña"
        name="password"
        type="password"
        required
        autoComplete="current-password"
        error={fieldErrors.password?.[0]}
      />

      {/* El login está fuera del ToastProvider: el error va inline. */}
      {!state.fieldErrors ? <ActionFeedback state={state} /> : null}

      <SubmitButton pendingLabel="Iniciando sesión…" className="w-full">
        Iniciar sesión
      </SubmitButton>
    </form>
  );
}
