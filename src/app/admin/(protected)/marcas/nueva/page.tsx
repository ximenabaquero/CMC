import { NewBrandForm } from "./NewBrandForm";
import { PageHeader } from "@/components/admin/PageHeader";

export const metadata = { title: "Nueva marca" };

export default function NewBrandPage() {
  return (
    <div className="mx-auto max-w-lg">
      <PageHeader
        title="Nueva marca"
        description="Se crea como borrador. Después podrás subir el logo y publicarla para que aparezca en el carrusel de la página de inicio."
        backHref="/admin/marcas"
        backLabel="Marcas"
      />
      <NewBrandForm />
    </div>
  );
}
