import type { Metadata } from "next";
import { getPublishedPosts } from "@/lib/content";
import { DataUnavailable, PostCard } from "@/components/public/shared";
import { HomePostsSection } from "@/components/public/HomePostsSection";

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
          {/* Jerarquía editorial: el más reciente destacado (mismo patrón que
              la home) y el resto en tarjetas. */}
          <HomePostsSection posts={posts.slice(0, 3)} />
          {posts.length > 3 ? (
            <ul className="mt-12 grid gap-4 border-t border-border pt-10 sm:grid-cols-2 lg:grid-cols-3">
              {posts.slice(3).map((post, index) => (
                <li key={post.id}>
                  <PostCard post={post} index={index + 3} />
                </li>
              ))}
            </ul>
          ) : null}
        </>
      )}
    </div>
  );
}
