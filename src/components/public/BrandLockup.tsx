import Image from "next/image";

/**
 * Lockup de identidad de CMC: emblema + razón social + lema, el mismo bloque
 * en el header y en el pie (requerimientos 04 y 05 de la clienta,
 * 2026-08-28).
 *
 * Tres decisiones que lo sostienen:
 *
 * 1. **Emblema en vector, texto en HTML.** El logotipo entregado trae la razón
 *    social y el lema dibujados dentro del arte; a 48–80 px de alto ese texto
 *    se apelmaza y era la causa de la pixelación que reportó la clienta. Aquí
 *    se monta solo el símbolo (`logo-cmc-emblema.svg`, nítido a cualquier
 *    densidad) y las dos líneas se componen como texto real: escalan, se
 *    seleccionan y llegan al lector de pantalla. El lockup dibujado completo
 *    sigue vivo en el hero, donde se pinta grande y sí resiste.
 * 2. **Rojo del logotipo en ambas líneas** (pedido explícito): `--accent`
 *    #c93a2e, 5.08:1 sobre blanco (AA para texto normal).
 * 3. **Lema centrado bajo la razón social**: la columna de texto se ajusta al
 *    ancho del nombre (`w-fit`) y el lema va `text-center` dentro de ella, así
 *    el centrado es óptico y no depende de medir la fuente.
 *
 * `as="footer"` solo cambia la escala: el pie pinta el emblema más grande
 * porque no compite con la navegación.
 */
export function BrandLockup({
  companyName,
  slogan,
  variant = "header",
}: {
  companyName: string;
  slogan?: string | null;
  variant?: "header" | "footer";
}) {
  const isFooter = variant === "footer";
  return (
    <span className={`flex items-center ${isFooter ? "gap-3.5" : "gap-3"}`}>
      {/* Decorativo: la razón social de al lado ya nombra a la empresa, y el
          enlace que lo envuelve en el header lleva su propio aria-label. */}
      <Image
        src="/brand/logo-cmc-emblema.svg"
        alt=""
        aria-hidden="true"
        width={484}
        height={468}
        priority={!isFooter}
        className={isFooter ? "h-16 w-auto sm:h-20" : "h-12 w-auto sm:h-14"}
      />
      {/* En móvil la razón social no se oculta —la clienta pidió reforzar la
          identidad, no solo en escritorio— pero se le pone techo de ancho para
          que envuelva en dos líneas en vez de empujar al menú fuera de la
          pantalla. Desde `sm` cabe holgada en una línea. */}
      <span className={`block w-fit ${isFooter ? "" : "max-w-[11rem] sm:max-w-none"}`}>
        <span
          className={`block font-display font-semibold leading-tight text-accent ${
            isFooter ? "text-base sm:text-lg" : "text-[0.72rem] sm:text-[0.85rem] lg:text-[0.95rem]"
          }`}
        >
          {companyName}
        </span>
        {slogan ? (
          <span
            className={`block text-center font-semibold uppercase tracking-[0.14em] text-accent ${
              isFooter
                ? "mt-1 text-[0.7rem]"
                : "mt-0.5 text-[0.55rem] sm:text-[0.6rem] lg:text-[0.65rem]"
            }`}
          >
            {slogan}
          </span>
        ) : null}
      </span>
    </span>
  );
}
