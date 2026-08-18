import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { mediaUrl } from "@/lib/media";
import {
  deleteProduct,
  moveProductImage,
  removeProductImage,
  removeTechnicalSheet,
  setProductMainImage,
  updateMediaAltText,
  uploadProductImage,
  uploadTechnicalSheet,
} from "@/actions/products";
import { ProductForm } from "./ProductForm";
import { UploadImageForm } from "@/components/admin/UploadImageForm";
import { UploadDocumentForm } from "@/components/admin/UploadDocumentForm";
import { AltTextForm } from "@/components/admin/AltTextForm";
import { ConfirmSubmitButton, GhostSubmitButton } from "@/components/admin/buttons";
import { ActionForm } from "@/components/admin/ActionForm";
import { FlashToast } from "@/components/admin/FlashToast";
import { PageHeader } from "@/components/admin/PageHeader";

export const metadata = { title: "Editar producto" };

export default async function EditProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ creado?: string }>;
}) {
  const [{ id }, { creado }] = await Promise.all([params, searchParams]);
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

  const { data: technicalSheet } = product.technical_sheet_media_id
    ? await supabase
        .from("media_assets")
        .select("*")
        .eq("id", product.technical_sheet_media_id)
        .maybeSingle()
    : { data: null };

  const maxUploadMb = Number(process.env.MAX_UPLOAD_MB ?? "5");
  const maxDocumentMb = Number(process.env.MAX_DOCUMENT_UPLOAD_MB ?? "10");

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <FlashToast
        message={
          creado
            ? "Producto creado. Completa la información y publícalo cuando esté listo."
            : null
        }
      />
      <PageHeader
        title={product.name}
        backHref="/admin/productos"
        backLabel="Productos"
        actions={
          <Link
            href={`/admin/productos/${product.id}/vista-previa`}
            className="inline-flex min-h-10 items-center rounded-md border border-border px-3 py-1.5 text-sm font-medium hover:bg-surface-muted"
          >
            Vista previa
          </Link>
        }
      />

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
            {orderedAssets.map((asset, index) => {
              const isMain = product.main_image_id === asset.id;
              const isFirstSecondary = index === 1;
              const isLast = index === orderedAssets.length - 1;
              return (
                <li key={asset.id} className="rounded-md border border-border p-2">
                  {/* Igual que en el sitio público: lienzo blanco sin recortes. */}
                  <div className="mb-2 aspect-square w-full rounded bg-white p-2">
                    <Image
                      src={mediaUrl(asset)}
                      alt={asset.alt_text}
                      width={240}
                      height={240}
                      className="h-full w-full object-contain object-center"
                    />
                  </div>
                  <p className="mb-1 text-xs text-muted-foreground">Posición {index + 1}</p>
                  <div className="mb-2">
                    <AltTextForm
                      action={updateMediaAltText.bind(null, asset.id, product.id)}
                      currentAlt={asset.alt_text}
                    />
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {isMain ? (
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                        Principal
                      </span>
                    ) : (
                      <ActionForm action={setProductMainImage.bind(null, product.id, asset.id)}>
                        <GhostSubmitButton>Usar como principal</GhostSubmitButton>
                      </ActionForm>
                    )}
                    {!isMain && !isFirstSecondary ? (
                      <ActionForm action={moveProductImage.bind(null, product.id, asset.id, "up")}>
                        <GhostSubmitButton aria-label="Subir imagen en la galería">
                          ↑ Subir
                        </GhostSubmitButton>
                      </ActionForm>
                    ) : null}
                    {!isMain && !isLast ? (
                      <ActionForm action={moveProductImage.bind(null, product.id, asset.id, "down")}>
                        <GhostSubmitButton aria-label="Bajar imagen en la galería">
                          ↓ Bajar
                        </GhostSubmitButton>
                      </ActionForm>
                    ) : null}
                    <ActionForm action={removeProductImage.bind(null, product.id, asset.id)}>
                      <ConfirmSubmitButton
                        pendingLabel="Quitando…"
                        confirmMessage="¿Quitar esta imagen del producto? Si fue subida desde el panel y no se usa en otro lugar, también se eliminará del almacenamiento."
                      >
                        Quitar
                      </ConfirmSubmitButton>
                    </ActionForm>
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

      <section aria-labelledby="ficha-tecnica" className="rounded-lg border border-border bg-surface p-5">
        <h2 id="ficha-tecnica" className="mb-2 text-lg font-semibold">
          Ficha técnica (PDF)
        </h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Si el producto tiene ficha técnica, el sitio público muestra el botón
          «Descargar ficha técnica» en la página del producto.
        </p>

        {technicalSheet ? (
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-md border border-border bg-surface-muted p-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium" title={technicalSheet.file_name}>
                {technicalSheet.file_name}
              </p>
              <p className="text-xs text-muted-foreground">
                {(technicalSheet.size_bytes / 1024 / 1024).toFixed(1)} MB · Actualizada el{" "}
                {new Date(technicalSheet.updated_at).toLocaleDateString("es-CO", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <a
                href={mediaUrl(technicalSheet)}
                download={technicalSheet.file_name}
                className="rounded-md border border-border px-3 py-1.5 text-sm font-medium hover:bg-surface-muted"
              >
                Descargar
              </a>
              <ActionForm action={removeTechnicalSheet.bind(null, product.id)}>
                <ConfirmSubmitButton confirmMessage="¿Quitar la ficha técnica de este producto? Si fue subida desde el panel y no se usa en otro lugar, también se eliminará del almacenamiento.">
                  Eliminar
                </ConfirmSubmitButton>
              </ActionForm>
            </div>
          </div>
        ) : (
          <p className="mb-5 text-sm text-muted-foreground">
            Este producto aún no tiene ficha técnica.
          </p>
        )}

        <h3 className="mb-2 text-sm font-semibold">
          {technicalSheet ? "Reemplazar ficha técnica" : "Cargar ficha técnica"}
        </h3>
        <UploadDocumentForm
          action={uploadTechnicalSheet.bind(null, product.id)}
          buttonLabel={technicalSheet ? "Reemplazar ficha" : "Subir ficha técnica"}
          maxUploadMb={maxDocumentMb}
          defaultDisplayName={`Ficha técnica de ${product.name}`}
        />
      </section>

      <section className="rounded-lg border border-accent/30 bg-surface p-5">
        <h2 className="mb-2 text-lg font-semibold">Eliminar producto</h2>
        <p className="mb-3 text-sm text-muted-foreground">
          Esta acción no se puede deshacer. El producto desaparecerá del catálogo.
        </p>
        <ActionForm action={deleteProduct.bind(null, product.id)}>
          <ConfirmSubmitButton confirmMessage={`¿Eliminar definitivamente "${product.name}"? Esta acción no se puede deshacer.`}>
            Eliminar producto
          </ConfirmSubmitButton>
        </ActionForm>
      </section>
    </div>
  );
}
