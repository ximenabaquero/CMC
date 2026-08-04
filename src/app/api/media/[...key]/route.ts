import { NextResponse, type NextRequest } from "next/server";
import { getStorageAdapter } from "@/lib/storage";

/**
 * Sirve las imágenes cargadas desde el CMS (adaptador local o R2).
 * Los activos STATIC del proyecto se sirven directamente desde /public
 * y no pasan por aquí.
 */
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

  return new NextResponse(object.body as BodyInit, {
    headers: {
      "Content-Type": object.contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
