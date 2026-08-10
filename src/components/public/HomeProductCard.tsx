import Image from "next/image";
import Link from "next/link";
import { mediaUrl } from "@/lib/media";
import type { ProductWithImage } from "@/lib/content";

/**
 * Tarjeta de producto destacado de la home. Es independiente de la
 * `ProductCard` compartida (que usan /productos y la vista previa del admin)
 * para poder rediseñarla sin tocar las demás páginas.
 *
 * El área de imagen es un lienzo blanco uniforme: la imagen se renderiza tal
 * cual fue subida desde el admin (`object-contain`, sin recortes ni filtros),
 * de modo que admite archivos con cualquier fondo, proporción u orientación.
 */
export function HomeProductCard({ product }: { product: ProductWithImage }) {
  return (
    <Link
      href={`/productos/${product.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-lg border border-border bg-surface transition hover:border-petrol/30 hover:shadow-md motion-reduce:transition-none"
    >
      {product.image ? (
        <div className="h-72 bg-white p-5 sm:h-80 lg:h-[360px] lg:p-6">
          <Image
            src={mediaUrl(product.image)}
            alt={product.image.alt_text}
            width={product.image.width ?? 600}
            height={product.image.height ?? 600}
            className="h-full w-full object-contain object-center"
          />
        </div>
      ) : (
        <div
          aria-hidden="true"
          className="flex h-72 w-full items-center justify-center bg-surface-muted p-6 sm:h-80 lg:h-[360px]"
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
