import type { Metadata } from "next";
import Link from "next/link";
import { getPublishedFaqs } from "@/lib/content";
import { DataUnavailable, FaqList } from "@/components/public/shared";

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
    <div className="mx-auto max-w-3xl px-4 py-14">
      <header className="mb-10">
        <p className="mb-1 text-sm font-semibold uppercase tracking-wide text-primary">
          Preguntas frecuentes
        </p>
        <h1 className="text-3xl font-semibold sm:text-4xl">Resolvemos tus dudas</h1>
        <p className="mt-3 text-muted-foreground">
          Si no encuentras la respuesta que buscas,{" "}
          <Link href="/contacto" className="text-secondary underline underline-offset-2">
            contáctanos
          </Link>
          .
        </p>
      </header>

      {faqs === null ? (
        <DataUnavailable resource="las preguntas frecuentes" />
      ) : faqs.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border bg-surface-muted p-10 text-center text-muted-foreground">
          Muy pronto publicaremos las preguntas frecuentes.
        </p>
      ) : (
        <FaqList faqs={faqs} />
      )}
    </div>
  );
}
