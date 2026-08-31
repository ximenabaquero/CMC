/**
 * Catálogo comercial en PDF (requerimiento 13 de la clienta, 2026-08-28).
 *
 * El archivo definitivo todavía no está entregado. Para publicarlo basta con
 * cambiar esta constante:
 *   1. copiar el PDF a `public/catalogo/` (p. ej. `catalogo-cmc.pdf`), o
 *      tener su URL pública;
 *   2. poner esa ruta/URL aquí.
 *
 * Mientras valga `null`, el menú desplegable de «Productos» monta solo «Ver
 * productos»: un enlace muerto rotulado «Descargar catálogo» le costaría más
 * credibilidad al sitio que la ausencia de la entrada. La entrada aparece sola
 * —en escritorio y en el menú móvil— en cuanto deje de ser `null`.
 *
 * Ver docs/CONTENT_PENDING.md (insumos pendientes de la clienta).
 */
export const CATALOG_PDF_HREF: string | null = null;

/** Rótulo único de la descarga, para que menú móvil y escritorio no diverjan. */
export const CATALOG_LABEL = "Descargar catálogo";
