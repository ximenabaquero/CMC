/** Indicador de carga de las páginas del panel. */
export default function AdminLoading() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <p role="status" className="flex items-center gap-3 text-base text-muted-foreground">
        <svg
          className="size-5 animate-spin"
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
        Cargando…
      </p>
    </div>
  );
}
