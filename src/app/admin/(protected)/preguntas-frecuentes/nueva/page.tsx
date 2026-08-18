import { createFaq } from "@/actions/faqs";
import { FaqForm } from "@/components/admin/FaqForm";
import { PageHeader } from "@/components/admin/PageHeader";

export const metadata = { title: "Nueva pregunta frecuente" };

export default function NewFaqPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="Nueva pregunta frecuente"
        backHref="/admin/preguntas-frecuentes"
        backLabel="Preguntas frecuentes"
      />
      <FaqForm action={createFaq} />
    </div>
  );
}
