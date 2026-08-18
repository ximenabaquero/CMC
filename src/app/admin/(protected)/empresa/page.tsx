import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { SECTION_LABELS } from "@/lib/section-labels";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatusBadge } from "@/components/admin/StatusBadge";

export const metadata = { title: "Contenido de la empresa" };

export default async function AdminCompanyPage() {
  const supabase = await createSupabaseServerClient();

  const { data: sections, error } = await supabase
    .from("company_content")
    .select("section_key, title, status, internal_note, updated_at")
    .order("section_key");

  if (error) throw new Error("No se pudo cargar el contenido de la empresa.");

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        title="Contenido de la empresa"
        description="Textos de las páginas de Inicio y Nosotros. Los bloques en borrador no se muestran al público."
      />

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
                  <span className="block truncate text-base font-medium">{meta.label}</span>
                  <span className="block text-sm text-muted-foreground">
                    Se muestra en: {meta.location}
                  </span>
                  {section.internal_note ? (
                    <span className="mt-1 block truncate text-xs text-secondary">
                      Nota: {section.internal_note}
                    </span>
                  ) : null}
                </span>
                <StatusBadge status={section.status} />
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
