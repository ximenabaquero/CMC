import { createFaq } from "@/actions/faqs";
import { FaqForm } from "@/components/admin/FaqForm";

export const metadata = { title: "Nueva pregunta frecuente" };

export default function NewFaqPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-semibold">Nueva pregunta frecuente</h1>
      <FaqForm action={createFaq} />
    </div>
  );
}
