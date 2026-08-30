"use client";

import { UnsavedBadge } from "@/components/admin/useAdminForm";

/**
 * Barra de guardado de los formularios del panel (2026-08-28).
 *
 * Es **sticky al pie del viewport**: los formularios largos —producto,
 * artículo, contacto— medían varias pantallas y obligaban a bajar hasta el
 * final para guardar, o peor, a creer que no había botón. Ahora el botón
 * acompaña el scroll y el aviso de «Cambios sin guardar» viaja con él, que es
 * donde sirve.
 *
 * No usa márgenes negativos para sangrar hasta los bordes del `main`: la
 * columna del panel está centrada con `max-w-5xl` y sangrarla obligaría a
 * replicar aquí el padding responsive del layout. Va como barra flotante
 * dentro de la columna (`bottom-4`), con borde y fondo translúcido para que
 * el contenido que pasa por debajo se lea como contenido y no como parte de
 * la barra.
 *
 * `sticky` depende de que ningún ancestro tenga `overflow` recortado: hoy no
 * lo tienen ni `main` ni el contenedor de página. Si algún día se añade,
 * esta barra deja de pegarse sin avisar.
 */
export function FormFooter({
  children,
  dirty,
}: {
  children: React.ReactNode;
  dirty: boolean;
}) {
  return (
    <div className="sticky bottom-4 z-10 mt-6 flex flex-wrap items-center gap-3 rounded-lg border border-border bg-surface/95 p-3 shadow-sm backdrop-blur">
      {children}
      <UnsavedBadge dirty={dirty} />
    </div>
  );
}
