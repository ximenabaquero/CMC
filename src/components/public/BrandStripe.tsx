/**
 * Franja tricolor de identidad (2026-08-28). Tres barras a ancho completo con
 * los colores del logotipo CMC —azul, verde y rojo, en las versiones AA de la
 * paleta— que sustituyen a los fondos crema como recurso de color: la clienta
 * pidió «fondo blanco con líneas/franjas de colores más gruesas» además de las
 * bandas de color plenas.
 *
 * Proporciones 5/3/2 (azul, verde, rojo) en lugar de tres tercios iguales: es
 * el peso relativo de los tres trazos en el logotipo (el sol azul domina, las
 * hojas verdes lo sostienen y la razón social roja es la firma), y evita que
 * la franja se lea como bandera.
 *
 * Decorativa pura: `aria-hidden`, sin texto ni enlace. Dos tamaños —`sm` (3px)
 * para el borde inferior del header, presente en todas las páginas, y `md`
 * (6px) para separar secciones y coronar el pie.
 */
export function BrandStripe({
  size = "sm",
  className = "",
}: {
  size?: "sm" | "md";
  className?: string;
}) {
  return (
    <div
      aria-hidden="true"
      className={`flex w-full ${size === "sm" ? "h-[3px]" : "h-1.5"} ${className}`}
    >
      <div className="grow-[5] bg-secondary" />
      <div className="grow-[3] bg-primary" />
      <div className="grow-[2] bg-accent" />
    </div>
  );
}
