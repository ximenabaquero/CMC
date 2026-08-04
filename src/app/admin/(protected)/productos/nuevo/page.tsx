import { NewProductForm } from "./NewProductForm";

export const metadata = { title: "Nuevo producto" };

export default function NewProductPage() {
  return (
    <div className="mx-auto max-w-lg">
      <h1 className="mb-2 text-2xl font-semibold">Nuevo producto</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Se crea como borrador. Después podrás completar la información y las imágenes antes de
        publicarlo.
      </p>
      <NewProductForm />
    </div>
  );
}
