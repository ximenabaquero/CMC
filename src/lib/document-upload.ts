import "server-only";
import { ALLOWED_DOCUMENT_MIME_TYPES, maxDocumentUploadBytes } from "@/lib/storage/adapter";
import { getStorageAdapter } from "@/lib/storage";
import { documentNameSchema } from "@/lib/validation";
import type { UploadResult } from "@/lib/media-upload";
import type { createSupabaseServerClient } from "@/lib/supabase/server";

type SupabaseServer = Awaited<ReturnType<typeof createSupabaseServerClient>>;

const PDF_SIGNATURE = "%PDF-";

/**
 * Valida y guarda un documento PDF subido desde el CMS (fichas técnicas).
 * Clase de medio separada de las imágenes (saveUploadedImage): aquí se
 * exige MIME application/pdf, extensión .pdf y firma %PDF- real, con un
 * límite propio (MAX_DOCUMENT_UPLOAD_MB, por defecto 10 MB). La clave
 * interna es un UUID; el nombre visible se guarda en file_name.
 */
export async function saveUploadedDocument(
  supabase: SupabaseServer,
  file: File | null,
  displayNameRaw: unknown,
  userId: string
): Promise<UploadResult> {
  if (!file || file.size === 0) {
    return { error: "Selecciona un archivo PDF." };
  }

  const name = documentNameSchema.safeParse(displayNameRaw);
  if (!name.success) {
    return { error: name.error.issues[0]?.message ?? "Nombre de documento inválido." };
  }

  const extension = ALLOWED_DOCUMENT_MIME_TYPES[file.type];
  if (!extension) {
    return { error: "Formato no permitido. La ficha técnica debe ser un PDF." };
  }
  if (!file.name.toLowerCase().endsWith(".pdf")) {
    return { error: "El archivo debe tener extensión .pdf." };
  }

  const limit = maxDocumentUploadBytes();
  if (file.size > limit) {
    return {
      error: `El archivo pesa ${(file.size / 1024 / 1024).toFixed(1)} MB y el máximo es ${Math.round(limit / 1024 / 1024)} MB. Reduce el PDF e inténtalo de nuevo.`,
    };
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  const signature = new TextDecoder("ascii").decode(bytes.slice(0, PDF_SIGNATURE.length));
  if (signature !== PDF_SIGNATURE) {
    return { error: "El archivo no es un PDF válido." };
  }

  // Nombre visible saneado, siempre terminado en .pdf.
  const displayName = name.data.replace(/[\r\n"\\]/g, " ").trim();
  const fileName = displayName.toLowerCase().endsWith(".pdf") ? displayName : `${displayName}.pdf`;

  const key = `${crypto.randomUUID()}.${extension}`;
  const adapter = await getStorageAdapter();

  try {
    await adapter.put(key, bytes, file.type);
  } catch {
    return { error: "No se pudo guardar el archivo en el almacenamiento. Inténtalo de nuevo." };
  }

  const { data, error } = await supabase
    .from("media_assets")
    .insert({
      storage_provider: "R2",
      storage_path: key,
      public_url: adapter.publicUrl(key),
      file_name: fileName,
      mime_type: file.type,
      size_bytes: file.size,
      alt_text: displayName,
      updated_by: userId,
    })
    .select("id")
    .single();

  if (error || !data) {
    // Evitar archivos huérfanos si falla el registro en la base.
    await adapter.delete(key).catch(() => undefined);
    return { error: "El archivo se subió pero no se pudo registrar. Inténtalo de nuevo." };
  }

  return { mediaId: data.id };
}
