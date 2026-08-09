import Link from "next/link";
import Image from "next/image";
import { mediaUrl } from "@/lib/media";
import { Markdown } from "@/lib/markdown";
import type { ProductWithImage, PostWithCover } from "@/lib/content";
import type { Faq } from "@/lib/supabase/types";

/**
 * Encabezado de sección con jerarquía consistente.
 * `id`, `size` y `tone` son opcionales y con sus valores por defecto el
 * componente se comporta exactamente igual que antes (lo usan otras páginas
 * públicas que no forman parte del rediseño de la home).
 * - `id`: se aplica al <h2> para que funcione el `aria-labelledby` de la sección.
 * - `size="lg"`: título más grande para las secciones principales de la home.
 * - `tone="warm"`: eyebrow naranja y título petróleo (paleta cálida de la home).
 */
export function SectionHeading({
  eyebrow,
  title,
  description,
  id,
  size = "md",
  tone = "default",
}: {
  eyebrow?: string;
  title: string;
  description?: string | null;
  id?: string;
  size?: "md" | "lg";
  tone?: "default" | "warm";
}) {
  const eyebrowColor = tone === "warm" ? "text-orange" : "text-primary";
  const titleClasses =
    size === "lg"
      ? `text-3xl font-semibold sm:text-4xl ${tone === "warm" ? "text-petrol" : ""}`
      : `text-2xl font-semibold sm:text-3xl ${tone === "warm" ? "text-petrol" : ""}`;
  return (
    <div className="mb-8 max-w-2xl">
      {eyebrow ? (
        <p className={`mb-1 text-sm font-semibold uppercase tracking-wide ${eyebrowColor}`}>
          {eyebrow}
        </p>
      ) : null}
      <h2 id={id} className={titleClasses.trim()}>
        {title}
      </h2>
      {description ? <p className="mt-2 text-muted-foreground">{description}</p> : null}
    </div>
  );
}

/** Estado elegante cuando la base de datos no está disponible. */
export function DataUnavailable({ resource }: { resource: string }) {
  return (
    <div className="rounded-lg border border-border bg-surface-muted p-8 text-center">
      <p className="font-medium">No pudimos cargar {resource} en este momento.</p>
      <p className="mt-1 text-sm text-muted-foreground">
        Estamos trabajando para restablecer el servicio. Vuelve a intentarlo en unos minutos.
      </p>
    </div>
  );
}

/** Estado del catálogo cuando aún no hay productos publicados. */
export function CatalogInPreparation() {
  return (
    <div className="rounded-lg border border-dashed border-border bg-surface-muted p-10 text-center">
      <p className="text-lg font-semibold">Catálogo en preparación</p>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
        Estamos organizando la información de nuestros productos. Muy pronto podrás conocer aquí
        nuestras margarinas, mantequillas y aceites.
      </p>
    </div>
  );
}

export function ProductCard({ product }: { product: ProductWithImage }) {
  return (
    <Link
      href={`/productos/${product.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-lg border border-border bg-surface transition hover:border-primary hover:shadow-sm"
    >
      {product.image ? (
        <Image
          src={mediaUrl(product.image)}
          alt={product.image.alt_text}
          width={product.image.width ?? 600}
          height={product.image.height ?? 600}
          className="aspect-square w-full bg-surface-muted object-cover"
        />
      ) : (
        <div
          aria-hidden="true"
          className="flex aspect-square w-full items-center justify-center bg-surface-muted text-sm text-muted-foreground"
        >
          Imagen en preparación
        </div>
      )}
      <div className="flex flex-1 flex-col p-4">
        {product.category ? (
          <p className="mb-1 text-xs font-medium uppercase tracking-wide text-primary">
            {product.category.name}
          </p>
        ) : null}
        <h3 className="font-semibold group-hover:text-primary">{product.name}</h3>
        {product.short_description ? (
          <p className="mt-1 line-clamp-3 text-sm text-muted-foreground">
            {product.short_description}
          </p>
        ) : null}
        <span className="mt-auto pt-3 text-sm font-medium text-secondary">Ver producto →</span>
      </div>
    </Link>
  );
}

export function PostCard({ post }: { post: PostWithCover }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-lg border border-border bg-surface transition hover:border-primary hover:shadow-sm"
    >
      {post.cover ? (
        <Image
          src={mediaUrl(post.cover)}
          alt={post.cover.alt_text}
          width={post.cover.width ?? 800}
          height={post.cover.height ?? 450}
          className="aspect-[16/9] w-full bg-surface-muted object-cover"
        />
      ) : (
        <div
          aria-hidden="true"
          className="flex aspect-[16/9] w-full items-center justify-center bg-surface-muted text-sm text-muted-foreground"
        >
          {/* Placeholder identificado: aún no hay imagen de portada */}
          Artículo
        </div>
      )}
      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-semibold group-hover:text-primary">{post.title}</h3>
        {post.excerpt ? (
          <p className="mt-1 line-clamp-3 text-sm text-muted-foreground">{post.excerpt}</p>
        ) : null}
        <span className="mt-auto pt-3 text-sm font-medium text-secondary">Leer artículo →</span>
      </div>
    </Link>
  );
}

/** Acordeón accesible de preguntas frecuentes (details/summary nativo). */
export function FaqList({ faqs }: { faqs: Faq[] }) {
  return (
    <ul className="space-y-3">
      {faqs.map((faq) => (
        <li key={faq.id}>
          <details className="group rounded-lg border border-border bg-surface">
            <summary className="cursor-pointer list-none px-5 py-4 font-medium marker:hidden [&::-webkit-details-marker]:hidden">
              <span className="flex items-center justify-between gap-3">
                {faq.question}
                <span
                  aria-hidden="true"
                  className="text-primary transition-transform group-open:rotate-45"
                >
                  +
                </span>
              </span>
            </summary>
            <div className="border-t border-border px-5 py-4 text-sm">
              <Markdown>{faq.answer}</Markdown>
            </div>
          </details>
        </li>
      ))}
    </ul>
  );
}
