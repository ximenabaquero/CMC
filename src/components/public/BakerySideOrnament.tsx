import Image from "next/image";

/**
 * Ornamento lateral de obrador: dibujo a mano (vid, espigas y gotas de
 * aceite) fijo en un margen del sitio público, solo desktop. `side`
 * elige el margen: el PNG derecho es el mismo dibujo en espejo (lienzo
 * y geometría de tinta idénticos, así que comparten constante en CSS).
 * Decorativo puro: `alt=""` + `aria-hidden`, sin eventos de puntero y
 * `position: fixed`, así que nunca desplaza ni recorta el contenido.
 * La geometría (altura responsiva, deslizamiento fuera del lienzo en
 * viewports angostos) vive en `.bakery-side-ornament` de globals.css.
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
