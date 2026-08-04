import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { mediaUrl } from "@/lib/media";
import {
  deleteProduct,
  removeProductImage,
  setProductMainImage,
  uploadProductImage,
} from "@/actions/products";
import { ProductForm } from "./ProductForm";
import { UploadImageForm } from "@/components/admin/UploadImageForm";
import { ConfirmSubmitButton } from "@/components/admin/buttons";

export const metadata = { title: "Editar producto" };

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();

  const [{ data: product, error }, { data: categories }] = await Promise.all([
    supabase.from("products").select("*").eq("id", id).maybeSingle(),
    supabase.from("product_categories").select("id, name").order("sort_order"),
  ]);

  if (error) throw new Error("No se pudo cargar el producto.");
  if (!product) notFound();

  const { data: gallery } = await supabase
    .from("product_media")
    .select("media_asset_id, sort_order")
    .eq("product_id", id)
    .order("sort_order");

  const galleryIds = (gallery ?? []).map((g) => g.media_asset_id);
  const { data: assets } = galleryIds.length
    ? await supabase.from("media_assets").select("*").in("id", galleryIds)
    : { data: [] };
  const assetById = new Map((assets ?? []).map((a) => [a.id, a]));
  const orderedAssets = (gallery ?? [])
    .map((g) => assetById.get(g.media_asset_id))
    .filter((a): a is NonNullable<typeof a> => Boolean(a));

  const maxUploadMb = Number(process.env.MAX_UPLOAD_MB ?? "5");

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs text-muted-foreground">
            <Link href="/admin/productos" className="underline-offset-2 hover:underline">
              Productos
            </Link>{" "}
            / {product.name}
          </p>
          <h1 className="text-2xl font-semibold">{product.name}</h1>
        </div>
        <Link
          href={`/admin/productos/${product.id}/vista-previa`}
          className="rounded-md border border-border px-3 py-1.5 text-sm font-medium hover:bg-surface-muted"
        >
          Vista previa
        </Link>
      </div>

      {product.internal_note ? (
        <p className="rounded-md border border-secondary/40 bg-secondary/10 p-3 text-sm">
          <strong>Nota interna:</strong> {product.internal_note}
        </p>
      ) : null}

      <ProductForm product={product} categories={categories ?? []} />

      <section aria-labelledby="galeria" className="rounded-lg border border-border bg-surface p-5">
        <h2 id="galeria" className="mb-4 text-lg font-semibold">
          Imágenes
        </h2>

        {orderedAssets.length === 0 ? (
          <p className="mb-4 text-sm text-muted-foreground">
            Este producto aún no tiene imágenes.
          </p>
        ) : (
          <ul className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
            {orderedAssets.map((asset) => {
              const isMain = product.main_image_id === asset.id;
              return (
                <li key={asset.id} className="rounded-md border border-border p-2">
                  <Image
                    src={mediaUrl(asset)}
                    alt={asset.alt_text}
                    width={240}
                    height={240}
                    className="mb-2 aspect-square w-full rounded object-cover"
                  />
                  <p className="mb-2 truncate text-xs text-muted-foreground" title={asset.alt_text}>
                    {asset.alt_text}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {isMain ? (
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                        Principal
                      </span>
                    ) : (
                      <form action={setProductMainImage.bind(null, product.id, asset.id)}>
                        <button
                          type="submit"
                          className="rounded-md border border-border px-2 py-0.5 text-xs hover:bg-surface-muted"
                        >
                          Usar como principal
                        </button>
                      </form>
                    )}
                    <form action={removeProductImage.bind(null, product.id, asset.id)}>
                      <ConfirmSubmitButton confirmMessage="¿Quitar esta imagen del producto? Si fue subida desde el panel y no se usa en otro lugar, también se eliminará del almacenamiento.">
                        Quitar
                      </ConfirmSubmitButton>
                    </form>
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        <h3 className="mb-2 text-sm font-semibold">Agregar imagen</h3>
        <UploadImageForm
          action={uploadProductImage.bind(null, product.id)}
          maxUploadMb={maxUploadMb}
        />
      </section>

      <section className="rounded-lg border border-accent/30 bg-surface p-5">
        <h2 className="mb-2 text-lg font-semibold">Eliminar producto</h2>
        <p className="mb-3 text-sm text-muted-foreground">
          Esta acción no se puede deshacer. El producto desaparecerá del catálogo.
        </p>
        <form action={deleteProduct.bind(null, product.id)}>
          <ConfirmSubmitButton confirmMessage={`¿Eliminar definitivamente "${product.name}"? Esta acción no se puede deshacer.`}>
            Eliminar producto
          </ConfirmSubmitButton>
        </form>
      </section>
    </div>
  );
}
