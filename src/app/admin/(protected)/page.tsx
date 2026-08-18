import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function AdminDashboardPage() {
  const supabase = await createSupabaseServerClient();

  const [products, posts, faqs] = await Promise.all([
    supabase.from("products").select("status"),
    supabase.from("blog_posts").select("status"),
    supabase.from("faqs").select("status"),
  ]);

  if (products.error || posts.error || faqs.error) {
    throw new Error("No se pudo cargar el resumen del contenido.");
  }

  const resumen = [
    {
      titulo: "Productos",
      href: "/admin/productos",
      publicados: products.data.filter((p) => p.status === "PUBLISHED").length,
      borradores: products.data.filter((p) => p.status === "DRAFT").length,
    },
    {
      titulo: "Artículos del blog",
      href: "/admin/blog",
      publicados: posts.data.filter((p) => p.status === "PUBLISHED").length,
      borradores: posts.data.filter((p) => p.status === "DRAFT").length,
    },
    {
      titulo: "Preguntas frecuentes",
      href: "/admin/preguntas-frecuentes",
      publicados: faqs.data.filter((f) => f.status === "PUBLISHED").length,
      borradores: faqs.data.filter((f) => f.status === "DRAFT").length,
    },
  ];

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="mb-2 text-2xl font-semibold">Bienvenida al panel</h1>
      <p className="mb-8 max-w-prose text-base text-muted-foreground">
        Desde aquí puedes actualizar los textos, las imágenes, los productos, el blog y las
        preguntas frecuentes del sitio. Los cambios se publican en el sitio público al guardar.
      </p>

      <div className="grid gap-4 sm:grid-cols-3">
        {resumen.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="group rounded-lg border border-border bg-surface p-5 transition hover:border-primary"
          >
            <h2 className="mb-3 flex items-center justify-between gap-2 text-base font-semibold">
              {item.titulo}
              <span
                aria-hidden="true"
                className="text-muted-foreground transition group-hover:text-primary"
              >
                →
              </span>
            </h2>
            <p className="text-3xl font-semibold text-primary">{item.publicados}</p>
            <p className="text-sm text-muted-foreground">publicados</p>
            <p className="mt-2 text-sm text-muted-foreground">
              {item.borradores} en borrador
            </p>
          </Link>
        ))}
      </div>

      <div className="mt-8 rounded-lg border border-border bg-surface p-5">
        <h2 className="mb-2 text-base font-semibold">¿Cómo funciona?</h2>
        <ul className="list-inside list-disc space-y-1 text-base text-muted-foreground">
          <li>
            <strong>Borrador:</strong> el contenido se guarda pero no aparece en el sitio público.
          </li>
          <li>
            <strong>Publicado:</strong> el contenido es visible para todos los visitantes.
          </li>
          <li>Antes de eliminar algo, el sistema siempre pide confirmación.</li>
          <li>
            La guía completa está en el documento <em>Guía del CMS</em> entregado con el proyecto.
          </li>
        </ul>
      </div>
    </div>
  );
}
