/**
 * Badge de estado DRAFT/PUBLISHED, distinguible por forma y texto,
 * no solo por color (punto relleno vs. contorno punteado).
 * Server-safe: sin estado ni handlers.
 */
export function StatusBadge({
  status,
  publishedLabel = "Publicado",
}: {
  status: "DRAFT" | "PUBLISHED";
  /** Permite concordancia de género, ej. "Publicada" para marcas. */
  publishedLabel?: string;
}) {
  if (status === "PUBLISHED") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
        <span aria-hidden="true" className="size-1.5 rounded-full bg-primary" />
        {publishedLabel}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-border bg-surface-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
      <span aria-hidden="true" className="size-1.5 rounded-full border border-muted-foreground" />
      Borrador
    </span>
  );
}
