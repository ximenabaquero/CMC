"use client";

import { useActionState, useState } from "react";
import { updateCompanySection } from "@/actions/content";
import { initialActionState } from "@/lib/action-state";
import type { CompanyContent, PillarItem } from "@/lib/supabase/types";
import { ActionFeedback, StatusField, TextAreaField, TextField } from "@/components/admin/fields";
import { SubmitButton } from "@/components/admin/buttons";

export function SectionForm({
  section,
  pillars,
}: {
  section: CompanyContent;
  pillars: PillarItem[] | null;
}) {
  const action = updateCompanySection.bind(null, section.section_key);
  const [state, formAction] = useActionState(action, initialActionState);
  const [items, setItems] = useState<PillarItem[]>(pillars ?? []);

  return (
    <form action={formAction} className="space-y-4 rounded-lg border border-border bg-surface p-5">
      {pillars ? <input type="hidden" name="pillars_json" value={JSON.stringify(items)} /> : null}

      <TextField label="Título" name="title" defaultValue={section.title} maxLength={200} />

      <TextAreaField
        label="Texto"
        name="body"
        defaultValue={section.body}
        rows={8}
        hint="Separa los párrafos con una línea en blanco."
      />

      {pillars ? (
        <fieldset className="rounded-md border border-border p-4">
          <legend className="px-1 text-sm font-semibold">Pilares</legend>
          <ul className="space-y-3">
            {items.map((item, index) => (
              <li key={index} className="grid gap-2 sm:grid-cols-[1fr_2fr_auto]">
                <input
                  type="text"
                  aria-label={`Título del pilar ${index + 1}`}
                  value={item.title}
                  maxLength={120}
                  onChange={(e) =>
                    setItems((prev) =>
                      prev.map((p, i) => (i === index ? { ...p, title: e.target.value } : p))
                    )
                  }
                  className="rounded-md border border-border bg-surface px-3 py-2 text-sm"
                />
                <input
                  type="text"
                  aria-label={`Descripción del pilar ${index + 1}`}
                  value={item.description}
                  maxLength={400}
                  onChange={(e) =>
                    setItems((prev) =>
                      prev.map((p, i) => (i === index ? { ...p, description: e.target.value } : p))
                    )
                  }
                  className="rounded-md border border-border bg-surface px-3 py-2 text-sm"
                />
                <button
                  type="button"
                  onClick={() => setItems((prev) => prev.filter((_, i) => i !== index))}
                  className="rounded-md border border-border px-2 py-1 text-xs hover:bg-surface-muted"
                >
                  Quitar
                </button>
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={() => setItems((prev) => [...prev, { title: "", description: "" }])}
            disabled={items.length >= 12}
            className="mt-3 rounded-md border border-border px-3 py-1.5 text-sm hover:bg-surface-muted disabled:opacity-50"
          >
            + Agregar pilar
          </button>
        </fieldset>
      ) : null}

      <StatusField defaultValue={section.status} />

      <ActionFeedback success={state.success} error={state.error} />
      <SubmitButton>Guardar cambios</SubmitButton>
    </form>
  );
}
