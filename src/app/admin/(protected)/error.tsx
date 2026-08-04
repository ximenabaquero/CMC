"use client";

import { useEffect } from "react";

/**
 * Estado de error del panel administrativo. Se muestra, por ejemplo,
 * cuando la base de datos de Supabase está pausada o inaccesible.
 */
export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Registro controlado: solo en consola del servidor/navegador,
    // sin exponer detalles sensibles al usuario final.
    console.error("Error en el panel administrativo:", error);
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-surface-muted p-4">
      <div className="w-full max-w-lg rounded-lg border border-accent/40 bg-surface p-8 text-center">
        <h1 className="mb-2 text-lg font-semibold">No se pudo conectar con la base de datos</h1>
        <p className="mb-4 text-sm text-muted-foreground">
          El panel no pudo cargar la información. Esto puede ocurrir si el proyecto de Supabase
          está pausado (plan gratuito tras un periodo de inactividad) o si hay un problema
          temporal de conexión. El sitio público seguirá mostrando la última versión generada.
        </p>
        <ol className="mb-6 list-inside list-decimal text-left text-sm text-muted-foreground">
          <li>Ingresa al panel de Supabase y verifica que el proyecto esté activo (botón «Restore» si está pausado).</li>
          <li>Espera un par de minutos y vuelve a intentarlo.</li>
        </ol>
        <button
          type="button"
          onClick={reset}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary-hover"
        >
          Reintentar
        </button>
      </div>
    </main>
  );
}
