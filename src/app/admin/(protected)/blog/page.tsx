import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata = { title: "Blog" };

export default async function AdminBlogPage({
  searchParams,
}: {
  searchParams: Promise<{ eliminado?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createSupabaseServerClient();

  const { data: posts, error } = await supabase
    .from("blog_posts")
    .select("id, title, slug, status, published_at, internal_note")
    .order("created_at", { ascending: false });

  if (error) throw new Error("No se pudieron cargar los artículos.");

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Blog</h1>
          <p className="text-sm text-muted-foreground">
            Los artículos en borrador no aparecen en el sitio público.
          </p>
        </div>
        <Link
          href="/admin/blog/nuevo"
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary-hover"
        >
          + Nuevo artículo
        </Link>
      </div>

      {params.eliminado ? (
        <p role="status" className="mb-4 rounded-md border border-primary/40 bg-primary/10 p-3 text-sm text-primary">
          Artículo eliminado.
        </p>
      ) : null}

      <ul className="space-y-2">
        {posts.map((post) => (
          <li key={post.id}>
            <Link
              href={`/admin/blog/${post.id}`}
              className="flex items-center gap-4 rounded-lg border border-border bg-surface p-4 transition hover:border-primary"
            >
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium">{post.title}</span>
                <span className="block truncate text-xs text-muted-foreground">/blog/{post.slug}</span>
                {post.internal_note ? (
                  <span className="mt-1 block truncate text-xs text-secondary">
                    Nota: {post.internal_note}
                  </span>
                ) : null}
              </span>
              <span
                className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  post.status === "PUBLISHED"
                    ? "bg-primary/10 text-primary"
                    : "bg-surface-muted text-muted-foreground"
                }`}
              >
                {post.status === "PUBLISHED" ? "Publicado" : "Borrador"}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
