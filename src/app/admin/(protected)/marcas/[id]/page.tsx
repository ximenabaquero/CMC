import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { mediaUrl } from "@/lib/media";
import { deleteBrand, removeBrandLogo, uploadBrandLogo } from "@/actions/brands";
import { BrandForm } from "./BrandForm";
import { UploadImageForm } from "@/components/admin/UploadImageForm";
import { ConfirmSubmitButton } from "@/components/admin/buttons";

export const metadata = { title: "Editar marca" };

export default async function EditBrandPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();

  const { data: brand, error } = await supabase.from("brands").select("*").eq("id", id).maybeSingle();
  if (error) throw new Error("No se pudo cargar la marca.");
  if (!brand) notFound();

  const { data: logo } = brand.logo_media_id
    ? await supabase.from("media_assets").select("*").eq("id", brand.logo_media_id).maybeSingle()
    : { data: null };

  const maxUploadMb = Number(process.env.MAX_UPLOAD_MB ?? "5");

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <p className="text-xs text-muted-foreground">
          <Link href="/admin/marcas" className="underline-offset-2 hover:underline">
            Marcas
          </Link>{" "}
          / {brand.name}
        </p>
        <h1 className="text-2xl font-semibold">{brand.name}</h1>
      </div>

      {brand.internal_note ? (
        <p className="rounded-md border border-secondary/40 bg-secondary/10 p-3 text-sm">
          <strong>Nota interna:</strong> {brand.internal_note}
        </p>
      ) : null}

      <BrandForm brand={brand} />

      <section aria-labelledby="logo-marca" className="rounded-lg border border-border bg-surface p-5">
        <h2 id="logo-marca" className="mb-4 text-lg font-semibold">
          Logo
        </h2>

        {logo ? (
          <div className="mb-6 flex items-start gap-4">
            <Image
              src={mediaUrl(logo)}
              alt={logo.alt_text}
              width={logo.width ?? 160}
              height={logo.height ?? 64}
              className="h-20 w-auto max-w-60 rounded-md border border-border bg-white object-contain p-2"
            />
            <div>
              <p className="mb-2 text-xs text-muted-foreground" title={logo.alt_text}>
                {logo.alt_text}
              </p>
              <form action={removeBrandLogo.bind(null, brand.id)}>
                <ConfirmSubmitButton confirmMessage="¿Quitar el logo? Si la marca estaba publicada volverá a borrador, y el archivo se eliminará del almacenamiento si no se usa en otro lugar.">
                  Quitar logo
                </ConfirmSubmitButton>
              </form>
            </div>
          </div>
        ) : (
          <p className="mb-4 rounded-md border border-secondary/40 bg-secondary/10 p-3 text-sm">
            Esta marca aún no tiene logo. Es obligatorio para poder publicarla.
          </p>
        )}

        <h3 className="mb-2 text-sm font-semibold">{logo ? "Reemplazar logo" : "Subir logo"}</h3>
        <UploadImageForm action={uploadBrandLogo.bind(null, brand.id)} maxUploadMb={maxUploadMb} />
      </section>

      <section className="rounded-lg border border-accent/30 bg-surface p-5">
        <h2 className="mb-2 text-lg font-semibold">Eliminar marca</h2>
        <p className="mb-3 text-sm text-muted-foreground">
          Esta acción no se puede deshacer. La marca desaparecerá del carrusel de la página de
          inicio.
        </p>
        <form action={deleteBrand.bind(null, brand.id)}>
          <ConfirmSubmitButton confirmMessage={`¿Eliminar definitivamente "${brand.name}"? Esta acción no se puede deshacer.`}>
            Eliminar marca
          </ConfirmSubmitButton>
        </form>
      </section>
    </div>
  );
}
