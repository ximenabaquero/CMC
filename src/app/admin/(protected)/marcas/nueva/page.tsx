import { NewBrandForm } from "./NewBrandForm";

export const metadata = { title: "Nueva marca" };

export default function NewBrandPage() {
  return (
    <div className="mx-auto max-w-lg">
      <h1 className="mb-2 text-2xl font-semibold">Nueva marca</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Se crea como borrador. Después podrás subir el logo y publicarla para que aparezca en el
        carrusel de la página de inicio.
      </p>
      <NewBrandForm />
    </div>
  );
}
