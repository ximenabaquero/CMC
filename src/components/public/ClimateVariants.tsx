import Link from "next/link";
import { SectionHeading } from "@/components/public/shared";

/**
 * Variantes por clima (requerimiento 11 de la clienta, 2026-08-28): comunicar
 * como diferencial que una misma referencia DAP se produce en versiones
 * adaptadas al clima donde se va a trabajar.
 *
 * **Todo el dato viene de las fichas técnicas oficiales**, no de redacción
 * comercial: los rangos de atemperado están literales en las fichas de DAP
 * Hojaldre, Industrial y Semi Hojaldrados («Clima frío (TB): 18 °C – 22 °C.
 * Clima cálido (TD): 22 °C – 25 °C. Clima costa (TDC): 26 °C – 32 °C») y los
 * máximos de almacenamiento aparecen en casi todas («Máximo 25 °C (tipo
 * blanda), 32 °C (tipo dura) o 38 °C (tipo dura costa)»). La clienta pidió
 * hablar de dos climas; las fichas documentan tres, así que se publican los
 * tres — el de costa es el que más diferencia a un proveedor colombiano.
 *
 * El copy vive en código, no en el CMS, igual que `AudienceSectors`: crear una
 * sección editable exige migración y fila nueva en `company_content`. Anotado
 * en docs/CONTENT_PENDING.md §2b por si la clienta quiere editarlo a menudo.
 *
 * La franja gruesa de color en el borde superior de cada tarjeta es la otra
 * mitad del requerimiento 01 («franjas de colores más gruesas»), y aquí además
 * codifica: azul → frío, naranja → cálido, rojo → costa, una rampa térmica con
 * los colores que ya usa el sitio.
 */
const CLIMATES = [
  {
    name: "Clima frío",
    code: "Tipo blanda (TB)",
    description:
      "Para tierra fría, donde la margarina tiene que seguir siendo plástica y fácil de incorporar a baja temperatura.",
    temper: "18 °C – 22 °C",
    storage: "Hasta 25 °C",
    stripe: "bg-secondary",
    label: "text-secondary",
  },
  {
    name: "Clima cálido",
    code: "Tipo dura (TD)",
    description:
      "Para zonas templadas y cálidas del interior: aguanta más temperatura sin perder consistencia en el proceso.",
    temper: "22 °C – 25 °C",
    storage: "Hasta 32 °C",
    stripe: "bg-orange",
    label: "text-orange",
  },
  {
    name: "Clima costa",
    code: "Tipo dura costa (TDC)",
    description:
      "La versión más resistente, formulada para el calor y la humedad de la costa y los valles bajos.",
    temper: "26 °C – 32 °C",
    storage: "Hasta 38 °C",
    stripe: "bg-accent",
    label: "text-accent",
  },
];

export function ClimateVariants() {
  return (
    <section
      className="border-y border-border bg-surface-muted"
      aria-labelledby="variantes-clima"
    >
      <div className="mx-auto max-w-6xl px-4 py-16 sm:py-20">
        <SectionHeading
          id="variantes-clima"
          size="lg"
          tone="warm"
          eyebrow="Un diferencial de CMC"
          title="Un mismo producto, formulado para tu clima"
          description="Las margarinas, las mantequillas y los aceites cambian de comportamiento con la temperatura: lo que se trabaja bien en tierra fría se ablanda en el interior cálido y sufre en la costa. Por eso nuestras referencias se producen en tres versiones."
        />
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {CLIMATES.map((climate) => (
            <li
              key={climate.name}
              className="reveal overflow-hidden rounded-lg border border-border bg-surface"
            >
              <div aria-hidden="true" className={`h-1.5 w-full ${climate.stripe}`} />
              <div className="p-5">
                <p
                  className={`text-xs font-semibold uppercase tracking-wide ${climate.label}`}
                >
                  {climate.code}
                </p>
                <h3 className="mt-1 text-lg font-semibold text-petrol">{climate.name}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {climate.description}
                </p>
                <dl className="mt-5 space-y-2 border-t border-border pt-4 text-sm">
                  <div className="flex items-baseline justify-between gap-4">
                    <dt className="text-muted-foreground">Atemperado</dt>
                    <dd className="font-semibold tabular-nums text-petrol">{climate.temper}</dd>
                  </div>
                  <div className="flex items-baseline justify-between gap-4">
                    <dt className="text-muted-foreground">Almacenamiento</dt>
                    <dd className="font-semibold tabular-nums text-petrol">{climate.storage}</dd>
                  </div>
                </dl>
              </div>
            </li>
          ))}
        </ul>
        <p className="mt-8 text-sm text-muted-foreground">
          ¿No sabes cuál versión le conviene a tu proceso?{" "}
          <Link href="/contacto" className="font-semibold text-primary underline-offset-4 hover:underline">
            Escríbenos y te asesoramos <span aria-hidden="true">→</span>
          </Link>
        </p>
      </div>
    </section>
  );
}
