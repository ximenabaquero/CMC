import Image from "next/image";
import Link from "next/link";
import { mediaUrl } from "@/lib/media";
import { Markdown } from "@/lib/markdown";
import type { ProductDetailData } from "@/lib/content";
import type { SiteSettings } from "@/lib/supabase/types";

/**
 * Detalle de producto. Se usa tanto en la página pública
 * /productos/[slug] como en la vista previa del panel admin.
 * `settings` es opcional: con WhatsApp configurado, el CTA principal abre el
 * chat con el nombre del producto prellenado; sin él, se degrada a /contacto.
 */
export function ProductDetail({
  product,
  settings,
}: {
  product: ProductDetailData;
  settings?: SiteSettings | null;
}) {
  const whatsappHref = settings?.whatsapp
    ? `https://wa.me/${settings.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(
        `Hola, me interesa el producto ${product.name}.`
      )}`
    : null;

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
          {/* Lienzo blanco: el empaque completo, sin recortes. */}
          {product.image ? (
            <div className="aspect-square w-full overflow-hidden rounded-lg border border-border bg-white p-6">
              <Image
                src={mediaUrl(product.image)}
                alt={product.image.alt_text}
                width={product.image.width ?? 800}
                height={product.image.height ?? 800}
                priority
                className="h-full w-full object-contain object-center"
              />
            </div>
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
                  {/* Enlace a la imagen completa: ampliación honesta sin JS. */}
                  <a
                    href={mediaUrl(asset)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block overflow-hidden rounded-md border border-border bg-white p-1.5 transition hover:border-petrol/30"
                  >
                    <Image
                      src={mediaUrl(asset)}
                      alt={asset.alt_text}
                      width={160}
                      height={160}
                      className="aspect-square w-full object-contain"
                    />
                  </a>
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        <div>
          {product.category ? (
            <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-orange">
              {product.category.name}
            </p>
          ) : null}
          <h1 className="text-3xl font-semibold text-petrol">{product.name}</h1>
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

          <div className="mt-8 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
            {whatsappHref ? (
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary-hover ease-out active:scale-[0.98] motion-reduce:active:scale-100"
              >
                Pedir información por WhatsApp
              </a>
            ) : (
              <Link
                href="/contacto"
                className="inline-block rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition ease-out hover:bg-primary-hover active:scale-[0.98] motion-reduce:active:scale-100"
              >
                Solicitar información
              </Link>
            )}
            {product.technicalSheet ? (
              // CTA secundario: descarga de la ficha técnica oficial (PDF).
              <a
                href={mediaUrl(product.technicalSheet)}
                download={`ficha-tecnica-${product.slug}.pdf`}
                className="inline-block rounded-md border-2 border-petrol px-6 py-[10px] text-sm font-semibold text-petrol transition ease-out hover:bg-petrol hover:text-white active:scale-[0.98] motion-reduce:active:scale-100"
              >
                Descargar ficha técnica (PDF)
              </a>
            ) : null}
            {whatsappHref ? (
              <Link
                href="/contacto"
                className="text-sm font-medium text-petrol underline-offset-4 hover:underline"
              >
                Otros canales de contacto
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  );
}
