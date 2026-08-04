import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { SECTION_LABELS } from "@/lib/section-labels";

export const metadata = { title: "Contenido de la empresa" };

export default async function AdminCompanyPage() {
  const supabase = await createSupabaseServerClient();

  const { data: sections, error } = await supabase
    .from("company_content")
    .select("section_key, title, status, internal_note, updated_at")
    .order("section_key");

  if (error) throw new Error("No se pudo cargar el contenido de la empresa.");

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="mb-2 text-2xl font-semibold">Contenido de la empresa</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Textos de las páginas de Inicio y Nosotros. Los bloques en borrador no se muestran al
        público.
      </p>

      <ul className="space-y-2">
        {sections.map((section) => {
          const meta = SECTION_LABELS[section.section_key] ?? {
            label: section.section_key,
            location: "",
          };
          return (
            <li key={section.section_key}>
              <Link
                href={`/admin/empresa/${section.section_key}`}
                className="flex items-center gap-3 rounded-lg border border-border bg-surface p-4 transition hover:border-primary"
              >
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">{meta.label}</span>
                  <span className="block text-xs text-muted-foreground">
                    Se muestra en: {meta.location}
                  </span>
                  {section.internal_note ? (
                    <span className="mt-1 block truncate text-xs text-secondary">
                      Nota: {section.internal_note}
                    </span>
                  ) : null}
                </span>
                <span
                  className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    section.status === "PUBLISHED"
                      ? "bg-primary/10 text-primary"
                      : "bg-surface-muted text-muted-foreground"
                  }`}
                >
                  {section.status === "PUBLISHED" ? "Publicado" : "Borrador"}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
