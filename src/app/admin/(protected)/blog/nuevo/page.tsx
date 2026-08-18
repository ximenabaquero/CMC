import { NewPostForm } from "./NewPostForm";
import { PageHeader } from "@/components/admin/PageHeader";

export const metadata = { title: "Nuevo artículo" };

export default function NewPostPage() {
  return (
    <div className="mx-auto max-w-lg">
      <PageHeader
        title="Nuevo artículo"
        description="Se crea como borrador. Después podrás escribir el contenido y publicarlo."
        backHref="/admin/blog"
        backLabel="Blog"
      />
      <NewPostForm />
    </div>
  );
}
