/**
 * Búsqueda de los listados del panel (2026-08-28).
 *
 * Se filtra **en memoria**, no en SQL, a propósito: las tablas del panel son
 * pequeñas por contrato (12 productos, un puñado de artículos y FAQs), la
 * página ya las trae completas para pintarlas, y así el total sin filtrar y el
 * total mostrado salen de una sola consulta — importa, porque la base es de
 * plan gratuito y puede estar pausada: cada viaje extra es un riesgo extra.
 * Si algún listado creciera a cientos de filas, esto pasa a `ilike` + `count`.
 *
 * `normalizeForSearch` quita tildes y diéresis además de bajar a minúsculas:
 * en un panel en español, escribir «reposteria» y no encontrar «Repostería»
 * se lee como que el buscador está roto. El rango ̀–ͯ es el de los
 * signos diacríticos combinables que deja sueltos `normalize("NFD")`.
 */
export function normalizeForSearch(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
}

/** True si alguno de los campos contiene el término buscado. */
export function matchesQuery(query: string | undefined, ...fields: (string | null)[]): boolean {
  const needle = normalizeForSearch(query ?? "");
  if (!needle) return true;
  return fields.some((field) => field && normalizeForSearch(field).includes(needle));
}

/** True si la fila pasa el filtro de estado (vacío o inválido = todos). */
export function matchesStatus(filter: string | undefined, status: string): boolean {
  if (filter !== "DRAFT" && filter !== "PUBLISHED") return true;
  return status === filter;
}
