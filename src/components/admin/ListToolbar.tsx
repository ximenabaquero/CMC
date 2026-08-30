"use client";

import { useRouter } from "next/navigation";
import { useRef } from "react";
import { inputClass } from "@/components/admin/fields";

/**
 * Barra de búsqueda y filtro de los listados del panel (2026-08-28).
 *
 * El estado vive en la URL (`?q=` y `?estado=`), no en React: así el listado
 * se sigue filtrando en el servidor —una sola consulta a Supabase, sin traer
 * todo el catálogo al cliente—, el filtro sobrevive a recargar y al volver
 * atrás, y se puede compartir un enlace ya filtrado.
 *
 * Los valores actuales llegan por props desde la página (que ya resolvió
 * `searchParams`) en vez de leerse con `useSearchParams`: es un dato que el
 * servidor ya tenía y así el componente no depende del hook.
 *
 * El `<select>` navega al cambiar y el texto al enviar: elegir un estado y
 * tener que pulsar «Buscar» después es un paso de más, pero autoenviar en
 * cada tecla dispararía una consulta por letra.
 */
export function ListToolbar({
  basePath,
  q,
  status,
  searchLabel,
  searchPlaceholder,
  total,
  shown,
  itemsLabel,
}: {
  basePath: string;
  q?: string;
  status?: string;
  searchLabel: string;
  searchPlaceholder: string;
  /** Total sin filtrar, para poder decir «3 de 12». */
  total: number;
  shown: number;
  /** Plural del recurso, ej. "productos". */
  itemsLabel: string;
}) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const filtering = Boolean(q) || Boolean(status);

  function navigate(formData: FormData) {
    const params = new URLSearchParams();
    const nextQ = String(formData.get("q") ?? "").trim();
    const nextStatus = String(formData.get("estado") ?? "");
    if (nextQ) params.set("q", nextQ);
    if (nextStatus) params.set("estado", nextStatus);
    const query = params.toString();
    router.push(query ? `${basePath}?${query}` : basePath);
  }

  return (
    <div className="mb-4">
      <form
        ref={formRef}
        role="search"
        onSubmit={(event) => {
          event.preventDefault();
          navigate(new FormData(event.currentTarget));
        }}
        className="flex flex-wrap items-center gap-2"
      >
        <label htmlFor="q" className="sr-only">
          {searchLabel}
        </label>
        <input
          id="q"
          name="q"
          type="search"
          defaultValue={q ?? ""}
          placeholder={searchPlaceholder}
          className={`${inputClass} min-w-0 flex-1 sm:max-w-xs`}
        />
        <label htmlFor="estado" className="sr-only">
          Filtrar por estado
        </label>
        <select
          id="estado"
          name="estado"
          defaultValue={status ?? ""}
          onChange={(event) => navigate(new FormData(event.currentTarget.form!))}
          className={`${inputClass} w-auto`}
        >
          <option value="">Todos los estados</option>
          <option value="PUBLISHED">Solo publicados</option>
          <option value="DRAFT">Solo borradores</option>
        </select>
        <button
          type="submit"
          className="min-h-11 rounded-md border border-border bg-surface px-4 py-2 text-base font-medium transition hover:bg-surface-muted"
        >
          Buscar
        </button>
        {filtering ? (
          <button
            type="button"
            onClick={() => router.push(basePath)}
            className="min-h-11 px-2 text-sm text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
          >
            Limpiar
          </button>
        ) : null}
      </form>
      {/* El conteo solo aparece cuando hay filtro: sin él repetiría lo que ya
          se ve en la lista. `aria-live` porque cambia sin recargar página. */}
      {filtering ? (
        <p aria-live="polite" className="mt-2 text-sm text-muted-foreground">
          {shown === 0
            ? `Ningún resultado entre los ${total} ${itemsLabel}.`
            : `Mostrando ${shown} de ${total} ${itemsLabel}.`}
        </p>
      ) : null}
    </div>
  );
}
