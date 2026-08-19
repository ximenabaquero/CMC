import Image from "next/image";

/**
 * Ornamento lateral de obrador: dibujo a mano (vid, espigas y gotas de
 * aceite) fijo en el margen izquierdo del sitio público, solo desktop.
 * Decorativo puro: `alt=""` + `aria-hidden`, sin eventos de puntero y
 * `position: fixed`, así que nunca desplaza ni recorta el contenido.
 * La geometría (altura responsiva, deslizamiento fuera del lienzo en
 * viewports angostos) vive en `.bakery-side-ornament` de globals.css.
 */
export function BakerySideOrnament() {
  return (
    <Image
      src="/images/decorative/borde-ornamental-cmc.png"
      alt=""
      aria-hidden="true"
      width={887}
      height={1774}
      draggable={false}
      className="bakery-side-ornament"
    />
  );
}
