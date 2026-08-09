import Image from "next/image";
import Link from "next/link";
import { mediaUrl } from "@/lib/media";
import type { ProductWithImage } from "@/lib/content";

/* Fondos contextuales alternados por posición para que las tarjetas no sean
   idénticas entre sí (siempre tonos crema/mantequilla del tema). */
const IMAGE_BACKGROUNDS = ["bg-hero-cream", "bg-cream-deep", "bg-butter-light", "bg-cream"];

/**
 * Tarjeta de producto destacado de la home. Es independiente de la
 * `ProductCard` compartida (que usan /productos y la vista previa del admin)
 * para poder rediseñarla sin tocar las demás páginas.
 */
export function HomeProductCard({
  product,
  index,
}: {
  product: ProductWithImage;
  index: number;
}) {
  const imageBackground = IMAGE_BACKGROUNDS[index % IMAGE_BACKGROUNDS.length];

  return (
    <Link
      href={`/productos/${product.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-lg border border-border bg-surface transition hover:border-petrol/30 hover:shadow-md"
    >
      {product.image ? (
        <div className={`${imageBackground} overflow-hidden`}>
          <Image
            src={mediaUrl(product.image)}
            alt={product.image.alt_text}
            width={product.image.width ?? 600}
            height={product.image.height ?? 600}
            className="aspect-[4/3] w-full object-contain p-6 transition-transform group-hover:scale-[1.03] motion-reduce:transform-none motion-reduce:transition-none"
          />
        </div>
      ) : (
        <div
          aria-hidden="true"
          className={`flex aspect-[4/3] w-full items-center justify-center p-6 ${imageBackground}`}
        >
          <span className="font-display text-center text-xl font-semibold text-petrol/50">
            {product.name}
          </span>
        </div>
      )}
      <div className="flex flex-1 flex-col p-5">
        {product.category ? (
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-orange">
            {product.category.name}
          </p>
        ) : null}
        <h3 className="text-lg font-semibold text-petrol underline-offset-4 group-hover:underline">
          {product.name}
        </h3>
        {product.short_description ? (
          <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">
            {product.short_description}
          </p>
        ) : null}
        <span className="mt-auto pt-4 text-sm font-semibold text-primary">Ver producto →</span>
      </div>
    </Link>
  );
}
