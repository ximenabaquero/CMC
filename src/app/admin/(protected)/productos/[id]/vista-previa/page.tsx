import Link from "next/link";
import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ProductDetail } from "@/components/public/ProductDetail";
import type { MediaAsset } from "@/lib/supabase/types";

export const metadata = { title: "Vista previa del producto" };

/**
 * Vista previa para el administrador: muestra el producto tal como se
 * verá publicado, aunque esté en borrador (la sesión admin puede leer
 * borradores gracias a las políticas RLS).
 */
export default async function ProductPreviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();

  const { data: product, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error("No se pudo cargar la vista previa.");
  if (!product) notFound();

  const [{ data: gallery }, { data: category }] = await Promise.all([
    supabase
      .from("product_media")
      .select("media_asset_id, sort_order")
      .eq("product_id", id)
      .order("sort_order"),
    product.category_id
      ? supabase.from("product_categories").select("*").eq("id", product.category_id).maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  const assetIds = (gallery ?? []).map((g) => g.media_asset_id);
  if (product.technical_sheet_media_id) assetIds.push(product.technical_sheet_media_id);
  const { data: assets } = assetIds.length
    ? await supabase.from("media_assets").select("*").in("id", assetIds)
    : { data: [] as MediaAsset[] };
  const assetById = new Map((assets ?? []).map((a) => [a.id, a]));

  return (
    <div className="-m-4 sm:-m-6 lg:-m-8">
      <div className="flex items-center justify-between gap-3 border-b border-secondary/40 bg-secondary/10 px-4 py-2 text-sm">
        <p>
          <strong>Vista previa</strong> — así se verá el producto
          {product.status === "DRAFT" ? " cuando lo publiques" : ""}.
        </p>
        <Link
          href={`/admin/productos/${product.id}`}
          className="rounded-md border border-border bg-surface px-3 py-1 font-medium hover:bg-surface-muted"
        >
          Volver a editar
        </Link>
      </div>
      <div className="bg-background">
        <ProductDetail
          product={{
            ...product,
            image: product.main_image_id ? (assetById.get(product.main_image_id) ?? null) : null,
            category: category ?? null,
            gallery: (gallery ?? [])
              .map((g) => assetById.get(g.media_asset_id))
              .filter((a): a is MediaAsset => Boolean(a)),
            technicalSheet: product.technical_sheet_media_id
              ? (assetById.get(product.technical_sheet_media_id) ?? null)
              : null,
          }}
        />
      </div>
    </div>
  );
}
