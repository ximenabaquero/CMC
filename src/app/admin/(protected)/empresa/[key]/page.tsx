import Link from "next/link";
import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { SECTION_LABELS } from "@/lib/section-labels";
import { SectionForm } from "./SectionForm";
import type { PillarItem } from "@/lib/supabase/types";

export const metadata = { title: "Editar sección" };

function extractPillars(data: unknown): PillarItem[] | null {
  if (
    data &&
    typeof data === "object" &&
    "items" in data &&
    Array.isArray((data as { items: unknown }).items)
  ) {
    return (data as { items: PillarItem[] }).items;
  }
  return null;
}

export default async function EditSectionPage({
  params,
}: {
  params: Promise<{ key: string }>;
}) {
  const { key } = await params;
  const supabase = await createSupabaseServerClient();

  const { data: section, error } = await supabase
    .from("company_content")
    .select("*")
    .eq("section_key", key)
    .maybeSingle();

  if (error) throw new Error("No se pudo cargar la sección.");
  if (!section) notFound();

  const meta = SECTION_LABELS[section.section_key] ?? {
    label: section.section_key,
    location: "",
  };
  const pillars = extractPillars(section.data);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <p className="text-xs text-muted-foreground">
          <Link href="/admin/empresa" className="underline-offset-2 hover:underline">
            Contenido de la empresa
          </Link>{" "}
          / {meta.label}
        </p>
        <h1 className="text-2xl font-semibold">{meta.label}</h1>
        {meta.location ? (
          <p className="text-sm text-muted-foreground">Se muestra en: {meta.location}</p>
        ) : null}
      </div>

      {section.internal_note ? (
        <p className="rounded-md border border-secondary/40 bg-secondary/10 p-3 text-sm">
          <strong>Nota interna:</strong> {section.internal_note}
        </p>
      ) : null}

      <SectionForm section={section} pillars={pillars} />
    </div>
  );
}
