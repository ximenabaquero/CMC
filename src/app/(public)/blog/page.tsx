import type { Metadata } from "next";
import { getPublishedPosts } from "@/lib/content";
import { DataUnavailable, PostCard } from "@/components/public/shared";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Artículos y consejos sobre panadería, repostería y el uso de margarinas, mantequillas y aceites.",
};

export default async function BlogPage() {
  let posts: Awaited<ReturnType<typeof getPublishedPosts>> | null = null;
  try {
    posts = await getPublishedPosts();
  } catch {
    posts = null;
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-14">
      <header className="mb-10 max-w-2xl">
        <p className="mb-1 text-sm font-semibold uppercase tracking-wide text-primary">Blog</p>
        <h1 className="text-3xl font-semibold sm:text-4xl">Artículos y consejos</h1>
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
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <li key={post.id}>
              <PostCard post={post} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
