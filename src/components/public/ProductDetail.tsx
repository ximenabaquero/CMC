import Image from "next/image";
import Link from "next/link";
import { mediaUrl } from "@/lib/media";
import { Markdown } from "@/lib/markdown";
import type { ProductDetailData } from "@/lib/content";

/**
 * Detalle de producto. Se usa tanto en la página pública
 * /productos/[slug] como en la vista previa del panel admin.
 */
export function ProductDetail({ product }: { product: ProductDetailData }) {
  return (
    <article className="mx-auto max-w-6xl px-4 py-10">
      <nav aria-label="Ruta de navegación" className="mb-6 text-sm text-muted-foreground">
        <Link href="/productos" className="underline-offset-2 hover:underline">
          Productos
        </Link>{" "}
        / <span aria-current="page">{product.name}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2">
        <div>
          {product.image ? (
            <Image
              src={mediaUrl(product.image)}
              alt={product.image.alt_text}
              width={product.image.width ?? 800}
              height={product.image.height ?? 800}
              priority
              className="w-full rounded-lg border border-border bg-surface-muted object-cover"
            />
          ) : (
            <div
              aria-hidden="true"
              className="flex aspect-square w-full items-center justify-center rounded-lg border border-dashed border-border bg-surface-muted text-muted-foreground"
            >
              Imagen en preparación
            </div>
          )}

          {product.gallery.length > 1 ? (
            <ul className="mt-4 grid grid-cols-4 gap-3">
              {product.gallery.map((asset) => (
                <li key={asset.id}>
                  <Image
                    src={mediaUrl(asset)}
                    alt={asset.alt_text}
                    width={160}
                    height={160}
                    className="aspect-square w-full rounded-md border border-border bg-surface-muted object-cover"
                  />
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        <div>
          {product.category ? (
            <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-primary">
              {product.category.name}
            </p>
          ) : null}
          <h1 className="text-3xl font-semibold">{product.name}</h1>
          {product.short_description ? (
            <p className="mt-3 text-lg text-muted-foreground">{product.short_description}</p>
          ) : null}

          {product.description ? (
            <div className="mt-6">
              <Markdown>{product.description}</Markdown>
            </div>
          ) : null}

          {product.presentation ? (
            <div className="mt-6 rounded-lg border border-border bg-surface-muted p-4">
              <h2 className="text-sm font-semibold">Presentación</h2>
              <p className="mt-1 text-sm text-muted-foreground">{product.presentation}</p>
            </div>
          ) : null}

          {product.features.length > 0 ? (
            <section aria-labelledby="caracteristicas" className="mt-8">
              <h2 id="caracteristicas" className="mb-3 text-lg font-semibold">
                Características
              </h2>
              <dl className="divide-y divide-border overflow-hidden rounded-lg border border-border">
                {product.features.map((feature, index) => (
                  <div key={index} className="grid gap-1 bg-surface p-4 sm:grid-cols-[200px_1fr] sm:gap-4">
                    <dt className="text-sm font-medium">{feature.label}</dt>
                    <dd className="text-sm text-muted-foreground">{feature.value}</dd>
                  </div>
                ))}
              </dl>
            </section>
          ) : null}

          <div className="mt-8">
            <Link
              href="/contacto"
              className="inline-block rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition hover:bg-primary-hover"
            >
              Solicitar información
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
