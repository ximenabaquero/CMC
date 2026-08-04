import type { Metadata } from "next";
import { getPublishedProducts } from "@/lib/content";
import {
  CatalogInPreparation,
  DataUnavailable,
  ProductCard,
} from "@/components/public/shared";

export const metadata: Metadata = {
  title: "Productos",
  description:
    "Catálogo de margarinas, mantequillas y aceites de Compañía Mundial de Comercio S.A.S. para panadería, repostería e industria.",
};

export default async function ProductsPage() {
  let products: Awaited<ReturnType<typeof getPublishedProducts>> | null = null;
  try {
    products = await getPublishedProducts();
  } catch {
    products = null;
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-14">
      <header className="mb-10 max-w-2xl">
        <p className="mb-1 text-sm font-semibold uppercase tracking-wide text-primary">Catálogo</p>
        <h1 className="text-3xl font-semibold sm:text-4xl">Nuestros productos</h1>
        <p className="mt-3 text-muted-foreground">
          Margarinas, mantequillas y aceites elaborados con las mejores materias primas para
          panaderías, reposterías e industrias de panificación.
        </p>
      </header>

      {products === null ? (
        <DataUnavailable resource="el catálogo" />
      ) : products.length === 0 ? (
        <CatalogInPreparation />
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <li key={product.id}>
              <ProductCard product={product} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
