import Image from "next/image";
import Link from "next/link";
import { mediaUrl } from "@/lib/media";
import type { PostWithCover } from "@/lib/content";
import { EditorialCover } from "@/components/public/shared";

const DATE_FORMATTER = new Intl.DateTimeFormat("es-CO", { dateStyle: "long" });

/** Devuelve la fecha formateada o null si es nula o inválida (se omite). */
function formatDate(value: string | null): string | null {
  if (!value) return null;
  const timestamp = Date.parse(value);
  if (Number.isNaN(timestamp)) return null;
  return DATE_FORMATTER.format(new Date(timestamp));
}

/**
 * Blog de la home: un artículo destacado (el más reciente) y el resto en
 * jerarquía secundaria. Recibe siempre al menos un post: los estados de
 * error/vacío los gestiona la página con los componentes existentes.
 */
export function HomePostsSection({ posts }: { posts: PostWithCover[] }) {
  const [featured, ...rest] = posts;
  const secondary = rest.slice(0, 2);
  const featuredDate = formatDate(featured.published_at);

  return (
    <div className={secondary.length > 0 ? "grid gap-10 lg:grid-cols-[3fr_2fr]" : ""}>
      {/* Artículo destacado */}
      <article>
        <Link href={`/blog/${featured.slug}`} className="group block">
          {featured.cover ? (
            <Image
              src={mediaUrl(featured.cover)}
              alt={featured.cover.alt_text}
              width={featured.cover.width ?? 800}
              height={featured.cover.height ?? 500}
              className="aspect-[16/10] w-full rounded-lg bg-surface-muted object-cover"
            />
          ) : (
            <EditorialCover
              index={0}
              className="aspect-[16/10] w-full p-6"
              numeralClassName="text-[7rem] sm:text-[9rem]"
            />
          )}
          <p className="mt-5 text-xs font-semibold uppercase tracking-wide text-orange">
            Artículo destacado
          </p>
          <h3 className="mt-2 text-2xl font-semibold text-petrol underline-offset-4 group-hover:underline sm:text-3xl">
            {featured.title}
          </h3>
          {featured.excerpt ? (
            <p className="mt-3 max-w-2xl text-muted-foreground">{featured.excerpt}</p>
          ) : null}
          {featuredDate ? (
            <time
              dateTime={featured.published_at ?? undefined}
              className="mt-3 block text-sm text-muted-foreground"
            >
              {featuredDate}
            </time>
          ) : null}
          <p className="mt-2 text-sm font-semibold text-primary">
            Leer artículo <span aria-hidden="true">→</span>
          </p>
        </Link>
      </article>

      {/* Artículos secundarios */}
      {secondary.length > 0 ? (
        <div className="divide-y divide-border border-t border-border lg:border-t-0">
          {secondary.map((post, index) => {
            const date = formatDate(post.published_at);
            return (
              <article key={post.id} className="py-5 first:lg:pt-0">
                <Link href={`/blog/${post.slug}`} className="group flex items-start gap-4">
                  {post.cover ? (
                    <Image
                      src={mediaUrl(post.cover)}
                      alt={post.cover.alt_text}
                      width={post.cover.width ?? 112}
                      height={post.cover.height ?? 112}
                      className="h-16 w-16 shrink-0 rounded-md bg-surface-muted object-cover"
                    />
                  ) : (
                    <EditorialCover
                      index={index + 1}
                      className="h-16 w-16 shrink-0 p-1.5"
                      numeralClassName="text-2xl"
                    />
                  )}
                  <div>
                    <h3 className="font-semibold leading-snug text-petrol underline-offset-4 group-hover:underline">
                      {post.title}
                    </h3>
                    {date ? (
                      <time
                        dateTime={post.published_at ?? undefined}
                        className="mt-1 block text-sm text-muted-foreground"
                      >
                        {date}
                      </time>
                    ) : null}
                  </div>
                </Link>
              </article>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
