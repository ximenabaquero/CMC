import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-20 text-center">
      <p className="text-sm font-semibold uppercase tracking-wide text-primary">Error 404</p>
      <h1 className="mt-2 text-3xl font-semibold">Página no encontrada</h1>
      <p className="mt-3 max-w-md text-muted-foreground">
        La página que buscas no existe o fue movida. Puedes volver al inicio o explorar nuestro
        catálogo.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link
          href="/"
          className="rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition hover:bg-primary-hover"
        >
          Ir al inicio
        </Link>
        <Link
          href="/productos"
          className="rounded-md border border-border px-5 py-2.5 text-sm font-medium transition hover:bg-surface-muted"
        >
          Ver productos
        </Link>
      </div>
    </main>
  );
}
