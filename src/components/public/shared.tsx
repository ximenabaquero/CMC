import Link from "next/link";
import Image from "next/image";
import { mediaUrl } from "@/lib/media";
import type { ProductWithImage, PostWithCover } from "@/lib/content";

/**
 * Encabezado de sección con jerarquía consistente.
 * - `id`: se aplica al <h2> para que funcione el `aria-labelledby` de la sección.
 * - `size="lg"`: título más grande para las secciones principales de la home.
 * - `tone`: "warm" (por defecto) = eyebrow naranja y título petróleo, el
 *   patrón de encabezado de todo el sitio público ("The Eyebrow Rule" de
 *   DESIGN.md). "default" conserva el eyebrow verde para contextos fuera de
 *   la paleta cálida. "onDark" (2026-08-28) es la adaptación para las bandas
 *   de color plenas —pilares en verde profundo, indicadores en azul—: el
 *   naranja editorial cae a ~2.6:1 sobre ellas, así que el eyebrow pasa a
 *   ámbar (5.1:1 sobre el verde profundo) y el título a blanco. Es la misma
 *   excepción ya documentada para el panel petróleo de la página de FAQ.
 */
export function SectionHeading({
  eyebrow,
  title,
  description,
  id,
  size = "md",
  tone = "warm",
}: {
  eyebrow?: string;
  title: string;
  description?: string | null;
  id?: string;
  size?: "md" | "lg";
  tone?: "default" | "warm" | "onDark";
}) {
  const eyebrowColor =
    tone === "warm" ? "text-orange" : tone === "onDark" ? "text-amber" : "text-primary";
  const titleColor = tone === "warm" ? "text-petrol" : tone === "onDark" ? "text-white" : "";
  const titleClasses =
    size === "lg"
      ? `text-3xl font-semibold sm:text-4xl ${titleColor}`
      : `text-2xl font-semibold sm:text-3xl ${titleColor}`;
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
      {description ? (
        <p className={`mt-2 ${tone === "onDark" ? "text-white/80" : "text-muted-foreground"}`}>
          {description}
        </p>
      ) : null}
    </div>
  );
}

/* Sistema de portadas editoriales para artículos sin imagen: fondo de color
   rotado por posición + numeral tipográfico. Sin imágenes falsas. Lo usan la
   home (HomePostsSection) y el índice del blog (PostCard). */
const EDITORIAL_COVERS = [
  { background: "bg-petrol", numeral: "text-white/25" },
  { background: "bg-orange", numeral: "text-white/25" },
  { background: "bg-amber", numeral: "text-petrol/25" },
];

export function EditorialCover({
  index,
  className,
  numeralClassName,
}: {
  index: number;
  className: string;
  numeralClassName: string;
}) {
  const cover = EDITORIAL_COVERS[index % EDITORIAL_COVERS.length];
  return (
    <div
      aria-hidden="true"
      className={`relative flex items-end justify-end overflow-hidden rounded-lg ${cover.background} ${className}`}
    >
      <span
        className={`font-display font-semibold leading-none ${cover.numeral} ${numeralClassName}`}
      >
        {String(index + 1).padStart(2, "0")}
      </span>
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
      className="group flex h-full flex-col overflow-hidden rounded-lg border border-border bg-surface transition hover:border-petrol/30 hover:shadow-md motion-reduce:transition-none"
    >
      {/* Lienzo blanco uniforme: el empaque nunca se recorta (object-contain). */}
      {product.image ? (
        <div className="aspect-square w-full bg-white p-5">
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
          className="flex aspect-square w-full items-center justify-center bg-surface-muted p-6"
        >
          <span className="font-display text-center text-lg font-semibold text-petrol/50">
            {product.name}
          </span>
        </div>
      )}
      <div className="flex flex-1 flex-col p-4">
        {product.category ? (
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-orange">
            {product.category.name}
          </p>
        ) : null}
        <h3 className="font-semibold text-petrol underline-offset-4 group-hover:underline">
          {product.name}
        </h3>
        {product.short_description ? (
          <p className="mt-1 line-clamp-3 text-sm text-muted-foreground">
            {product.short_description}
          </p>
        ) : null}
        <span className="mt-auto pt-3 text-sm font-semibold text-primary">
          Ver producto <span aria-hidden="true">→</span>
        </span>
      </div>
    </Link>
  );
}

export function PostCard({ post, index = 0 }: { post: PostWithCover; index?: number }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-lg border border-border bg-surface transition hover:border-petrol/30 hover:shadow-md motion-reduce:transition-none"
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
        <EditorialCover
          index={index}
          className="aspect-[16/9] w-full rounded-none p-4"
          numeralClassName="text-6xl"
        />
      )}
      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-semibold text-petrol underline-offset-4 group-hover:underline">
          {post.title}
        </h3>
        {post.excerpt ? (
          <p className="mt-1 line-clamp-3 text-sm text-muted-foreground">{post.excerpt}</p>
        ) : null}
        <span className="mt-auto pt-3 text-sm font-semibold text-primary">
          Leer artículo <span aria-hidden="true">→</span>
        </span>
      </div>
    </Link>
  );
}

