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

/** Tarjeta grande: portada 16/10, eyebrow, titular, resumen, fecha y CTA. */
function PostStage({ post, index }: { post: PostWithCover; index: number }) {
  const date = formatDate(post.published_at);
  return (
    <Link href={`/blog/${post.slug}`} className="group block">
      {post.cover ? (
        <Image
          src={mediaUrl(post.cover)}
          alt={post.cover.alt_text}
          width={post.cover.width ?? 800}
          height={post.cover.height ?? 500}
          className="aspect-[16/10] w-full rounded-lg bg-surface-muted object-cover"
        />
      ) : (
        <EditorialCover
          index={index}
          className="aspect-[16/10] w-full p-6"
          numeralClassName="text-[7rem] sm:text-[9rem]"
        />
      )}
      <p className="mt-5 text-xs font-semibold uppercase tracking-wide text-orange">
        Artículo destacado
      </p>
      <h3 className="mt-2 text-2xl font-semibold text-petrol underline-offset-4 group-hover:underline sm:text-3xl">
        {post.title}
      </h3>
      {post.excerpt ? (
        <p className="mt-3 max-w-2xl text-muted-foreground">{post.excerpt}</p>
      ) : null}
      {date ? (
        <time
          dateTime={post.published_at ?? undefined}
          className="mt-3 block text-sm text-muted-foreground"
        >
          {date}
        </time>
      ) : null}
      <p className="mt-2 text-sm font-semibold text-primary">
        Leer artículo <span aria-hidden="true">→</span>
      </p>
    </Link>
  );
}

/**
 * Fila compacta: miniatura cuadrada, titular y fecha. `thumbClassName` permite
 * ocultar la miniatura donde la fila hace de sumario (índice del rotador en
 * móvil, donde queda justo debajo del mismo artículo a tamaño grande).
 */
function PostRow({
  post,
  index,
  thumbClassName = "",
}: {
  post: PostWithCover;
  index: number;
  thumbClassName?: string;
}) {
  const date = formatDate(post.published_at);
  return (
    <Link href={`/blog/${post.slug}`} className="group flex items-start gap-4">
      {post.cover ? (
        <Image
          src={mediaUrl(post.cover)}
          alt={post.cover.alt_text}
          width={post.cover.width ?? 112}
          height={post.cover.height ?? 112}
          className={`h-16 w-16 shrink-0 rounded-md bg-surface-muted object-cover ${thumbClassName}`}
        />
      ) : (
        <EditorialCover
          index={index}
          className={`h-16 w-16 shrink-0 p-1.5 ${thumbClassName}`}
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
  );
}

/**
 * Blog estático: un artículo destacado (el más reciente) y el resto en
 * jerarquía secundaria. Lo usa `/blog`, donde el lector viene a escanear el
 * archivo y nada debe moverse solo. Recibe siempre al menos un post: los
 * estados de error/vacío los gestiona la página.
 */
export function HomePostsSection({ posts }: { posts: PostWithCover[] }) {
  const [featured, ...rest] = posts;
  const secondary = rest.slice(0, 2);

  return (
    <div className={secondary.length > 0 ? "grid gap-10 lg:grid-cols-[3fr_2fr]" : ""}>
      <article>
        <PostStage post={featured} index={0} />
      </article>

      {secondary.length > 0 ? (
        <div className="divide-y divide-border border-t border-border lg:border-t-0">
          {secondary.map((post, index) => (
            <article key={post.id} className="py-5 first:lg:pt-0">
              <PostRow post={post} index={index + 1} />
            </article>
          ))}
        </div>
      ) : null}
    </div>
  );
}

/**
 * Blog de la home: el mismo par escenario + lista, pero los artículos se
 * turnan en el escenario con un fundido cruzado (6 s cada uno) y la fila
 * correspondiente del índice se marca con una barra ámbar sincronizada.
 *
 * CSS puro (restricción SSG): los turnos son `animation-delay` por
 * `nth-child` sobre un ciclo único, igual que el fondo rotativo del hero.
 * El vocabulario vive en `globals.css` (`.blog-rotator`). Los artículos que
 * no están en escena quedan en `visibility: hidden`, así que sus enlaces
 * salen del orden de tabulación y del árbol de accesibilidad. La rotación
 * se pausa con `:hover` y `:focus-within`, y con `prefers-reduced-motion`
 * no arranca: queda el primer artículo fijo, idéntico al estado estático.
 *
 * El CSS cubre 2, 3 o 4 turnos; por encima de eso no rota (ver globals.css),
 * de ahí el corte a 4.
 */
export function HomePostsRotator({ posts }: { posts: PostWithCover[] }) {
  const slides = posts.slice(0, 4);
  if (slides.length < 2) return <HomePostsSection posts={slides} />;

  return (
    <div className="blog-rotator grid gap-10 lg:grid-cols-[3fr_2fr]" data-slides={slides.length}>
      {/* Escenario: todos los artículos comparten celda de grid, así que el
          alto lo fija el más largo y el relevo no desplaza nada. */}
      <div className="grid">
        {slides.map((post, index) => (
          <article key={post.id} className="blog-slide col-start-1 row-start-1">
            <PostStage post={post} index={index} />
          </article>
        ))}
      </div>

      {/* Índice de los mismos artículos: sirve de sumario y de indicador de
          posición, así que la rotación no necesita puntos aparte. */}
      <ol className="divide-y divide-border border-t border-border lg:border-t-0">
        {slides.map((post, index) => (
          <li key={post.id} className="relative py-5 pl-4 first:lg:pt-0">
            <span
              aria-hidden="true"
              className="blog-index-bar absolute left-0 top-1/2 h-8 w-0.5 -translate-y-1/2 bg-amber"
            />
            <PostRow post={post} index={index} thumbClassName="max-lg:hidden" />
          </li>
        ))}
      </ol>
    </div>
  );
}
