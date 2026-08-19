import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getPublishedFaqs } from "@/lib/content";
import { DataUnavailable } from "@/components/public/shared";
import { FaqAccordion } from "@/components/public/FaqAccordion";

export const metadata: Metadata = {
  title: "Preguntas frecuentes",
  description:
    "Respuestas a las preguntas más frecuentes sobre nuestras margarinas, mantequillas y aceites.",
};

export default async function FaqsPage() {
  let faqs: Awaited<ReturnType<typeof getPublishedFaqs>> | null = null;
  try {
    faqs = await getPublishedFaqs();
  } catch {
    faqs = null;
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:py-20">
      <div className="grid gap-8 lg:grid-cols-[2fr_3fr] lg:items-start lg:gap-12">
        {/* Panel editorial: en móvil abre la página, en escritorio acompaña
            fijo al acordeón — solo en viewports con altura suficiente para el
            panel completo (~705px + offset); en portátiles bajos fluye normal
            en vez de quedar cortado. La foto va en flujo (tras el CTA) para
            que nunca tape el título ni el enlace en ningún ancho. */}
        <header className="relative isolate flex flex-col overflow-hidden rounded-lg bg-petrol-deep p-6 sm:p-8 lg:self-start lg:p-10 lg:[@media(min-height:53rem)]:sticky lg:[@media(min-height:53rem)]:top-24">
          <div
            aria-hidden="true"
            className="absolute -bottom-16 -right-16 -z-10 h-44 w-44 rounded-full bg-amber sm:h-56 sm:w-56 lg:h-64 lg:w-64"
          />
          {/* Eyebrow en ámbar: el naranja de la Eyebrow Rule no contrasta
              sobre petrol-deep (≈2.6:1). */}
          <p className="text-sm font-semibold uppercase tracking-wider text-amber">
            Preguntas frecuentes
          </p>
          <h1 className="mt-4 text-balance text-3xl font-semibold leading-tight text-white sm:text-4xl lg:text-[2.75rem]">
            Resolvemos tus dudas
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-white/90">
            Si no encuentras la respuesta que buscas, escríbenos y te acompañamos.
          </p>
          <Link
            href="/contacto"
            className="mt-8 inline-block self-start rounded-md bg-amber px-6 py-3 text-base font-semibold text-petrol-deep transition hover:bg-amber-hover ease-out active:scale-[0.98] motion-reduce:active:scale-100"
          >
            Contáctanos
          </Link>
          <div className="relative z-10 mt-10 flex justify-end lg:mt-14">
            <Image
              src="/images/photos/canasta-panes-surtidos-01-recorte.webp"
              alt=""
              width={800}
              height={745}
              loading="lazy"
              className="w-44 sm:w-56 lg:w-72"
            />
          </div>
        </header>

        <div>
          {faqs === null ? (
            <DataUnavailable resource="las preguntas frecuentes" />
          ) : faqs.length === 0 ? (
            <p className="rounded-lg border border-dashed border-border bg-surface-muted p-10 text-center text-muted-foreground">
              Muy pronto publicaremos las preguntas frecuentes.
            </p>
          ) : (
            <FaqAccordion faqs={faqs} />
          )}
        </div>
      </div>
    </div>
  );
}
