/**
 * Rodillo amasando: la animación decorativa que pidió la clienta
 * (requerimiento 03, 2026-08-28) para sumar un detalle con movimiento fuera
 * del hero y del CTA. Vive en la banda de pilares, justo donde estaban los
 * ornamentos botánicos que descartó.
 *
 * No es un GIF: es SVG de trazo con `currentColor`, así que hereda el color de
 * la banda anfitriona, pesa unos cientos de bytes y no se pixela nunca. El
 * motion es CSS puro (`.rodillo*` en globals.css), como todo el sitio (SSG).
 *
 * El vaivén es de ida y vuelta a propósito: es el gesto de amasar, no una
 * cinta transportadora. Los dos nudos de la madera se mueven con la MISMA onda
 * que el rodillo, así que en términos absolutos avanzan el doble que el eje —
 * que es exactamente lo que hace la superficie de un cilindro que rueda—, y
 * vuelven con él. Van recortados a la barra para no asomar por los mangos.
 *
 * Decorativo puro (`aria-hidden`, sin texto). Solo desde `lg` —en móvil la
 * banda no tiene margen que ceder— y quieto con `prefers-reduced-motion`.
 */
export function RollingPinOrnament({ className = "" }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 200 80"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <defs>
        <clipPath id="rodillo-barra">
          <rect x="40" y="14" width="120" height="40" rx="20" />
        </clipPath>
      </defs>

      <g className="rodillo">
        {/* Mangos: trazo grueso con extremo redondeado = varilla torneada. */}
        <path d="M8 34h30M162 34h30" strokeWidth="6" />
        {/* Barra */}
        <rect x="40" y="14" width="120" height="40" rx="20" strokeWidth="4" />
        {/* Veta larga de la madera: fija respecto a la barra, solo da volumen. */}
        <path d="M58 24h84M58 44h66" strokeWidth="2" opacity="0.45" />
        {/* Nudos: son los que delatan el giro. */}
        <g clipPath="url(#rodillo-barra)">
          <g className="rodillo-vetas" opacity="0.7">
            <circle cx="72" cy="34" r="3.5" strokeWidth="2.5" />
            <circle cx="120" cy="34" r="3.5" strokeWidth="2.5" />
          </g>
        </g>
      </g>

      {/* Masa extendida: óvalo plano y relleno, no una línea — con una barra
          recta bajo la barra del rodillo el conjunto se leía como una pesa.
          Va más ancho que el rodillo y casi tocándolo, que es lo que ancla el
          gesto. */}
      <ellipse
        cx="100"
        cy="70"
        rx="86"
        ry="6.5"
        fill="currentColor"
        stroke="none"
        opacity="0.28"
      />
    </svg>
  );
}
