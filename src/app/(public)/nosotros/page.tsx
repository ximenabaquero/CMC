import type { Metadata } from "next";
import Image from "next/image";
import { extractPillars, getPublishedSections } from "@/lib/content";
import { BakerySideOrnament } from "@/components/public/BakerySideOrnament";
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
      {/* Zona alta (título + ilustración) con los ornamentos de obrador
          anclados a ella — decoración por sección, no fija al viewport
          (pedido de la clienta, 2026-08-20). El wrapper full-bleed es
          relative + overflow-x-clip, requisito del ornamento absoluto. */}
      <div className="relative overflow-x-clip">
        <BakerySideOrnament />
        <BakerySideOrnament side="derecho" />
        {/* Apertura a dos columnas (2026-09-03). Antes era el texto a
            `max-w-3xl` y, debajo, una tira ancha de 1200×393 a todo el
            contenedor: la mitad derecha de la zona alta quedaba vacía y la
            proporción de la foto la fijaba el recorte, no la foto. La imagen
            nueva es 4:3, así que a ancho completo mediría 864 px de alto y
            se comería la apertura entera; en la columna corta cae a ~330 px y
            queda a la altura del texto que acompaña. Es la misma composición
            que usa «¿Quiénes somos?» en la home. */}
        <div className="mx-auto max-w-6xl px-4 pt-14">
        <div className="grid gap-10 lg:grid-cols-[3fr_2fr] lg:items-center lg:gap-14">
        <header>
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

        {/* Familia colombiana compartiendo pan en la mesa (foto entregada por
            la clienta el 2026-09-03). Cierra el requerimiento 14 del
            2026-08-28 —«fotografía de una familia colombiana compartiendo
            pan», que había quedado sin implementar por no tener foto real— y
            releva al cargue de cajas DAP en el camión
            (`cargue-cajas-dap-01.webp`, 2026-08-23), la más marcada por los
            indicios de IA que documenta docs/FOTOS_ADICIONALES.md: cajas
            rotuladas «AP» y pie «Compañía Mundial de **Cereales** S.A.S.».
            El cambio también cambia lo que dice la página: la empresa deja de
            presentarse con su logística y pasa a presentarse con el destino
            final de lo que produce.
            Al ser ESCENA REAL y no packshot ni recorte va enmarcada, con alt
            descriptivo: aquí la foto es contenido, no decoración. `priority`
            en vez de `loading="lazy"`: en el grid a dos columnas la foto queda
            sobre el pliegue, junto al h1. */}
        <figure className="reveal overflow-hidden rounded-lg border border-border">
          <Image
            src="/images/photos/familia-compartiendo-pan-01.webp"
            alt="Familia colombiana de tres generaciones compartiendo pan y chocolate alrededor de la mesa"
            width={1200}
            height={900}
            priority
            className="w-full"
          />
        </figure>
        </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 pb-14">
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
