"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ActionState } from "@/lib/action-state";

/**
 * Plumbing común de los formularios del panel sobre useActionState:
 *
 * - **Conservar lo escrito tras un error**: React 19 resetea los campos
 *   no controlados cuando la Server Action termina. Este hook toma un
 *   snapshot de los valores al enviar y los restaura si la respuesta es
 *   de error (los inputs de archivo no se pueden restaurar).
 * - **"Cambios sin guardar"**: `dirty` se activa con onInput/onChange y
 *   se limpia cuando llega una respuesta de éxito.
 *
 * Uso: `const { formProps, dirty } = useAdminForm(state);` y esparcir
 * `{...formProps}` en el `<form>`.
 */
export function useAdminForm(state: ActionState): {
  formProps: {
    ref: React.RefObject<HTMLFormElement | null>;
    onInput: () => void;
    onSubmit: () => void;
  };
  dirty: boolean;
} {
  const formRef = useRef<HTMLFormElement>(null);
  const [dirty, setDirty] = useState(false);
  const snapshot = useRef<{ name: string; value: string; checked?: boolean }[]>([]);
  const lastRestoredTs = useRef<number | undefined>(undefined);

  const markDirty = useCallback(() => setDirty(true), []);

  const captureSnapshot = useCallback(() => {
    const form = formRef.current;
    if (!form) return;
    const items: { name: string; value: string; checked?: boolean }[] = [];
    for (const element of Array.from(form.elements)) {
      if (element instanceof HTMLInputElement) {
        if (["file", "submit", "button", "hidden"].includes(element.type)) continue;
        if (element.type === "checkbox" || element.type === "radio") {
          items.push({ name: element.name, value: element.value, checked: element.checked });
        } else if (element.name) {
          items.push({ name: element.name, value: element.value });
        }
      } else if (
        element instanceof HTMLTextAreaElement ||
        element instanceof HTMLSelectElement
      ) {
        if (element.name) items.push({ name: element.name, value: element.value });
      }
    }
    snapshot.current = items;
  }, []);

  useEffect(() => {
    if (state.status === "success") {
      setDirty(false);
      return;
    }
    if (state.status !== "error" || !state.ts || state.ts === lastRestoredTs.current) return;
    lastRestoredTs.current = state.ts;

    const form = formRef.current;
    if (!form) return;
    for (const item of snapshot.current) {
      const element = form.elements.namedItem(item.name);
      if (element instanceof HTMLInputElement) {
        if (element.type === "checkbox" || element.type === "radio") {
          if (item.checked !== undefined) element.checked = item.checked;
        } else {
          element.value = item.value;
        }
      } else if (
        element instanceof HTMLTextAreaElement ||
        element instanceof HTMLSelectElement
      ) {
        element.value = item.value;
      }
    }
  }, [state]);

  return {
    formProps: { ref: formRef, onInput: markDirty, onSubmit: captureSnapshot },
    dirty,
  };
}

export function UnsavedBadge({ dirty }: { dirty: boolean }) {
  if (!dirty) return null;
  return <span className="text-sm text-muted-foreground">Cambios sin guardar</span>;
}
