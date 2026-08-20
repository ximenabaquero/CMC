import { Markdown } from "@/lib/markdown";
import type { Faq } from "@/lib/supabase/types";

/**
 * Acordeón editorial de preguntas frecuentes: numeración naranja, chevron en
 * círculo mostaza y encabezado petróleo al abrir. `details` con `name`
 * compartido = solo una pregunta abierta a la vez, sin JavaScript (en
 * navegadores sin soporte se degradan a múltiples abiertas). Único patrón de
 * FAQ del sitio: lo usan la página /preguntas-frecuentes y la sección de
 * destacadas de la home (2026-08-19; reemplazó al FaqList compacto).
 */
export function FaqAccordion({ faqs }: { faqs: Faq[] }) {
  return (
    <ol role="list" className="list-none space-y-3">
      {faqs.map((faq, index) => (
        <li key={faq.id}>
          <details
            name="preguntas-frecuentes"
            className="group overflow-hidden rounded-lg border border-border bg-surface"
          >
            {/* Anillo de foco interior: el outline global (azul, offset hacia
                afuera) quedaría recortado por overflow-hidden y no contrasta
                sobre petróleo. */}
            <summary className="cursor-pointer list-none px-5 py-4 marker:hidden [&::-webkit-details-marker]:hidden transition-colors duration-[var(--dur-fast)] group-open:bg-petrol focus-visible:outline-2 focus-visible:-outline-offset-4 group-open:focus-visible:outline-white">
              <span className="flex items-center gap-4">
                <span
                  aria-hidden="true"
                  className="text-sm font-semibold tabular-nums text-orange group-open:text-amber"
                >
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="flex-1 text-lg font-semibold leading-snug text-petrol group-open:text-white">
                  {faq.question}
                </span>
                <span
                  aria-hidden="true"
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-butter-light text-petrol transition duration-[var(--dur-base)] [transition-timing-function:var(--ease-out)] group-open:rotate-180 group-open:bg-amber group-open:text-petrol-deep motion-reduce:transition-none"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="m4 6 4 4 4-4" />
                  </svg>
                </span>
              </span>
            </summary>
            <div className="border-t border-border bg-cream px-5 py-5 sm:px-6">
              <Markdown>{faq.answer}</Markdown>
            </div>
          </details>
        </li>
      ))}
    </ol>
  );
}
