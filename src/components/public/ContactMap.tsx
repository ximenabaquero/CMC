/**
 * Lienzo de mapa de la página de contacto.
 *
 * La URL del embed se deriva de la dirección guardada en el CMS
 * (`site_settings.address` + `.city`), así que editar la dirección desde
 * /admin/contacto mueve el mapa: una sola fuente de verdad, sin API key y
 * sin campo extra en la base de datos.
 *
 * Server Component sin JS (el sitio público es 100 % SSG). Sin sombra en
 * reposo — "The Flat-At-Rest Rule" de DESIGN.md.
 */

/**
 * Google no geocodifica el detalle interior de un edificio: si se lo damos,
 * engancha la ficha de alguna empresa vecina del mismo piso (verificado
 * 2026-08-20: con «Torre Ofiespacios, Of. 325-326» el pin salía rotulado
 * «Office To Go S.A.S»). Quitando esos segmentos el mapa cae sobre el
 * edificio — que es la referencia que sirve para llegar — y la dirección
 * completa se sigue mostrando como texto.
 */
const INTERIOR_SEGMENT = /^(of\.?|oficina|torre|piso|local|apto\.?|apartamento|bodega)\b/i;

function buildMapQuery(address: string, city: string | null) {
  const segments = address.split(",").map((segment) => segment.trim());
  const exterior = segments.filter((segment) => segment && !INTERIOR_SEGMENT.test(segment));
  // Si la dirección entera fuese detalle interior, es mejor buscarla tal cual.
  const base = exterior.length > 0 ? exterior : segments;
  return [...base, city].filter(Boolean).join(", ");
}

export function mapsSearchHref(address: string, city: string | null) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    buildMapQuery(address, city),
  )}`;
}

export function ContactMap({
  address,
  city,
  companyName,
}: {
  address: string | null;
  city: string | null;
  companyName: string;
}) {
  if (!address) return null;

  const embedSrc = `https://www.google.com/maps?q=${encodeURIComponent(
    buildMapQuery(address, city),
  )}&output=embed`;
  const fullAddress = [address, city].filter(Boolean).join(", ");

  return (
    <figure className="reveal mt-8 overflow-hidden rounded-lg border border-border">
      <iframe
        src={embedSrc}
        title={`Mapa de ubicación de ${companyName}`}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        className="block h-[320px] w-full border-0 sm:h-[380px]"
      />
      <figcaption className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-t border-border bg-surface-muted px-4 py-3">
        <span className="text-sm text-muted-foreground">{fullAddress}</span>
        <a
          href={mapsSearchHref(address, city)}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-semibold text-petrol underline-offset-4 hover:underline"
        >
          Cómo llegar
        </a>
      </figcaption>
    </figure>
  );
}
