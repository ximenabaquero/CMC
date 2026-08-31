import { RollingPinOrnament } from "@/components/public/RollingPinOrnament";
import { SectionHeading } from "@/components/public/shared";
import type { CompanyContent, PillarItem } from "@/lib/supabase/types";

/**
 * Pilares de la empresa con presentación editorial: numeración, líneas
 * divisorias y jerarquía tipográfica en lugar de tarjetas idénticas.
 * Los textos vienen íntegros del CMS (`company_content.pillars`).
 *
 * **Banda verde (2026-08-28, requerimiento 01).** La clienta descartó el fondo
 * crema («se ve antiguo») y los ornamentos botánicos que lo acompañaban, y
 * pidió para esta sección «una composición más llamativa». Ahora es una banda
 * de color plena en el verde profundo del logotipo: el bloque de color más
 * grande de la home después del CTA, y el que corta la secuencia de blancos
 * justo a la mitad de la página. El ornamento que ocupaba los márgenes lo
 * releva el rodillo animado, alineado con el encabezado (misma posición que
 * el logo DAP junto a «Nuestros productos»).
 *
 * Sobre el verde, el eyebrow naranja del sitio no llega a AA: el encabezado
 * usa `tone="onDark"` (ámbar + blanco) y la numeración pasa a ámbar, 5.1:1.
 *
 * `withOrnament` (solo la home): /nosotros reutiliza el componente y no monta
 * el rodillo — allí la sección cierra la página y no necesita otro acento.
 */
export function HomePillars({
  section,
  pillars,
  withOrnament = false,
}: {
  section?: CompanyContent;
  pillars: PillarItem[];
  withOrnament?: boolean;
}) {
  if (pillars.length === 0) return null;

  const isOdd = pillars.length % 2 === 1;

  return (
    <section className="relative overflow-hidden bg-green-deep" aria-labelledby="pilares">
      <div className="relative mx-auto max-w-6xl px-4 py-16 sm:py-20">
        {withOrnament ? (
          <RollingPinOrnament className="pointer-events-none absolute right-4 top-16 hidden w-44 text-white/45 lg:block xl:w-52" />
        ) : null}
        <SectionHeading
          id="pilares"
          size="lg"
          tone="onDark"
          eyebrow="Nuestros pilares"
          title={section?.title ?? "Nuestros pilares"}
          description={section?.body}
        />
        <ol className="grid gap-x-12 sm:grid-cols-2">
          {pillars.map((pillar, index) => (
            <li
              key={pillar.title}
              className={`reveal flex gap-5 border-t border-white/20 py-6 ${
                isOdd && index === pillars.length - 1 ? "sm:col-span-2 sm:max-w-xl" : ""
              }`}
            >
              <span
                aria-hidden="true"
                className="font-display text-2xl font-semibold leading-none text-amber"
              >
                {String(index + 1).padStart(2, "0")}
              </span>
              <div>
                <h3 className="text-lg font-semibold text-white">{pillar.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-white/80">{pillar.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
