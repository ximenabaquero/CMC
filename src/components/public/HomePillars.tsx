import { BakerySideOrnament } from "@/components/public/BakerySideOrnament";
import { SectionHeading } from "@/components/public/shared";
import type { CompanyContent, PillarItem } from "@/lib/supabase/types";

/**
 * Pilares de la empresa con presentación editorial: numeración, líneas
 * divisorias y jerarquía tipográfica en lugar de tarjetas idénticas.
 * Los textos vienen íntegros del CMS (`company_content.pillars`).
 * `withOrnaments` (solo la home, 2026-08-20): monta los ornamentos de
 * obrador anclados a esta sección — /nosotros reutiliza el componente y
 * no los lleva porque los tiene en su zona alta.
 */
export function HomePillars({
  section,
  pillars,
  withOrnaments = false,
}: {
  section?: CompanyContent;
  pillars: PillarItem[];
  withOrnaments?: boolean;
}) {
  if (pillars.length === 0) return null;

  const isOdd = pillars.length % 2 === 1;

  return (
    <section
      className={`border-y border-border bg-cream ${
        withOrnaments ? "relative overflow-x-clip" : ""
      }`}
      aria-labelledby="pilares"
    >
      {withOrnaments ? (
        <>
          <BakerySideOrnament />
          <BakerySideOrnament side="derecho" />
        </>
      ) : null}
      <div className="mx-auto max-w-6xl px-4 py-16 sm:py-20">
        <SectionHeading
          id="pilares"
          size="lg"
          tone="warm"
          eyebrow="Nuestros pilares"
          title={section?.title ?? "Nuestros pilares"}
          description={section?.body}
        />
        <ol className="grid gap-x-12 sm:grid-cols-2">
          {pillars.map((pillar, index) => (
            <li
              key={pillar.title}
              className={`reveal flex gap-5 border-t border-border py-6 ${
                isOdd && index === pillars.length - 1 ? "sm:col-span-2 sm:max-w-xl" : ""
              }`}
            >
              <span
                aria-hidden="true"
                className="font-display text-2xl font-semibold leading-none text-orange"
              >
                {String(index + 1).padStart(2, "0")}
              </span>
              <div>
                <h3 className="text-lg font-semibold text-petrol">{pillar.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  {pillar.description}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
