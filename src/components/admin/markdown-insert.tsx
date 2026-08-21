"use client";

import { createContext, useContext, type ReactNode } from "react";
import { useToast } from "./toast";

/**
 * Puente entre la lista de imágenes del artículo (árbol de servidor) y
 * el textarea del editor (cliente): el editor abre el contexto con su
 * función de inserción y los botones «Insertar en el texto», que viven
 * en la lista, escriben en el cursor a través de él.
 *
 * Sin este puente habría que anidar la lista dentro del <form> del
 * editor —y los formularios de subir/quitar son <form> a su vez, que no
 * pueden anidarse en HTML.
 */
type InsertMarkdown = (markdown: string) => void;

const InsertMarkdownContext = createContext<InsertMarkdown | null>(null);

export function InsertMarkdownProvider({
  insert,
  children,
}: {
  insert: InsertMarkdown;
  children: ReactNode;
}) {
  return <InsertMarkdownContext.Provider value={insert}>{children}</InsertMarkdownContext.Provider>;
}

/** Los corchetes y los saltos de línea romperían la sintaxis del alt. */
function imageMarkdown(alt: string, url: string): string {
  return `![${alt.replace(/[[\]\n]/g, " ").replace(/\s+/g, " ").trim()}](${url})`;
}

export function InsertImageButton({ url, alt }: { url: string; alt: string }) {
  const insert = useContext(InsertMarkdownContext);
  const { toast } = useToast();
  const markdown = imageMarkdown(alt, url);

  return (
    <button
      type="button"
      className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-md border border-border px-2.5 py-1 text-sm transition hover:bg-surface-muted"
      onClick={async () => {
        if (insert) {
          insert(markdown);
          toast({ variant: "success", message: "Imagen insertada en el contenido." });
          return;
        }
        // Fuera del editor: al menos dejar el código listo para pegar.
        try {
          await navigator.clipboard.writeText(markdown);
          toast({
            variant: "info",
            message: "Código de la imagen copiado. Pégalo dentro del contenido.",
          });
        } catch {
          toast({ variant: "error", message: "No se pudo copiar el código de la imagen." });
        }
      }}
    >
      Insertar en el texto
    </button>
  );
}
