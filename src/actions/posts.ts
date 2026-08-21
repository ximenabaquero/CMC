"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { blogPostSchema, slugSchema } from "@/lib/validation";
import {
  DB_ERROR_MESSAGE,
  NO_ROWS_MESSAGE,
  actionError,
  actionSuccess,
  zodActionError,
  type ActionState,
} from "@/lib/action-state";
import { saveUploadedImage, deleteManagedAsset } from "@/lib/media-upload";
import { mediaUrl } from "@/lib/media";
import { CACHE_TAGS, revalidatePublicContent } from "@/lib/revalidate";

export async function createPost(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { userId } = await requireAdmin();
  const supabase = await createSupabaseServerClient();

  const title = String(formData.get("title") ?? "").trim();
  const slugResult = slugSchema.safeParse(formData.get("slug"));
  if (!title) {
    return actionError("El título es obligatorio.", { title: ["El título es obligatorio."] });
  }
  if (!slugResult.success) {
    const message = slugResult.error.issues[0]?.message ?? "Slug inválido.";
    return actionError(message, { slug: [message] });
  }

  const { data, error } = await supabase
    .from("blog_posts")
    .insert({
      title,
      slug: slugResult.data,
      body: "Escribe aquí el contenido del artículo…",
      status: "DRAFT",
      updated_by: userId,
    })
    .select("id")
    .single();

  if (error || !data) {
    if (error?.code === "23505") {
      return actionError("Ya existe un artículo con ese slug.", {
        slug: ["Ya existe un artículo con ese slug."],
      });
    }
    return actionError(DB_ERROR_MESSAGE);
  }

  redirect(`/admin/blog/${data.id}?creado=1`);
}

export async function updatePost(
  postId: string,
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const { userId } = await requireAdmin();
  const supabase = await createSupabaseServerClient();

  const parsed = blogPostSchema.safeParse({
    title: formData.get("title"),
    slug: formData.get("slug"),
    excerpt: formData.get("excerpt"),
    body: formData.get("body"),
    status: formData.get("status"),
    seo_title: formData.get("seo_title"),
    seo_description: formData.get("seo_description"),
  });

  if (!parsed.success) {
    return zodActionError(parsed.error);
  }

  // Registrar la fecha de publicación la primera vez que pasa a PUBLISHED.
  const { data: current } = await supabase
    .from("blog_posts")
    .select("status, published_at")
    .eq("id", postId)
    .maybeSingle();

  const published_at =
    parsed.data.status === "PUBLISHED" && !current?.published_at
      ? new Date().toISOString()
      : current?.published_at ?? null;

  const { data: updated, error } = await supabase
    .from("blog_posts")
    .update({ ...parsed.data, published_at, updated_by: userId })
    .eq("id", postId)
    .select("id");

  if (error) {
    if (error.code === "23505") {
      return actionError("Ya existe un artículo con ese slug.", {
        slug: ["Ya existe un artículo con ese slug."],
      });
    }
    return actionError(DB_ERROR_MESSAGE);
  }
  if (!updated?.length) return actionError(NO_ROWS_MESSAGE);

  revalidatePublicContent(CACHE_TAGS.posts);
  revalidatePath(`/admin/blog/${postId}`);
  return actionSuccess("Artículo guardado. El sitio público se actualizó.");
}

export async function deletePost(
  postId: string,
  _prev: ActionState,
  _formData: FormData
): Promise<ActionState> {
  await requireAdmin();
  const supabase = await createSupabaseServerClient();

  const { data: post } = await supabase
    .from("blog_posts")
    .select("cover_image_id")
    .eq("id", postId)
    .maybeSingle();

  // Las imágenes del cuerpo se leen ANTES del borrado: la fila de
  // post_media cae por cascada, pero el archivo en el almacenamiento no.
  const { data: bodyImages } = await supabase
    .from("post_media")
    .select("media_asset_id")
    .eq("post_id", postId);

  const { error } = await supabase.from("blog_posts").delete().eq("id", postId);
  if (error) return actionError("No se pudo eliminar el artículo. Intenta de nuevo.");

  if (post?.cover_image_id) {
    await deleteManagedAsset(supabase, post.cover_image_id);
  }
  for (const image of bodyImages ?? []) {
    await deleteManagedAsset(supabase, image.media_asset_id);
  }

  revalidatePublicContent(CACHE_TAGS.posts);
  redirect("/admin/blog?eliminado=1");
}

export async function uploadPostCover(
  postId: string,
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const { userId } = await requireAdmin();
  const supabase = await createSupabaseServerClient();

  const file = formData.get("file");
  const result = await saveUploadedImage(
    supabase,
    file instanceof File ? file : null,
    formData.get("alt_text"),
    userId
  );
  if (result.error || !result.mediaId) {
    return actionError(result.error ?? "No se pudo subir la imagen.");
  }

  // Reemplazo: eliminar la portada anterior si era gestionada por el CMS.
  const { data: post } = await supabase
    .from("blog_posts")
    .select("cover_image_id")
    .eq("id", postId)
    .maybeSingle();

  const { data: updated, error } = await supabase
    .from("blog_posts")
    .update({ cover_image_id: result.mediaId, updated_by: userId })
    .eq("id", postId)
    .select("id");

  if (error || !updated?.length) {
    await deleteManagedAsset(supabase, result.mediaId);
    return actionError(error ? DB_ERROR_MESSAGE : NO_ROWS_MESSAGE);
  }

  if (post?.cover_image_id) {
    await deleteManagedAsset(supabase, post.cover_image_id);
  }

  revalidatePublicContent(CACHE_TAGS.posts);
  revalidatePath(`/admin/blog/${postId}`);
  return actionSuccess("Imagen de portada actualizada.");
}

/**
 * Sube una imagen para ilustrar el CUERPO del artículo y la vincula en
 * post_media. No revalida el sitio público: subirla no cambia nada hasta
 * que se inserte en el texto y se guarde el artículo.
 */
export async function uploadPostImage(
  postId: string,
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const { userId } = await requireAdmin();
  const supabase = await createSupabaseServerClient();

  const file = formData.get("file");
  const result = await saveUploadedImage(
    supabase,
    file instanceof File ? file : null,
    formData.get("alt_text"),
    userId
  );
  if (result.error || !result.mediaId) {
    return actionError(result.error ?? "No se pudo subir la imagen.");
  }

  const { error } = await supabase
    .from("post_media")
    .insert({ post_id: postId, media_asset_id: result.mediaId });

  if (error) {
    // Sin vínculo la imagen quedaría huérfana: deshacer la subida.
    await deleteManagedAsset(supabase, result.mediaId);
    return actionError(DB_ERROR_MESSAGE);
  }

  revalidatePath(`/admin/blog/${postId}`);
  return actionSuccess("Imagen subida. Pulsa «Insertar en el texto» donde quieras que aparezca.");
}

/**
 * Quita una imagen del cuerpo: desvincula y borra el archivo. Se niega
 * mientras el Markdown siga apuntando a ella — borrarla dejaría una
 * imagen rota en el artículo publicado.
 */
export async function removePostImage(
  postId: string,
  mediaId: string,
  _prev: ActionState,
  _formData: FormData
): Promise<ActionState> {
  await requireAdmin();
  const supabase = await createSupabaseServerClient();

  const [{ data: post }, { data: asset }] = await Promise.all([
    supabase.from("blog_posts").select("body").eq("id", postId).maybeSingle(),
    supabase.from("media_assets").select("*").eq("id", mediaId).maybeSingle(),
  ]);

  if (!asset) return actionError("Esa imagen ya no existe.");

  if (post?.body.includes(mediaUrl(asset))) {
    return actionError(
      "La imagen sigue insertada en el contenido. Bórrala del texto, guarda el artículo y vuelve a intentarlo."
    );
  }

  const { error } = await supabase
    .from("post_media")
    .delete()
    .eq("post_id", postId)
    .eq("media_asset_id", mediaId);
  if (error) return actionError("No se pudo quitar la imagen del artículo.");

  const removal = await deleteManagedAsset(supabase, mediaId);
  if (removal.error) return actionError(removal.error);

  revalidatePath(`/admin/blog/${postId}`);
  return actionSuccess("Imagen eliminada.");
}

export async function removePostCover(
  postId: string,
  _prev: ActionState,
  _formData: FormData
): Promise<ActionState> {
  const { userId } = await requireAdmin();
  const supabase = await createSupabaseServerClient();

  const { data: post } = await supabase
    .from("blog_posts")
    .select("cover_image_id")
    .eq("id", postId)
    .maybeSingle();
  if (!post?.cover_image_id) return actionSuccess(null);

  const { data: updated, error } = await supabase
    .from("blog_posts")
    .update({ cover_image_id: null, updated_by: userId })
    .eq("id", postId)
    .select("id");
  if (error) return actionError("No se pudo quitar la portada.");
  if (!updated?.length) return actionError(NO_ROWS_MESSAGE);

  await deleteManagedAsset(supabase, post.cover_image_id);

  revalidatePublicContent(CACHE_TAGS.posts);
  revalidatePath(`/admin/blog/${postId}`);
  return actionSuccess("Imagen de portada eliminada.");
}
