import Link from "next/link";
import Image from "next/image";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { mediaUrl } from "@/lib/media";

export const metadata = { title: "Productos" };

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ eliminado?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createSupabaseServerClient();

  const { data: products, error } = await supabase
    .from("products")
    .select("id, name, slug, status, sort_order, internal_note, main_image_id")
    .order("sort_order");

  if (error) throw new Error("No se pudieron cargar los productos.");

  const imageIds = products.map((p) => p.main_image_id).filter((id): id is string => Boolean(id));
  const { data: images } = imageIds.length
    ? await supabase
        .from("media_assets")
        .select("id, storage_provider, storage_path, public_url, alt_text")
        .in("id", imageIds)
    : { data: [] };
  const imageById = new Map((images ?? []).map((img) => [img.id, img]));

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Productos</h1>
          <p className="text-sm text-muted-foreground">
            El catálogo público solo muestra los productos publicados.
          </p>
        </div>
        <Link
          href="/admin/productos/nuevo"
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary-hover"
        >
          + Nuevo producto
        </Link>
      </div>

      {params.eliminado ? (
        <p role="status" className="mb-4 rounded-md border border-primary/40 bg-primary/10 p-3 text-sm text-primary">
          Producto eliminado.
        </p>
      ) : null}

      <ul className="space-y-2">
        {products.map((product) => {
          const image = product.main_image_id ? imageById.get(product.main_image_id) : undefined;
          return (
            <li key={product.id}>
              <Link
                href={`/admin/productos/${product.id}`}
                className="flex items-center gap-4 rounded-lg border border-border bg-surface p-3 transition hover:border-primary"
              >
                {image ? (
                  <Image
                    src={mediaUrl(image)}
                    alt=""
                    width={56}
                    height={56}
                    className="h-14 w-14 rounded-md border border-border object-cover"
                  />
                ) : (
                  <span
                    aria-hidden="true"
                    className="flex h-14 w-14 items-center justify-center rounded-md border border-dashed border-border text-xs text-muted-foreground"
                  >
                    Sin foto
                  </span>
                )}
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">{product.name}</span>
                  <span className="block truncate text-xs text-muted-foreground">/{product.slug}</span>
                </span>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    product.status === "PUBLISHED"
                      ? "bg-primary/10 text-primary"
                      : "bg-surface-muted text-muted-foreground"
                  }`}
                >
                  {product.status === "PUBLISHED" ? "Publicado" : "Borrador"}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
