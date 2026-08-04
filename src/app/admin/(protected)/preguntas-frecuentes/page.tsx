import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata = { title: "Preguntas frecuentes" };

export default async function AdminFaqsPage({
  searchParams,
}: {
  searchParams: Promise<{ eliminado?: string; creado?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createSupabaseServerClient();

  const { data: faqs, error } = await supabase
    .from("faqs")
    .select("id, question, status, featured, sort_order, internal_note")
    .order("sort_order");

  if (error) throw new Error("No se pudieron cargar las preguntas frecuentes.");

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Preguntas frecuentes</h1>
          <p className="text-sm text-muted-foreground">
            Las preguntas destacadas también aparecen en la página de Inicio.
          </p>
        </div>
        <Link
          href="/admin/preguntas-frecuentes/nueva"
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary-hover"
        >
          + Nueva pregunta
        </Link>
      </div>

      {params.eliminado ? (
        <p role="status" className="mb-4 rounded-md border border-primary/40 bg-primary/10 p-3 text-sm text-primary">
          Pregunta eliminada.
        </p>
      ) : null}
      {params.creado ? (
        <p role="status" className="mb-4 rounded-md border border-primary/40 bg-primary/10 p-3 text-sm text-primary">
          Pregunta creada.
        </p>
      ) : null}

      <ul className="space-y-2">
        {faqs.map((faq) => (
          <li key={faq.id}>
            <Link
              href={`/admin/preguntas-frecuentes/${faq.id}`}
              className="flex items-center gap-3 rounded-lg border border-border bg-surface p-4 transition hover:border-primary"
            >
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium">{faq.question}</span>
                {faq.internal_note ? (
                  <span className="mt-1 block truncate text-xs text-secondary">
                    Nota: {faq.internal_note}
                  </span>
                ) : null}
              </span>
              {faq.featured ? (
                <span className="shrink-0 rounded-full bg-secondary/10 px-2.5 py-0.5 text-xs font-medium text-secondary">
                  Destacada
                </span>
              ) : null}
              <span
                className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  faq.status === "PUBLISHED"
                    ? "bg-primary/10 text-primary"
                    : "bg-surface-muted text-muted-foreground"
                }`}
              >
                {faq.status === "PUBLISHED" ? "Publicada" : "Borrador"}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
