import Link from "next/link";
import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { PostArticle } from "@/components/public/PostArticle";

export const metadata = { title: "Vista previa del artículo" };

/** Vista previa del artículo (incluye borradores) para el administrador. */
export default async function PostPreviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();

  const { data: post, error } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error("No se pudo cargar la vista previa.");
  if (!post) notFound();

  const { data: cover } = post.cover_image_id
    ? await supabase.from("media_assets").select("*").eq("id", post.cover_image_id).maybeSingle()
    : { data: null };

  return (
    <div className="-m-4 sm:-m-6 lg:-m-8">
      <div className="flex items-center justify-between gap-3 border-b border-secondary/40 bg-secondary/10 px-4 py-2 text-sm">
        <p>
          <strong>Vista previa</strong> — así se verá el artículo
          {post.status === "DRAFT" ? " cuando lo publiques" : ""}.
        </p>
        <Link
          href={`/admin/blog/${post.id}`}
          className="rounded-md border border-border bg-surface px-3 py-1 font-medium hover:bg-surface-muted"
        >
          Volver a editar
        </Link>
      </div>
      <div className="bg-background">
        <PostArticle post={{ ...post, cover: cover ?? null }} />
      </div>
    </div>
  );
}
