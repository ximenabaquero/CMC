import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { deleteFaq, updateFaq } from "@/actions/faqs";
import { FaqForm } from "@/components/admin/FaqForm";
import { ActionForm } from "@/components/admin/ActionForm";
import { ConfirmSubmitButton } from "@/components/admin/buttons";
import { PageHeader } from "@/components/admin/PageHeader";

export const metadata = { title: "Editar pregunta frecuente" };

export default async function EditFaqPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();

  const { data: faq, error } = await supabase.from("faqs").select("*").eq("id", id).maybeSingle();
  if (error) throw new Error("No se pudo cargar la pregunta.");
  if (!faq) notFound();

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <PageHeader
        title="Editar pregunta"
        backHref="/admin/preguntas-frecuentes"
        backLabel="Preguntas frecuentes"
      />

      {faq.internal_note ? (
        <p className="rounded-md border border-secondary/40 bg-secondary/10 p-3 text-sm">
          <strong>Nota interna:</strong> {faq.internal_note}
        </p>
      ) : null}

      <FaqForm faq={faq} action={updateFaq.bind(null, faq.id)} />

      <section className="rounded-lg border border-accent/30 bg-surface p-5">
        <h2 className="mb-2 text-lg font-semibold">Eliminar pregunta</h2>
        <ActionForm action={deleteFaq.bind(null, faq.id)}>
          <ConfirmSubmitButton confirmMessage="¿Eliminar definitivamente esta pregunta? Esta acción no se puede deshacer.">
            Eliminar pregunta
          </ConfirmSubmitButton>
        </ActionForm>
      </section>
    </div>
  );
}
