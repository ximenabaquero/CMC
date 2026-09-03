import type { Metadata } from "next";
import { getPublishedPosts, getSiteSettings, sortPostsByCoverFirst } from "@/lib/content";
import { DataUnavailable, PostCard, SectionHeading } from "@/components/public/shared";
import { HomePostsRotator } from "@/components/public/HomePostsSection";
import { BlogCta } from "@/components/public/BlogCta";

/** Artículos que entran al escenario rotativo. Es el máximo que cubre el CSS
 *  de `.blog-rotator` (2, 3 o 4 turnos): subirlo exige añadir el keyframe y
 *  los `animation-delay` correspondientes en globals.css. */
const ROTATING_POSTS = 4;

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Artículos y consejos sobre panadería, repostería y el uso de margarinas, mantequillas y aceites.",
};

export default async function BlogPage() {
  let posts: Awaited<ReturnType<typeof getPublishedPosts>> | null = null;
  try {
    posts = sortPostsByCoverFirst(await getPublishedPosts());
  } catch {
    posts = null;
  }

  // Cacheado por tag, igual que los artículos: la banda de cierre no añade
  // consultas por visita. Si falla, el CTA se degrada al enlace de /contacto.
  const settings = await getSiteSettings().catch(() => null);

  return (
    <>
    <div className="mx-auto max-w-6xl px-4 py-14">
      <header className="mb-10 max-w-2xl">
        <p className="mb-1 text-sm font-semibold uppercase tracking-wide text-orange">Blog</p>
        <h1 className="text-3xl font-semibold text-petrol sm:text-4xl">Artículos y consejos</h1>
        <p className="mt-3 text-muted-foreground">
          Contenido sobre panadería, repostería y el mejor uso de nuestros productos.
        </p>
      </header>

      {posts === null ? (
        <DataUnavailable resource="los artículos" />
      ) : posts.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border bg-surface-muted p-10 text-center text-muted-foreground">
          Muy pronto publicaremos nuestros primeros artículos.
        </p>
      ) : (
        <>
          {/* Misma cabecera que la home —escenario rotativo + índice— y el
              resto en tarjetas. El índice lista siempre los artículos en
              escena, así que la rotación nunca esconde un destino: cambia lo
              que se muestra en grande, no lo que se puede clicar.

              **Cuatro turnos en `/blog`, tres en la home (2026-09-03).** El
              CSS de `.blog-rotator` cubre 2, 3 y 4 turnos, y aquí el corte
              estaba en 3 por herencia de la home. Con los cuatro artículos
              publicados eso dejaba uno solo abajo, en una rejilla de tres
              columnas: dos tercios de fila vacíos y una tarjeta huérfana bajo
              un divisor sin rótulo. Con los cuatro en escena el archivo no
              tiene sobrante, y el índice de la derecha llena el alto del
              escenario en vez de quedarse corto. La home sigue en tres: allí
              el blog es un adelanto, no el archivo. */}
          <HomePostsRotator posts={posts.slice(0, ROTATING_POSTS)} />
          {posts.length > ROTATING_POSTS ? (
            <section aria-labelledby="mas-articulos" className="mt-14 border-t border-border pt-10">
              <SectionHeading id="mas-articulos" eyebrow="Archivo" title="Más artículos" />
              <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {posts.slice(ROTATING_POSTS).map((post, index) => (
                  <li key={post.id} className="reveal">
                    <PostCard post={post} index={index + ROTATING_POSTS} />
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </>
      )}
    </div>
    {/* El índice terminaba en el pie sin una sola salida: era el único rincón
        del sitio público sin el camino a WhatsApp a un paso. Misma banda que
        cierra cada artículo. */}
    <BlogCta id="cta-blog" settings={settings} />
    </>
  );
}
