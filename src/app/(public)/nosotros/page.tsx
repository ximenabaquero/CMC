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

        {/* Ilustración de panes dibujada a mano (entregada por la clienta el
            2026-08-19; misma familia que los ornamentos laterales), con
            fondo transparente flotando sobre el hueso — sin tarjeta.
            Decorativa pura: alt vacío. Reemplazó a la escena real
            hero-mesa-panaderia-01 por decisión de la clienta. */}
        <figure className="reveal mt-10">
          <Image
            src="/images/decorative/quienes-somos-panes.webp"
            alt=""
            aria-hidden="true"
            width={1200}
            height={518}
            loading="lazy"
            className="w-full"
          />
        </figure>

        {/* Bloques institucionales en lenguaje editorial: divisores y
            jerarquía tipográfica, sin tarjetas idénticas. `reveal-strong` por
            bloque (2026-08-19, pedido de la clienta): entrada escalonada al
            scroll con recorrido marcado — la variante estándar le resultaba
            imperceptible. El stagger emerge de la posición. */}
        {blocks.length > 0 ? (
          <div className="mt-14 grid gap-x-14 gap-y-8 lg:grid-cols-2">
            {blocks.map((block) => (
              <section
                key={block.section_key}
                aria-labelledby={`sec-${block.section_key}`}
                className="reveal-strong border-t border-border pt-6"
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

        {/* Composición con producto DAP real y hojaldres elaborados,
            recortada con transparencia: tira ancha en proporción natural que
            flota sobre el hueso y cierra la sección institucional conectando
            materia prima y resultado (foto aprobada 2026-08-19). */}
        <figure className="reveal mt-14">
          <Image
            src="/images/photos/composicion-hojaldres-dap-hero-01-recorte.webp"
            alt="Surtido de hojaldres elaborados con margarina DAP junto a bol de margarina cremada"
            width={1200}
            height={486}
            loading="lazy"
            className="w-full"
          />
        </figure>
      </div>

      {/* Mismo lenguaje editorial de pilares que la home: un solo patrón
          para el mismo contenido en todo el sitio. */}
      <HomePillars section={sections.pillars} pillars={pillars} />
    </>
  );
}
