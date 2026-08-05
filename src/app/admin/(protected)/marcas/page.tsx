import Link from "next/link";
import Image from "next/image";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { mediaUrl } from "@/lib/media";
import { BrandsMarquee } from "@/components/public/BrandsMarquee";
import type { BrandWithLogo } from "@/lib/content";

export const metadata = { title: "Marcas" };

export default async function AdminBrandsPage({
  searchParams,
}: {
  searchParams: Promise<{ eliminado?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createSupabaseServerClient();

  const { data: brands, error } = await supabase.from("brands").select("*").order("sort_order");
  if (error) throw new Error("No se pudieron cargar las marcas.");

  const logoIds = (brands ?? [])
    .map((b) => b.logo_media_id)
    .filter((id): id is string => Boolean(id));
  const { data: logos } = logoIds.length
    ? await supabase.from("media_assets").select("*").in("id", logoIds)
    : { data: [] };
  const logoById = new Map((logos ?? []).map((l) => [l.id, l]));

  // Vista previa con todas las marcas que tienen logo (incluye borradores).
  const previewBrands: BrandWithLogo[] = (brands ?? []).flatMap((brand) => {
    const logo = brand.logo_media_id ? logoById.get(brand.logo_media_id) : undefined;
    return logo ? [{ ...brand, logo }] : [];
  });

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Marcas</h1>
          <p className="text-sm text-muted-foreground">
            Logos del carrusel de la página de inicio. Solo se muestran las marcas publicadas; si
            no hay ninguna, la sección no aparece en el sitio.
          </p>
        </div>
        <Link
          href="/admin/marcas/nueva"
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary-hover"
        >
          + Nueva marca
        </Link>
      </div>

      {params.eliminado ? (
        <p role="status" className="mb-4 rounded-md border border-primary/40 bg-primary/10 p-3 text-sm text-primary">
          Marca eliminada.
        </p>
      ) : null}

      {previewBrands.length > 0 ? (
        <section aria-labelledby="vista-previa-marcas" className="mb-6 rounded-lg border border-border bg-surface p-4">
          <h2 id="vista-previa-marcas" className="mb-1 text-sm font-semibold">
            Vista previa del carrusel
          </h2>
          <p className="mb-3 text-xs text-muted-foreground">
            Así se verá en la página de inicio. Incluye borradores; el público solo ve las marcas
            publicadas.
          </p>
          <BrandsMarquee brands={previewBrands} />
        </section>
      ) : null}

      {(brands ?? []).length === 0 ? (
        <p className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          Aún no hay marcas. Crea la primera con «Nueva marca»; podrás subir su logo y publicarla
          cuando tengas la autorización de uso.
        </p>
      ) : (
        <ul className="space-y-2">
          {(brands ?? []).map((brand) => {
            const logo = brand.logo_media_id ? logoById.get(brand.logo_media_id) : undefined;
            return (
              <li key={brand.id}>
                <Link
                  href={`/admin/marcas/${brand.id}`}
                  className="flex items-center gap-4 rounded-lg border border-border bg-surface p-3 transition hover:border-primary"
                >
                  {logo ? (
                    <Image
                      src={mediaUrl(logo)}
                      alt=""
                      width={56}
                      height={56}
                      className="h-14 w-14 rounded-md border border-border object-contain p-1"
                    />
                  ) : (
                    <span
                      aria-hidden="true"
                      className="flex h-14 w-14 items-center justify-center rounded-md border border-dashed border-border text-center text-xs text-muted-foreground"
                    >
                      Sin logo
                    </span>
                  )}
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">{brand.name}</span>
                    <span className="block truncate text-xs text-muted-foreground">
                      Orden: {brand.sort_order}
                      {logo ? "" : " — falta el logo para poder publicarla"}
                    </span>
                  </span>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      brand.status === "PUBLISHED"
                        ? "bg-primary/10 text-primary"
                        : "bg-surface-muted text-muted-foreground"
                    }`}
                  >
                    {brand.status === "PUBLISHED" ? "Publicada" : "Borrador"}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
