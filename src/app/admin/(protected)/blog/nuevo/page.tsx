import { NewPostForm } from "./NewPostForm";

export const metadata = { title: "Nuevo artículo" };

export default function NewPostPage() {
  return (
    <div className="mx-auto max-w-lg">
      <h1 className="mb-2 text-2xl font-semibold">Nuevo artículo</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Se crea como borrador. Después podrás escribir el contenido y publicarlo.
      </p>
      <NewPostForm />
    </div>
  );
}
