import Image from "next/image";
import Link from "next/link";
import { mediaUrl } from "@/lib/media";
import { Markdown } from "@/lib/markdown";
import { PostCard, SectionHeading } from "@/components/public/shared";
import { WhatsAppIcon } from "@/components/public/icons";
import type { PostWithCover } from "@/lib/content";
import type { SiteSettings } from "@/lib/supabase/types";

const dateFormatter = new Intl.DateTimeFormat("es-CO", { dateStyle: "long" });

/** Minutos de lectura a 200 palabras/minuto. Se deriva del cuerpo, así que
 *  no añade un campo más al formulario del panel. */
function readingMinutes(body: string): number {
  const words = body.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

/** El resumen entra como bajada de la cabecera solo si no repite el arranque
 *  del cuerpo: al redactar es natural copiar el primer párrafo en el resumen,
 *  y verlo dos veces seguidas se lee como un error, no como jerarquía. */
function leadFrom(post: PostWithCover): string | null {
  if (!post.excerpt) return null;
  const normalize = (text: string) =>
    text
      .toLowerCase()
      .replace(/[^\p{L}\p{N}]+/gu, " ")
      .trim();
  const excerpt = normalize(post.excerpt);
  if (!excerpt) return null;
  return normalize(post.body).startsWith(excerpt.slice(0, 60)) ? null : post.excerpt;
}

/**
 * Artículo del blog. Se usa en la página pública /blog/[slug] y en la
 * vista previa del panel admin.
 *
 * Composición editorial (2026-08-21): cabecera sobre crema (eyebrow →
 * titular Fraunces → bajada → ficha de fecha y lectura), portada que
 * rompe a un ancho mayor que la columna de lectura, cuerpo en
 * `prose-article` y dos bandas de cierre — «Sigue leyendo» y el camino a
 * WhatsApp — para que el artículo no termine en un callejón sin salida.
 *
 * `related` y `settings` son opcionales porque la vista previa del panel
 * no los tiene: sin artículos relacionados la banda no se dibuja, y sin
 * canales el CTA se degrada al enlace de /contacto.
 */
export function PostArticle({
  post,
  related = [],
  settings,
}: {
  post: PostWithCover;
  related?: PostWithCover[];
  settings?: SiteSettings | null;
}) {
  const lead = leadFrom(post);
  const minutes = readingMinutes(post.body);
  const whatsappHref = settings?.whatsapp
    ? `https://wa.me/${settings.whatsapp.replace(/\D/g, "")}`
    : null;

  return (
    <>
      <article>
        {/* Cabecera sobre crema: la banda hace de portada cuando el
            artículo no tiene foto, que es el caso por defecto. */}
        <header className="border-b border-border bg-cream">
          <div className="mx-auto max-w-4xl px-4 pb-12 pt-8 sm:pb-14 sm:pt-10">
            {/* 40rem es la medida de lectura del artículo (~75 caracteres a
                17px): la comparten miga, titular, bajada y cuerpo para que
                todo el texto caiga sobre el mismo eje. La portada es lo único
                que rompe a un ancho mayor. */}
            <nav
              aria-label="Ruta de navegación"
              className="mx-auto mb-8 max-w-[40rem] text-sm text-muted-foreground"
            >
              <Link href="/blog" className="underline-offset-2 hover:underline">
                Blog
              </Link>{" "}
              <span aria-hidden="true">/</span>{" "}
              <span aria-current="page" className="text-petrol">
                {post.title}
              </span>
            </nav>

            <div className="mx-auto max-w-[40rem]">
              <p className="text-sm font-semibold uppercase tracking-wide text-orange">Artículo</p>
              <h1 className="mt-3 text-balance text-4xl font-semibold leading-[1.08] text-petrol sm:text-5xl">
                {post.title}
              </h1>
              {lead ? (
                <p className="mt-5 text-lg leading-relaxed text-muted-foreground sm:text-xl">
                  {lead}
                </p>
              ) : null}
              <p className="mt-7 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-border pt-4 text-sm text-muted-foreground">
                {post.published_at ? (
                  <>
                    <time dateTime={post.published_at}>
                      Publicado el {dateFormatter.format(new Date(post.published_at))}
                    </time>
                    <span aria-hidden="true" className="text-border">
                      ·
                    </span>
                  </>
                ) : null}
                <span>{minutes} min de lectura</span>
              </p>
            </div>

            {/* La portada rompe a todo el ancho del contenedor: más ancha que
                la columna de lectura, misma receta de escena real enmarcada
                (esquina lg + borde arena, sin sombra). */}
            {post.cover ? (
              <Image
                src={mediaUrl(post.cover)}
                alt={post.cover.alt_text}
                width={post.cover.width ?? 1200}
                height={post.cover.height ?? 675}
                priority
                className="mt-10 w-full rounded-lg border border-border"
              />
            ) : null}
          </div>
        </header>

        <div className="mx-auto max-w-[40rem] px-4 py-12 sm:py-16">
          <Markdown className={lead ? "prose-article" : "prose-article prose-article--entrada"}>
            {post.body}
          </Markdown>

          <p className="mt-14 border-t border-border pt-6">
            <Link
              href="/blog"
              className="text-sm font-semibold text-primary underline-offset-4 hover:underline"
            >
              <span aria-hidden="true">←</span> Todos los artículos
            </Link>
          </p>
        </div>
      </article>

      {related.length > 0 ? (
        <section aria-labelledby="sigue-leyendo" className="border-t border-border bg-cream">
          <div className="mx-auto max-w-6xl px-4 py-14 sm:py-16">
            <SectionHeading id="sigue-leyendo" eyebrow="Sigue leyendo" title="Otros artículos" />
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((item, index) => (
                <li key={item.id} className="reveal">
                  <PostCard post={item} index={index} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      {/* El momento de mayor credibilidad es el final del artículo: ahí va
          el camino a WhatsApp, como en el resto del sitio. Eyebrow ámbar
          sobre petróleo (adaptación documentada de la Eyebrow Rule). */}
      <section aria-labelledby="cta-articulo" className="bg-petrol-deep">
        <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-14 sm:py-16 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-wide text-amber">Asesoría</p>
            <h2
              id="cta-articulo"
              className="mt-2 text-balance text-2xl font-semibold text-white sm:text-3xl"
            >
              ¿Tienes preguntas sobre nuestros productos?
            </h2>
            <p className="mt-3 text-white/80">
              Te ayudamos a elegir la margarina, mantequilla o aceite que mejor se ajusta a tu
              proceso de producción.
            </p>
          </div>
          {whatsappHref ? (
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex shrink-0 items-center gap-2.5 self-start rounded-md bg-amber px-7 py-3.5 text-base font-semibold text-petrol-deep transition ease-out hover:bg-amber-hover active:scale-[0.98] motion-reduce:active:scale-100 lg:self-auto"
            >
              <WhatsAppIcon className="size-5 shrink-0" />
              Escríbenos por WhatsApp
            </a>
          ) : (
            <Link
              href="/contacto"
              className="inline-block shrink-0 self-start rounded-md bg-amber px-7 py-3.5 text-base font-semibold text-petrol-deep transition ease-out hover:bg-amber-hover active:scale-[0.98] motion-reduce:active:scale-100 lg:self-auto"
            >
              Contáctanos
            </Link>
          )}
        </div>
      </section>
    </>
  );
}
