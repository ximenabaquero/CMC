import Link from "next/link";
import Image from "next/image";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { mediaUrl } from "@/lib/media";
import { FlashToast } from "@/components/admin/FlashToast";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { EmptyState } from "@/components/admin/EmptyState";
import { ListToolbar } from "@/components/admin/ListToolbar";
import { matchesQuery, matchesStatus } from "@/lib/search";

export const metadata = { title: "Productos" };

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ eliminado?: string; q?: string; estado?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createSupabaseServerClient();

  const { data: allProducts, error } = await supabase
    .from("products")
    .select("id, name, slug, status, sort_order, internal_note, main_image_id")
    .order("sort_order");

  if (error) throw new Error("No se pudieron cargar los productos.");

  // Filtro en memoria: ver el porqué en src/lib/search.ts.
  const products = allProducts.filter(
    (product) =>
      matchesStatus(params.estado, product.status) &&
      matchesQuery(params.q, product.name, product.slug, product.internal_note)
  );

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
      <FlashToast message={params.eliminado ? "Producto eliminado." : null} />
      <PageHeader
        title="Productos"
        description="El catálogo público solo muestra los productos publicados."
        actions={
          <Link
            href="/admin/productos/nuevo"
            className="inline-flex min-h-11 items-center rounded-md bg-primary px-4 py-2 text-base font-medium text-primary-foreground hover:bg-primary-hover"
          >
            + Nuevo producto
          </Link>
        }
      />

      {allProducts.length > 0 ? (
        <ListToolbar
          basePath="/admin/productos"
          q={params.q}
          status={params.estado}
          searchLabel="Buscar productos"
          searchPlaceholder="Buscar por nombre o dirección web…"
          total={allProducts.length}
          shown={products.length}
          itemsLabel="productos"
        />
      ) : null}

      {allProducts.length === 0 ? (
        <EmptyState
          title="Aún no hay productos"
          description="Crea el primer producto del catálogo; quedará en borrador hasta que lo publiques."
          cta={{ href: "/admin/productos/nuevo", label: "Crear primer producto" }}
        />
      ) : products.length === 0 ? (
        <EmptyState
          title="Ningún producto coincide con la búsqueda"
          description="Prueba con otro término o quita el filtro de estado."
        />
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
                    className="h-14 w-14 rounded-md border border-border bg-white object-contain p-0.5"
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
                  <span className="block truncate text-base font-medium">{product.name}</span>
                  <span className="block truncate text-sm text-muted-foreground">/{product.slug}</span>
                </span>
                <StatusBadge status={product.status} />
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
