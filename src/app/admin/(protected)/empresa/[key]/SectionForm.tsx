"use client";

import { useActionState, useState } from "react";
import { updateCompanySection } from "@/actions/content";
import { initialActionState } from "@/lib/action-state";
import type { CompanyContent, PillarItem } from "@/lib/supabase/types";
import { ActionFeedback, StatusField, TextAreaField, TextField } from "@/components/admin/fields";
import { SubmitButton } from "@/components/admin/buttons";
import { useActionToast } from "@/components/admin/toast";
import { UnsavedBadge, useAdminForm } from "@/components/admin/useAdminForm";

export function SectionForm({
  section,
  pillars,
}: {
  section: CompanyContent;
  pillars: PillarItem[] | null;
}) {
  const action = updateCompanySection.bind(null, section.section_key);
  const [state, formAction] = useActionState(action, initialActionState);
  useActionToast(state);
  const { formProps, dirty } = useAdminForm(state);
  const [items, setItems] = useState<PillarItem[]>(pillars ?? []);
  const fieldErrors = state.fieldErrors ?? {};

  return (
    <form
      {...formProps}
      action={formAction}
      className="space-y-4 rounded-lg border border-border bg-surface p-5"
    >
      {pillars ? <input type="hidden" name="pillars_json" value={JSON.stringify(items)} /> : null}

      <TextField
        label="Título"
        name="title"
        defaultValue={section.title}
        maxLength={200}
        error={fieldErrors.title?.[0]}
      />

      <TextAreaField
        label="Texto"
        name="body"
        defaultValue={section.body}
        rows={8}
        hint="Separa los párrafos con una línea en blanco."
        error={fieldErrors.body?.[0]}
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
                  className="rounded-md border border-border bg-surface px-3 py-2 text-base"
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
                  className="rounded-md border border-border bg-surface px-3 py-2 text-base"
                />
                <button
                  type="button"
                  onClick={() => setItems((prev) => prev.filter((_, i) => i !== index))}
                  className="min-h-10 rounded-md border border-border px-2.5 py-1 text-sm hover:bg-surface-muted"
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
            className="mt-3 min-h-10 rounded-md border border-border px-3 py-1.5 text-sm hover:bg-surface-muted disabled:opacity-50"
          >
            + Agregar pilar
          </button>
        </fieldset>
      ) : null}

      <StatusField defaultValue={section.status} error={fieldErrors.status?.[0]} />

      <ActionFeedback state={state} />
      <div className="flex flex-wrap items-center gap-3">
        <SubmitButton>Guardar cambios</SubmitButton>
        <UnsavedBadge dirty={dirty} />
      </div>
    </form>
  );
}
