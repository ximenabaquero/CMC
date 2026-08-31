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
 * - **Aviso al salir** (2026-08-28): con cambios sin guardar, el navegador
 *   pide confirmación antes de cerrar o recargar la pestaña. El diálogo lo
 *   pinta el navegador y no admite texto propio; cubre solo la salida del
 *   documento, no la navegación interna del panel (Next no expone un
 *   bloqueo de rutas estable).
 * - **Foco al primer campo con error** (2026-08-28): en formularios de
 *   varias pantallas, un error en el tercer campo quedaba fuera de vista y
 *   el toast solo decía «revisa los campos». Ahora el primero se enfoca y
 *   se centra en pantalla.
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

  // Aviso del navegador al cerrar/recargar con cambios pendientes.
  useEffect(() => {
    if (!dirty) return;
    const onBeforeUnload = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirty]);

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

    // Foco al primer campo con error, en el orden del formulario y no en el
    // de las claves de `fieldErrors` (que es el de Zod y no tiene por qué
    // coincidir con lo que ve la usuaria).
    const errored = new Set(Object.keys(state.fieldErrors ?? {}));
    if (errored.size === 0) return;
    for (const element of Array.from(form.elements)) {
      if (
        (element instanceof HTMLInputElement ||
          element instanceof HTMLTextAreaElement ||
          element instanceof HTMLSelectElement) &&
        element.name &&
        errored.has(element.name)
      ) {
        element.focus({ preventScroll: true });
        element.scrollIntoView({ block: "center", behavior: "smooth" });
        return;
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
