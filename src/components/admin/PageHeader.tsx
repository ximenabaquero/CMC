import Link from "next/link";

/**
 * Cabecera estándar de página del panel: enlace de regreso opcional,
 * título, descripción y acciones a la derecha. Server-safe.
 */
export function PageHeader({
  title,
  description,
  backHref,
  backLabel = "Volver",
  actions,
}: {
  title: string;
  description?: string;
  backHref?: string;
  backLabel?: string;
  actions?: React.ReactNode;
}) {
  return (
    <header className="mb-6">
      {backHref ? (
        <Link
          href={backHref}
          className="mb-2 inline-flex min-h-10 items-center gap-1 text-sm text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
        >
          <span aria-hidden="true">←</span> {backLabel}
        </Link>
      ) : null}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold">{title}</h1>
          {description ? (
            <p className="mt-1 max-w-prose text-base text-muted-foreground">{description}</p>
          ) : null}
        </div>
        {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
      </div>
    </header>
  );
}
