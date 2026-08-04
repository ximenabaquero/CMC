import Image from "next/image";
import Link from "next/link";
import { mediaUrl } from "@/lib/media";
import { Markdown } from "@/lib/markdown";
import type { PostWithCover } from "@/lib/content";

const dateFormatter = new Intl.DateTimeFormat("es-CO", { dateStyle: "long" });

/**
 * Artículo del blog. Se usa en la página pública /blog/[slug] y en la
 * vista previa del panel admin.
 */
export function PostArticle({ post }: { post: PostWithCover }) {
  return (
    <article className="mx-auto max-w-3xl px-4 py-10">
      <nav aria-label="Ruta de navegación" className="mb-6 text-sm text-muted-foreground">
        <Link href="/blog" className="underline-offset-2 hover:underline">
          Blog
        </Link>{" "}
        / <span aria-current="page">{post.title}</span>
      </nav>

      <header className="mb-8">
        <h1 className="text-3xl font-semibold sm:text-4xl">{post.title}</h1>
        {post.published_at ? (
          <p className="mt-2 text-sm text-muted-foreground">
            Publicado el{" "}
            <time dateTime={post.published_at}>
              {dateFormatter.format(new Date(post.published_at))}
            </time>
          </p>
        ) : null}
      </header>

      {post.cover ? (
        <Image
          src={mediaUrl(post.cover)}
          alt={post.cover.alt_text}
          width={post.cover.width ?? 1200}
          height={post.cover.height ?? 675}
          priority
          className="mb-8 w-full rounded-lg border border-border object-cover"
        />
      ) : null}

      <Markdown>{post.body}</Markdown>
    </article>
  );
}
