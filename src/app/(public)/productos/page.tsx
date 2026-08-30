import type { Metadata } from "next";
import { getPublishedProducts } from "@/lib/content";
import {
  CatalogInPreparation,
  DataUnavailable,
  ProductCard,
} from "@/components/public/shared";
import { ClimateVariants } from "@/components/public/ClimateVariants";

export const metadata: Metadata = {
  title: "Productos",
  description:
    "Catálogo de margarinas, mantequillas y aceites de Compañía Mundial de Comercio S.A.S. para panadería, repostería e industria.",
};

type ProductList = Awaited<ReturnType<typeof getPublishedProducts>>;

/**
 * Agrupa el catálogo por categoría preservando el orden de publicación.
 * Los productos sin categoría quedan al final bajo un grupo genérico, de
 * modo que el comprador escanea por tipo (margarinas, preparados, aceites)
 * en lugar de recorrer un grid plano.
 */
function groupByCategory(products: ProductList) {
  const groups = new Map<string, { title: string; items: ProductList }>();
  for (const product of products) {
    const key = product.category?.id ?? "__sin_categoria__";
    const group = groups.get(key) ?? {
      title: product.category?.name ?? "Otros productos",
      items: [],
    };
    group.items.push(product);
    groups.set(key, group);
  }
  return [...groups.values()];
}

export default async function ProductsPage() {
  let products: ProductList | null = null;
  try {
    products = await getPublishedProducts();
  } catch {
    products = null;
  }

  const groups = products ? groupByCategory(products) : [];

  return (
    <>
      <div className="mx-auto max-w-6xl px-4 py-14">
        <header className="mb-10 max-w-2xl">
          <p className="mb-1 text-sm font-semibold uppercase tracking-wide text-orange">Catálogo</p>
          <h1 className="text-3xl font-semibold text-petrol sm:text-4xl">Nuestros productos</h1>
          <p className="mt-3 text-muted-foreground">
            Margarinas, mantequillas y aceites elaborados con las mejores materias primas para
            panaderías, reposterías e industrias de panificación.
          </p>
        </header>

        {products === null ? (
          <DataUnavailable resource="el catálogo" />
        ) : products.length === 0 ? (
          <CatalogInPreparation />
        ) : groups.length === 1 ? (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <li key={product.id}>
                <ProductCard product={product} />
              </li>
            ))}
          </ul>
        ) : (
          <div className="space-y-12">
            {groups.map((group) => (
              <section key={group.title} aria-label={group.title}>
                <h2 className="mb-5 border-t border-border pt-5 text-xl font-semibold text-petrol">
                  {group.title}
                </h2>
                <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {group.items.map((product) => (
                    <li key={product.id}>
                      <ProductCard product={product} />
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        )}
      </div>

      {/* Las variantes por clima cierran el catálogo: es aquí, comparando
          referencias, donde el comprador necesita saber que la misma
          margarina existe en tipo blanda, dura y dura costa (2026-08-28). */}
      <ClimateVariants />
    </>
  );
}
