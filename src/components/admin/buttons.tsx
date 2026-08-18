"use client";

import { useFormStatus } from "react-dom";

/** Spinner pequeño para estados de carga (el giro es indicador funcional). */
function Spinner({ className = "size-4" }: { className?: string }) {
  return (
    <svg
      className={`animate-spin ${className}`}
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="2" opacity="0.25" />
      <path
        d="M14.5 8a6.5 6.5 0 0 0-6.5-6.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function SubmitButton({
  children = "Guardar",
  pendingLabel = "Guardando…",
  variant = "primary",
  className,
}: {
  children?: React.ReactNode;
  pendingLabel?: string;
  variant?: "primary" | "secondary";
  className?: string;
}) {
  const { pending } = useFormStatus();
  const classes =
    variant === "primary"
      ? "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-base font-medium text-primary-foreground transition hover:bg-primary-hover disabled:opacity-60"
      : "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-border bg-surface px-4 py-2 text-base font-medium transition hover:bg-surface-muted disabled:opacity-60";

  return (
    <button
      type="submit"
      disabled={pending}
      className={className ? `${classes} ${className}` : classes}
    >
      {pending ? (
        <>
          <Spinner />
          {pendingLabel}
        </>
      ) : (
        children
      )}
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
  pendingLabel = "Eliminando…",
  variant = "danger",
}: {
  children: React.ReactNode;
  confirmMessage: string;
  pendingLabel?: string;
  variant?: "danger" | "neutral";
}) {
  const { pending } = useFormStatus();
  const classes =
    variant === "danger"
      ? "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-accent/50 px-3 py-1.5 text-sm font-medium text-accent transition hover:bg-accent/10 disabled:opacity-60"
      : "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-border px-3 py-1.5 text-sm font-medium transition hover:bg-surface-muted disabled:opacity-60";

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
      {pending ? (
        <>
          <Spinner />
          {pendingLabel}
        </>
      ) : (
        children
      )}
    </button>
  );
}

/**
 * Botón compacto para acciones secundarias en línea (galería de
 * imágenes): mismo estilo discreto, pero con pending real.
 */
export function GhostSubmitButton({
  children,
  "aria-label": ariaLabel,
}: {
  children: React.ReactNode;
  "aria-label"?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      aria-label={ariaLabel}
      className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-md border border-border px-2.5 py-1 text-sm transition hover:bg-surface-muted disabled:opacity-60"
    >
      {pending ? <Spinner className="size-3.5" /> : null}
      {children}
    </button>
  );
}
