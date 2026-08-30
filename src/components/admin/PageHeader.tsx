import Link from "next/link";

/**
 * Cabecera estándar de página del panel: enlace de regreso opcional,
 * título, descripción y acciones a la derecha. Server-safe.
 *
 * El título va en Fraunces y petróleo desde el 2026-08-28: es la única
 * concesión tipográfica del panel a la identidad del sitio (DESIGN.md decía
 * «el admin es 100 % Geist»; la excepción es deliberada y se limita al h1,
 * uno por página, para no tocar la legibilidad de la herramienta).
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
          <h1 className="font-display text-2xl font-semibold text-petrol">{title}</h1>
          {description ? (
            <p className="mt-1 max-w-prose text-base text-muted-foreground">{description}</p>
          ) : null}
        </div>
        {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
      </div>
    </header>
  );
}
