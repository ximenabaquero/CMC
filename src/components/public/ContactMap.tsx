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

  const query = [address, city].filter(Boolean).join(", ");
  const embedSrc = `https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`;
  const mapsHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;

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
        <span className="text-sm text-muted-foreground">{query}</span>
        <a
          href={mapsHref}
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
