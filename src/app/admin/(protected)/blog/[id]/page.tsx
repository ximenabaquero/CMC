import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { mediaUrl } from "@/lib/media";
import {
  deletePost,
  removePostCover,
  removePostImage,
  uploadPostCover,
  uploadPostImage,
} from "@/actions/posts";
import { PostForm } from "./PostForm";
import { UploadImageForm } from "@/components/admin/UploadImageForm";
import { InsertImageButton } from "@/components/admin/markdown-insert";
import { ConfirmSubmitButton } from "@/components/admin/buttons";
import { ActionForm } from "@/components/admin/ActionForm";
import { FlashToast } from "@/components/admin/FlashToast";
import { PageHeader } from "@/components/admin/PageHeader";

export const metadata = { title: "Editar artículo" };

export default async function EditPostPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ creado?: string }>;
}) {
  const [{ id }, { creado }] = await Promise.all([params, searchParams]);
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

  // Imágenes del cuerpo: post_media guarda el vínculo, media_assets los
  // metadatos (mismo patrón que la galería de productos).
  const { data: links } = await supabase
    .from("post_media")
    .select("media_asset_id")
    .eq("post_id", id);

  const bodyImageIds = (links ?? []).map((link) => link.media_asset_id);
  const { data: bodyImages } = bodyImageIds.length
    ? await supabase.from("media_assets").select("*").in("id", bodyImageIds).order("created_at")
    : { data: [] };

  const maxUploadMb = Number(process.env.MAX_UPLOAD_MB ?? "5");

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <FlashToast
        message={
          creado ? "Artículo creado. Escribe el contenido y publícalo cuando esté listo." : null
        }
      />
      <PageHeader
        title={post.title}
        backHref="/admin/blog"
        backLabel="Blog"
        actions={
          <Link
            href={`/admin/blog/${post.id}/vista-previa`}
            className="inline-flex min-h-10 items-center rounded-md border border-border px-3 py-1.5 text-sm font-medium hover:bg-surface-muted"
          >
            Vista previa
          </Link>
        }
      />

      {post.internal_note ? (
        <p className="rounded-md border border-secondary/40 bg-secondary/10 p-3 text-sm">
          <strong>Nota interna:</strong> {post.internal_note}
        </p>
      ) : null}

      <PostForm post={post}>
        {/* Va dentro de PostForm (no dentro de su <form>) para poder
            escribir en el cursor del editor; ver markdown-insert.tsx. */}
        <section
          aria-labelledby="imagenes-contenido"
          className="rounded-lg border border-border bg-surface p-5"
        >
          <h2 id="imagenes-contenido" className="mb-1 text-lg font-semibold">
            Imágenes dentro del artículo
          </h2>
          <p className="mb-4 text-sm text-muted-foreground">
            Son las fotos que aparecen entre los párrafos. Súbelas aquí y colócalas con «Insertar
            en el texto»: se ponen donde tengas el cursor. La portada se sube más abajo.
          </p>

          {(bodyImages ?? []).length === 0 ? (
            <p className="mb-4 text-sm text-muted-foreground">
              Este artículo aún no tiene imágenes en el contenido.
            </p>
          ) : (
            <ul className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
              {(bodyImages ?? []).map((asset) => (
                <li key={asset.id} className="rounded-md border border-border p-2">
                  <Image
                    src={mediaUrl(asset)}
                    alt={asset.alt_text}
                    width={240}
                    height={160}
                    className="mb-2 aspect-[3/2] w-full rounded bg-surface-muted object-cover"
                  />
                  <div className="flex flex-wrap items-center gap-2">
                    <InsertImageButton url={mediaUrl(asset)} alt={asset.alt_text} />
                    <ActionForm action={removePostImage.bind(null, post.id, asset.id)}>
                      <ConfirmSubmitButton
                        pendingLabel="Quitando…"
                        confirmMessage="¿Eliminar esta imagen? Se borrará del almacenamiento; si está insertada en el texto, quítala antes del contenido."
                      >
                        Quitar
                      </ConfirmSubmitButton>
                    </ActionForm>
                  </div>
                </li>
              ))}
            </ul>
          )}

          <h3 className="mb-2 text-sm font-semibold">Subir imagen al contenido</h3>
          <UploadImageForm
            action={uploadPostImage.bind(null, post.id)}
            buttonLabel="Subir imagen"
            maxUploadMb={maxUploadMb}
          />
        </section>
      </PostForm>

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
            <ActionForm action={removePostCover.bind(null, post.id)}>
              <ConfirmSubmitButton
                pendingLabel="Quitando…"
                confirmMessage="¿Quitar la imagen de portada? Si fue subida desde el panel también se eliminará del almacenamiento."
              >
                Quitar portada
              </ConfirmSubmitButton>
            </ActionForm>
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
        <ActionForm action={deletePost.bind(null, post.id)}>
          <ConfirmSubmitButton confirmMessage={`¿Eliminar definitivamente "${post.title}"? Esta acción no se puede deshacer.`}>
            Eliminar artículo
          </ConfirmSubmitButton>
        </ActionForm>
      </section>
    </div>
  );
}
