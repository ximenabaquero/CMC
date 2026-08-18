import { NewProductForm } from "./NewProductForm";
import { PageHeader } from "@/components/admin/PageHeader";

export const metadata = { title: "Nuevo producto" };

export default function NewProductPage() {
  return (
    <div className="mx-auto max-w-lg">
      <PageHeader
        title="Nuevo producto"
        description="Se crea como borrador. Después podrás completar la información y las imágenes antes de publicarlo."
        backHref="/admin/productos"
        backLabel="Productos"
      />
      <NewProductForm />
    </div>
  );
}
