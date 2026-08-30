import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/admin/PageHeader";

/**
 * Inicio del panel: cuánto hay publicado, qué queda en borrador y los cuatro
 * caminos que la usuaria recorre a diario.
 *
 * Los accesos rápidos (2026-08-28) evitan el rodeo listado → botón «+ Nuevo»
 * en la tarea más frecuente del panel, que es crear contenido. Los contadores
 * de borradores son enlaces propios: «3 en borrador» sin forma de ver cuáles
 * era un dato muerto.
 */
const QUICK_ACTIONS = [
  { href: "/admin/productos/nuevo", label: "Nuevo producto" },
  { href: "/admin/blog/nuevo", label: "Nuevo artículo" },
  { href: "/admin/preguntas-frecuentes/nueva", label: "Nueva pregunta" },
  { href: "/admin/contacto", label: "Editar datos de contacto" },
];

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
      <PageHeader
        title="Bienvenida al panel"
        description="Desde aquí puedes actualizar los textos, las imágenes, los productos, el blog y las preguntas frecuentes del sitio. Los cambios se publican en el sitio público al guardar."
      />

      <section aria-labelledby="accesos-rapidos" className="mb-8">
        <h2 id="accesos-rapidos" className="mb-3 text-sm font-semibold text-muted-foreground">
          Accesos rápidos
        </h2>
        <ul className="flex flex-wrap gap-2">
          {QUICK_ACTIONS.map((action) => (
            <li key={action.href}>
              <Link
                href={action.href}
                className="inline-flex min-h-11 items-center rounded-md border border-border bg-surface px-4 py-2 text-base font-medium transition hover:border-primary hover:text-primary"
              >
                {action.label}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <div className="grid gap-4 sm:grid-cols-3">
        {resumen.map((item) => (
          <div
            key={item.href}
            className="rounded-lg border border-border bg-surface p-5 transition hover:border-primary"
          >
            <h2 className="mb-3 text-base font-semibold">
              <Link href={item.href} className="group flex items-center justify-between gap-2">
                {item.titulo}
                <span
                  aria-hidden="true"
                  className="text-muted-foreground transition group-hover:text-primary"
                >
                  →
                </span>
              </Link>
            </h2>
            <p className="text-3xl font-semibold text-primary">{item.publicados}</p>
            <p className="text-sm text-muted-foreground">publicados</p>
            {item.borradores > 0 ? (
              // Enlace al listado ya filtrado: el número deja de ser un dato
              // suelto y pasa a ser el camino para revisarlos.
              <Link
                href={`${item.href}?estado=DRAFT`}
                className="mt-2 inline-block text-sm text-secondary underline-offset-2 hover:underline"
              >
                {item.borradores} en borrador →
              </Link>
            ) : (
              <p className="mt-2 text-sm text-muted-foreground">Sin borradores</p>
            )}
          </div>
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
