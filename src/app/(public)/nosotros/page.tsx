import type { Metadata } from "next";
import Image from "next/image";
import { extractPillars, getPublishedSections } from "@/lib/content";
import { DataUnavailable } from "@/components/public/shared";
import { HomePillars } from "@/components/public/HomePillars";

export const metadata: Metadata = {
  title: "Nosotros",
  description:
    "Conoce a Compañía Mundial de Comercio S.A.S.: experiencia, pilares y compromiso en la producción y distribución de margarinas, mantequillas y aceites.",
};

const ABOUT_SECTION_KEYS = ["about_promise", "about_experience", "about_chain", "about_ally"] as const;

export default async function AboutPage() {
  let sections: Awaited<ReturnType<typeof getPublishedSections>> | null = null;
  try {
    sections = await getPublishedSections();
  } catch {
    sections = null;
  }

  if (!sections) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-14">
        <h1 className="mb-6 text-3xl font-semibold text-petrol">Nosotros</h1>
        <DataUnavailable resource="la información de la empresa" />
      </div>
    );
  }

  const intro = sections.home_intro;
  const pillars = extractPillars(sections.pillars);
  const blocks = ABOUT_SECTION_KEYS.map((key) => sections[key]).filter(Boolean);
  const introParagraphs = intro?.body ? intro.body.split(/\n\n+/) : [];

  return (
    <>
      <div className="mx-auto max-w-6xl px-4 py-14">
        <header className="max-w-3xl">
          <p className="mb-1 text-sm font-semibold uppercase tracking-wide text-orange">Nosotros</p>
          <h1 className="text-3xl font-semibold text-petrol sm:text-4xl">
            {intro?.title ?? "¿Quiénes somos?"}
          </h1>
          {introParagraphs.map((paragraph, index) => (
            <p
              key={index}
              className={
                index === 0
                  ? "mt-4 text-lg font-medium leading-snug text-petrol"
                  : "mt-4 text-muted-foreground"
              }
            >
              {paragraph}
            </p>
          ))}
        </header>

        {/* Escena real de panadería (foto aprobada 2026-08-19). Recorte
            panorámico con object-cover: la regla de no recortar aplica a
            los empaques, no a las escenas. */}
        <figure className="reveal mt-10 overflow-hidden rounded-lg border border-border">
          <Image
            src="/images/photos/hero-mesa-panaderia-01.webp"
            alt="Mesa de panadería con surtido de panes, hojaldres y amasijos frente a una ventana luminosa"
            width={1200}
            height={1200}
            loading="lazy"
            className="aspect-[16/7] w-full object-cover object-bottom sm:aspect-[21/9]"
          />
        </figure>

        {/* Bloques institucionales en lenguaje editorial: divisores y
            jerarquía tipográfica, sin tarjetas idénticas. */}
        {blocks.length > 0 ? (
          <div className="mt-14 grid gap-x-14 gap-y-8 lg:grid-cols-2">
            {blocks.map((block) => (
              <section
                key={block.section_key}
                aria-labelledby={`sec-${block.section_key}`}
                className="border-t border-border pt-6"
              >
                <h2 id={`sec-${block.section_key}`} className="text-xl font-semibold text-petrol">
                  {block.title}
                </h2>
                {block.body ? (
                  <div className="mt-3 space-y-3 text-muted-foreground">
                    {block.body.split(/\n\n+/).map((paragraph, index) => (
                      <p key={index}>{paragraph}</p>
                    ))}
                  </div>
                ) : null}
              </section>
            ))}
          </div>
        ) : null}

        {/* Composición con producto DAP real y hojaldres elaborados:
            cierra la sección institucional conectando materia prima y
            resultado (foto aprobada 2026-08-19). */}
        <figure className="reveal mt-14 overflow-hidden rounded-lg border border-border bg-white">
          <Image
            src="/images/photos/composicion-hojaldres-dap-hero-01.webp"
            alt="Surtido de hojaldres elaborados con margarina DAP junto a bol de margarina cremada"
            width={1200}
            height={1200}
            loading="lazy"
            className="aspect-[16/6] w-full object-cover object-center"
          />
        </figure>
      </div>

      {/* Mismo lenguaje editorial de pilares que la home: un solo patrón
          para el mismo contenido en todo el sitio. */}
      <HomePillars section={sections.pillars} pillars={pillars} />
    </>
  );
}
