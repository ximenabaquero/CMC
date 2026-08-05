import Image from "next/image";
import type { BrandWithLogo } from "@/lib/content";
import { mediaUrl } from "@/lib/media";

/**
 * Carrusel de logos de marcas (marquee CSS puro, sin JavaScript).
 * El track contiene dos copias de la lista y la animación recorre
 * exactamente la mitad (-50%), de modo que el bucle es imperceptible.
 * La segunda copia es decorativa: aria-hidden y sin texto alternativo.
 * Con prefers-reduced-motion la fila queda estática y desplazable a mano.
 */
export function BrandsMarquee({ brands }: { brands: BrandWithLogo[] }) {
  return (
    <div className="brands-marquee [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
      <div className="brands-marquee-track">
        <BrandList brands={brands} />
        <BrandList brands={brands} decorative />
      </div>
    </div>
  );
}

function BrandList({ brands, decorative }: { brands: BrandWithLogo[]; decorative?: boolean }) {
  return (
    <ul
      aria-hidden={decorative ? "true" : undefined}
      className="flex shrink-0 items-center gap-12 pr-12"
    >
      {brands.map((brand) => {
        const logo = (
          <Image
            src={mediaUrl(brand.logo)}
            alt={decorative ? "" : brand.logo.alt_text}
            width={brand.logo.width ?? 160}
            height={brand.logo.height ?? 64}
            className="h-12 w-auto max-w-40 object-contain grayscale opacity-70 transition hover:grayscale-0 hover:opacity-100"
          />
        );
        return (
          <li key={brand.id} className="shrink-0">
            {brand.website_url ? (
              <a
                href={brand.website_url}
                target="_blank"
                rel="noopener noreferrer"
                tabIndex={decorative ? -1 : undefined}
                title={brand.name}
              >
                {logo}
              </a>
            ) : (
              logo
            )}
          </li>
        );
      })}
    </ul>
  );
}
