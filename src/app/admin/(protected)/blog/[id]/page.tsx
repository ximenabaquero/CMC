import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { mediaUrl } from "@/lib/media";
import { deletePost, removePostCover, uploadPostCover } from "@/actions/posts";
import { PostForm } from "./PostForm";
import { UploadImageForm } from "@/components/admin/UploadImageForm";
import { ConfirmSubmitButton } from "@/components/admin/buttons";

export const metadata = { title: "Editar artículo" };

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();

  const { data: post, error } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error("No se pudo cargar el artículo.");
  if (!post) notFound();

  const { data: cover } = post.cover_image_id
    ? await supabase.from("media_assets").select("*").eq("id", post.cover_image_id).maybeSingle()
    : { data: null };

  const maxUploadMb = Number(process.env.MAX_UPLOAD_MB ?? "5");

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs text-muted-foreground">
            <Link href="/admin/blog" className="underline-offset-2 hover:underline">
              Blog
            </Link>{" "}
            / {post.title}
          </p>
          <h1 className="text-2xl font-semibold">{post.title}</h1>
        </div>
        <Link
          href={`/admin/blog/${post.id}/vista-previa`}
          className="rounded-md border border-border px-3 py-1.5 text-sm font-medium hover:bg-surface-muted"
        >
          Vista previa
        </Link>
      </div>

      {post.internal_note ? (
        <p className="rounded-md border border-secondary/40 bg-secondary/10 p-3 text-sm">
          <strong>Nota interna:</strong> {post.internal_note}
        </p>
      ) : null}

      <PostForm post={post} />

      <section aria-labelledby="portada" className="rounded-lg border border-border bg-surface p-5">
        <h2 id="portada" className="mb-4 text-lg font-semibold">
          Imagen de portada
        </h2>
        {cover ? (
          <div className="mb-4 flex items-start gap-4">
            <Image
              src={mediaUrl(cover)}
              alt={cover.alt_text}
              width={200}
              height={120}
              className="rounded-md border border-border object-cover"
            />
            <form action={removePostCover.bind(null, post.id)}>
              <ConfirmSubmitButton confirmMessage="¿Quitar la imagen de portada? Si fue subida desde el panel también se eliminará del almacenamiento.">
                Quitar portada
              </ConfirmSubmitButton>
            </form>
          </div>
        ) : (
          <p className="mb-4 text-sm text-muted-foreground">Este artículo no tiene portada.</p>
        )}
        <h3 className="mb-2 text-sm font-semibold">
          {cover ? "Reemplazar portada" : "Subir portada"}
        </h3>
        <UploadImageForm action={uploadPostCover.bind(null, post.id)} maxUploadMb={maxUploadMb} />
      </section>

      <section className="rounded-lg border border-accent/30 bg-surface p-5">
        <h2 className="mb-2 text-lg font-semibold">Eliminar artículo</h2>
        <p className="mb-3 text-sm text-muted-foreground">Esta acción no se puede deshacer.</p>
        <form action={deletePost.bind(null, post.id)}>
          <ConfirmSubmitButton confirmMessage={`¿Eliminar definitivamente "${post.title}"? Esta acción no se puede deshacer.`}>
            Eliminar artículo
          </ConfirmSubmitButton>
        </form>
      </section>
    </div>
  );
}
