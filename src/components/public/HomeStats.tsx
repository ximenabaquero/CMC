import type { ProductWithImage } from "@/lib/content";

/**
 * Franja de indicadores bajo el hero. Los valores se calculan con los datos
 * ya cargados por la home (productos publicados): nunca se escriben cifras
 * fijas. Un indicador con valor bajo (< 3) resta más de lo que suma como
 * cifra de confianza, así que se oculta; si no queda ninguno (o el catálogo
 * no cargó), la franja entera desaparece sin dejar hueco.
 * El layout es flexible: funciona igual con uno o dos indicadores.
 */
export function HomeStats({ products }: { products: ProductWithImage[] | null }) {
  if (!products) return null;

  const categoryCount = new Set(
    products.filter((p) => p.category).map((p) => p.category!.id)
  ).size;

  const items = [
    { value: products.length, label: "Productos en catálogo" },
    { value: categoryCount, label: "Categorías de producto" },
  ].filter((item) => item.value >= 3);

  if (items.length === 0) return null;

  return (
    <section aria-label="Indicadores del catálogo" className="bg-petrol">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8 sm:flex-row sm:items-center sm:gap-0">
        {items.map((item, index) => (
          <div
            key={item.label}
            className={`reveal flex items-baseline gap-3 sm:flex-col sm:gap-0 sm:pr-10 ${
              index > 0 ? "sm:border-l sm:border-white/15 sm:pl-10" : ""
            }`}
          >
            <span className="font-display text-4xl font-semibold text-amber sm:text-5xl">
              {item.value}
            </span>
            <span className="text-sm text-white/80">{item.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
