"use client";

import { useFormStatus } from "react-dom";

export function SubmitButton({ children = "Guardar" }: { children?: React.ReactNode }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary-hover disabled:opacity-60"
    >
      {pending ? "Guardando…" : children}
    </button>
  );
}

/**
 * Botón de envío que pide confirmación antes de ejecutar la acción
 * (usado para eliminaciones).
 */
export function ConfirmSubmitButton({
  children,
  confirmMessage,
  variant = "danger",
}: {
  children: React.ReactNode;
  confirmMessage: string;
  variant?: "danger" | "neutral";
}) {
  const { pending } = useFormStatus();
  const classes =
    variant === "danger"
      ? "rounded-md border border-accent/50 px-3 py-1.5 text-sm font-medium text-accent transition hover:bg-accent/10 disabled:opacity-60"
      : "rounded-md border border-border px-3 py-1.5 text-sm font-medium transition hover:bg-surface-muted disabled:opacity-60";

  return (
    <button
      type="submit"
      disabled={pending}
      className={classes}
      onClick={(event) => {
        if (!window.confirm(confirmMessage)) {
          event.preventDefault();
        }
      }}
    >
      {pending ? "Procesando…" : children}
    </button>
  );
}
