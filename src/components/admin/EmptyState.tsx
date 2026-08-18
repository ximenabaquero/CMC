import Link from "next/link";

/**
 * Estado vacío con acción directa (ej. "Crear primera marca").
 * Server-safe.
 */
export function EmptyState({
  title,
  description,
  cta,
}: {
  title: string;
  description?: string;
  cta?: { href: string; label: string };
}) {
  return (
    <div className="rounded-lg border border-dashed border-border bg-surface p-8 text-center">
      <p className="text-base font-medium">{title}</p>
      {description ? (
        <p className="mx-auto mt-1 max-w-prose text-sm text-muted-foreground">{description}</p>
      ) : null}
      {cta ? (
        <Link
          href={cta.href}
          className="mt-4 inline-flex min-h-11 items-center justify-center rounded-md bg-primary px-4 py-2 text-base font-medium text-primary-foreground transition hover:bg-primary-hover"
        >
          {cta.label}
        </Link>
      ) : null}
    </div>
  );
}
