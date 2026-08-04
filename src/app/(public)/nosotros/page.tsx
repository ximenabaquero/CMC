import type { Metadata } from "next";
import { extractPillars, getPublishedSections } from "@/lib/content";
import { DataUnavailable, SectionHeading } from "@/components/public/shared";

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
        <h1 className="mb-6 text-3xl font-semibold">Nosotros</h1>
        <DataUnavailable resource="la información de la empresa" />
      </div>
    );
  }

  const intro = sections.home_intro;
  const pillars = extractPillars(sections.pillars);
  const blocks = ABOUT_SECTION_KEYS.map((key) => sections[key]).filter(Boolean);

  return (
    <div className="mx-auto max-w-6xl px-4 py-14">
      <header className="max-w-3xl">
        <p className="mb-1 text-sm font-semibold uppercase tracking-wide text-primary">Nosotros</p>
        <h1 className="text-3xl font-semibold sm:text-4xl">
          {intro?.title ?? "¿Quiénes somos?"}
        </h1>
        {intro?.body ? <p className="mt-4 text-lg text-muted-foreground">{intro.body}</p> : null}
      </header>

      <div className="mt-12 grid gap-6 lg:grid-cols-2">
        {blocks.map((block) => (
          <section
            key={block.section_key}
            aria-labelledby={`sec-${block.section_key}`}
            className="rounded-lg border border-border bg-surface p-6"
          >
            <h2 id={`sec-${block.section_key}`} className="text-xl font-semibold">
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

      {pillars.length > 0 ? (
        <section className="mt-14" aria-labelledby="pilares-nosotros">
          <SectionHeading
            eyebrow="Propuesta de valor"
            title="Seis pilares innegociables"
          />
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {pillars.map((pillar) => (
              <li key={pillar.title} className="rounded-lg border border-border bg-surface-muted p-5">
                <h3 className="font-semibold">{pillar.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{pillar.description}</p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
