"use client";

import { useEffect, useRef } from "react";
import { useToast, type ToastVariant } from "@/components/admin/toast";

/**
 * Muestra un toast tras una redirección (crear/eliminar). El server
 * page lee el query param (?creado=1 / ?eliminado=1), computa el
 * mensaje y lo pasa como prop. Este componente lo dispara una sola
 * vez y limpia el parámetro de la URL con history.replaceState para
 * que back/forward o recargar no lo repitan.
 */
export function FlashToast({
  message,
  variant = "success",
}: {
  message: string | null;
  variant?: ToastVariant;
}) {
  const { toast } = useToast();
  const fired = useRef(false);

  useEffect(() => {
    if (!message || fired.current) return;
    fired.current = true;
    toast({ variant, message });

    const url = new URL(window.location.href);
    if (url.searchParams.has("creado") || url.searchParams.has("eliminado")) {
      url.searchParams.delete("creado");
      url.searchParams.delete("eliminado");
      window.history.replaceState(window.history.state, "", url);
    }
  }, [message, variant, toast]);

  return null;
}
