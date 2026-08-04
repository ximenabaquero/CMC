"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { blogPostSchema, slugSchema } from "@/lib/validation";
import { DB_ERROR_MESSAGE, type ActionState } from "@/lib/action-state";
import { saveUploadedImage, deleteManagedAsset } from "@/lib/media-upload";
import { CACHE_TAGS, revalidatePublicContent } from "@/lib/revalidate";

export async function createPost(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { userId } = await requireAdmin();
  const supabase = await createSupabaseServerClient();

  const title = String(formData.get("title") ?? "").trim();
  const slugResult = slugSchema.safeParse(formData.get("slug"));
  if (!title) return { success: null, error: "El título es obligatorio." };
  if (!slugResult.success) {
    return { success: null, error: slugResult.error.issues[0]?.message ?? "Slug inválido." };
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
      return { success: null, error: "Ya existe un artículo con ese slug." };
    }
    return { success: null, error: DB_ERROR_MESSAGE };
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
    return { success: null, error: parsed.error.issues[0]?.message ?? "Revisa los campos del formulario." };
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

  const { error } = await supabase
    .from("blog_posts")
    .update({ ...parsed.data, published_at, updated_by: userId })
    .eq("id", postId);

  if (error) {
    if (error.code === "23505") {
      return { success: null, error: "Ya existe un artículo con ese slug." };
    }
    return { success: null, error: DB_ERROR_MESSAGE };
  }

  revalidatePublicContent(CACHE_TAGS.posts);
  revalidatePath(`/admin/blog/${postId}`);
  return { success: "Artículo guardado. El sitio público se actualizó.", error: null };
}

export async function deletePost(postId: string): Promise<void> {
  await requireAdmin();
  const supabase = await createSupabaseServerClient();

  const { data: post } = await supabase
    .from("blog_posts")
    .select("cover_image_id")
    .eq("id", postId)
    .maybeSingle();

  const { error } = await supabase.from("blog_posts").delete().eq("id", postId);
  if (error) throw new Error("No se pudo eliminar el artículo.");

  if (post?.cover_image_id) {
    await deleteManagedAsset(supabase, post.cover_image_id);
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
    return { success: null, error: result.error ?? "No se pudo subir la imagen." };
  }

  // Reemplazo: eliminar la portada anterior si era gestionada por el CMS.
  const { data: post } = await supabase
    .from("blog_posts")
    .select("cover_image_id")
    .eq("id", postId)
    .maybeSingle();

  const { error } = await supabase
    .from("blog_posts")
    .update({ cover_image_id: result.mediaId, updated_by: userId })
    .eq("id", postId);

  if (error) {
    await deleteManagedAsset(supabase, result.mediaId);
    return { success: null, error: DB_ERROR_MESSAGE };
  }

  if (post?.cover_image_id) {
    await deleteManagedAsset(supabase, post.cover_image_id);
  }

  revalidatePublicContent(CACHE_TAGS.posts);
  revalidatePath(`/admin/blog/${postId}`);
  return { success: "Imagen de portada actualizada.", error: null };
}

export async function removePostCover(postId: string): Promise<void> {
  const { userId } = await requireAdmin();
  const supabase = await createSupabaseServerClient();

  const { data: post } = await supabase
    .from("blog_posts")
    .select("cover_image_id")
    .eq("id", postId)
    .maybeSingle();
  if (!post?.cover_image_id) return;

  const { error } = await supabase
    .from("blog_posts")
    .update({ cover_image_id: null, updated_by: userId })
    .eq("id", postId);
  if (error) throw new Error("No se pudo quitar la portada.");

  await deleteManagedAsset(supabase, post.cover_image_id);

  revalidatePublicContent(CACHE_TAGS.posts);
  revalidatePath(`/admin/blog/${postId}`);
}
