import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { FlashToast } from "@/components/admin/FlashToast";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { EmptyState } from "@/components/admin/EmptyState";
import { ListToolbar } from "@/components/admin/ListToolbar";
import { matchesQuery, matchesStatus } from "@/lib/search";

export const metadata = { title: "Preguntas frecuentes" };

export default async function AdminFaqsPage({
  searchParams,
}: {
  searchParams: Promise<{ eliminado?: string; creado?: string; q?: string; estado?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createSupabaseServerClient();

  const { data: allFaqs, error } = await supabase
    .from("faqs")
    .select("id, question, status, featured, sort_order, internal_note")
    .order("sort_order");

  if (error) throw new Error("No se pudieron cargar las preguntas frecuentes.");

  // Filtro en memoria: ver el porqué en src/lib/search.ts.
  const faqs = allFaqs.filter(
    (faq) =>
      matchesStatus(params.estado, faq.status) &&
      matchesQuery(params.q, faq.question, faq.internal_note)
  );

  const flashMessage = params.eliminado
    ? "Pregunta eliminada."
    : params.creado
      ? "Pregunta creada."
      : null;

  return (
    <div className="mx-auto max-w-5xl">
      <FlashToast message={flashMessage} />
      <PageHeader
        title="Preguntas frecuentes"
        description="Las preguntas destacadas también aparecen en la página de Inicio."
        actions={
          <Link
            href="/admin/preguntas-frecuentes/nueva"
            className="inline-flex min-h-11 items-center rounded-md bg-primary px-4 py-2 text-base font-medium text-primary-foreground hover:bg-primary-hover"
          >
            + Nueva pregunta
          </Link>
        }
      />

      {allFaqs.length > 0 ? (
        <ListToolbar
          basePath="/admin/preguntas-frecuentes"
          q={params.q}
          status={params.estado}
          searchLabel="Buscar preguntas"
          searchPlaceholder="Buscar por pregunta…"
          total={allFaqs.length}
          shown={faqs.length}
          itemsLabel="preguntas"
        />
      ) : null}

      {allFaqs.length === 0 ? (
        <EmptyState
          title="Aún no hay preguntas frecuentes"
          description="Crea la primera pregunta; quedará en borrador hasta que la publiques."
          cta={{ href: "/admin/preguntas-frecuentes/nueva", label: "Crear primera pregunta" }}
        />
      ) : faqs.length === 0 ? (
        <EmptyState
          title="Ninguna pregunta coincide con la búsqueda"
          description="Prueba con otro término o quita el filtro de estado."
        />
      ) : null}

      <ul className="space-y-2">
        {faqs.map((faq) => (
          <li key={faq.id}>
            <Link
              href={`/admin/preguntas-frecuentes/${faq.id}`}
              className="flex items-center gap-3 rounded-lg border border-border bg-surface p-4 transition hover:border-primary"
            >
              <span className="min-w-0 flex-1">
                <span className="block truncate text-base font-medium">{faq.question}</span>
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
              <StatusBadge status={faq.status} publishedLabel="Publicada" />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
