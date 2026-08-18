import { NextResponse, type NextRequest } from "next/server";
import { getStorageAdapter } from "@/lib/storage";
import { createSupabasePublicClient } from "@/lib/supabase/server";

/**
 * Sirve los archivos cargados desde el CMS (adaptador local o R2):
 * imágenes inline y documentos PDF como descarga (attachment) con el
 * nombre visible registrado en media_assets. Los activos STATIC del
 * proyecto se sirven directamente desde /public y no pasan por aquí.
 */

/** Content-Disposition seguro (RFC 6266): ASCII de respaldo + UTF-8. */
function attachmentDisposition(fileName: string): string {
  const clean = fileName.replace(/[\r\n"\\]/g, " ").trim() || "documento.pdf";
  const ascii = clean.replace(/[^\x20-\x7e]/g, "_");
  return `attachment; filename="${ascii}"; filename*=UTF-8''${encodeURIComponent(clean)}`;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ key: string[] }> }
) {
  const { key } = await params;
  const objectKey = key.join("/");

  // Claves generadas por el CMS: uuid.extensión (sin rutas relativas).
  if (!/^[a-zA-Z0-9._-]+$/.test(objectKey)) {
    return new NextResponse("Solicitud inválida", { status: 400 });
  }

  const adapter = await getStorageAdapter();
  const object = await adapter.get(objectKey);
  if (!object) {
    return new NextResponse("No encontrado", { status: 404 });
  }

  const headers: Record<string, string> = {
    "Content-Type": object.contentType,
    "Cache-Control": "public, max-age=31536000, immutable",
    "X-Content-Type-Options": "nosniff",
  };

  if (object.contentType === "application/pdf") {
    // Descarga con nombre comprensible (file_name registrado en la base).
    let fileName = "documento.pdf";
    try {
      const supabase = createSupabasePublicClient();
      const { data } = await supabase
        .from("media_assets")
        .select("file_name")
        .eq("storage_path", objectKey)
        .maybeSingle();
      if (data?.file_name) fileName = data.file_name;
    } catch {
      // Sin base disponible se descarga con el nombre genérico.
    }
    headers["Content-Disposition"] = attachmentDisposition(fileName);
  }

  return new NextResponse(object.body as BodyInit, { headers });
}
