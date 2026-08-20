import Image from "next/image";

/**
 * Ornamento lateral de obrador: dibujo a mano (vid, espigas y gotas de
 * aceite) en un margen, solo desktop. Desde el 2026-08-20 (pedido de la
 * clienta) es `position: absolute` dentro de una sección anfitriona —
 * scrollea con el contenido — y se monta SOLO en tres anclas: pilares de
 * la home, zona alta de /nosotros y contacto. El host debe ser full-bleed,
 * `relative` y `overflow-x-clip` (ver `.bakery-side-ornament` en
 * globals.css). `side` elige el margen: el PNG derecho es el mismo dibujo
 * en espejo (lienzo y geometría de tinta idénticos, comparten constante).
 * Decorativo puro: `alt=""` + `aria-hidden`, sin eventos de puntero.
 */
export function BakerySideOrnament({ side = "izquierdo" }: { side?: "izquierdo" | "derecho" }) {
  const derecho = side === "derecho";
  return (
    <Image
      src={
        derecho
          ? "/images/decorative/borde-ornamental-cmc-derecha.png"
          : "/images/decorative/borde-ornamental-cmc.png"
      }
      alt=""
      aria-hidden="true"
      width={887}
      height={1774}
      draggable={false}
      className={
        derecho ? "bakery-side-ornament bakery-side-ornament--derecha" : "bakery-side-ornament"
      }
    />
  );
}
