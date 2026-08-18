import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { FlashToast } from "@/components/admin/FlashToast";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { EmptyState } from "@/components/admin/EmptyState";

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
      <FlashToast message={params.eliminado ? "Artículo eliminado." : null} />
      <PageHeader
        title="Blog"
        description="Los artículos en borrador no aparecen en el sitio público."
        actions={
          <Link
            href="/admin/blog/nuevo"
            className="inline-flex min-h-11 items-center rounded-md bg-primary px-4 py-2 text-base font-medium text-primary-foreground hover:bg-primary-hover"
          >
            + Nuevo artículo
          </Link>
        }
      />

      {posts.length === 0 ? (
        <EmptyState
          title="Aún no hay artículos"
          description="Crea el primer artículo del blog; quedará en borrador hasta que lo publiques."
          cta={{ href: "/admin/blog/nuevo", label: "Crear primer artículo" }}
        />
      ) : null}

      <ul className="space-y-2">
        {posts.map((post) => (
          <li key={post.id}>
            <Link
              href={`/admin/blog/${post.id}`}
              className="flex items-center gap-4 rounded-lg border border-border bg-surface p-4 transition hover:border-primary"
            >
              <span className="min-w-0 flex-1">
                <span className="block truncate text-base font-medium">{post.title}</span>
                <span className="block truncate text-sm text-muted-foreground">/blog/{post.slug}</span>
                {post.internal_note ? (
                  <span className="mt-1 block truncate text-xs text-secondary">
                    Nota: {post.internal_note}
                  </span>
                ) : null}
              </span>
              <StatusBadge status={post.status} />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
