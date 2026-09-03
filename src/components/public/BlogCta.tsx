import Link from "next/link";
import { WhatsAppIcon } from "@/components/public/icons";
import type { SiteSettings } from "@/lib/supabase/types";

/**
 * Banda de cierre de la superficie de blog: el índice `/blog` y cada
 * artículo. Nació dentro de `PostArticle` (2026-08-21) y se extrajo el
 * 2026-09-03 al darle también el cierre al índice, que terminaba en el pie
 * sin una sola salida — el único rincón del sitio público sin el camino a
 * WhatsApp a un paso, contra la regla de DESIGN.md.
 *
 * Es deliberadamente **más sobria que `HomeCta`**: sin círculo ámbar ni GIF
 * de mantequilla. La banda de la home es el cierre del recorrido comercial y
 * puede permitirse decoración; esta cierra lectura y aparece dos veces
 * seguidas para quien pasa del índice a un artículo, así que se comporta como
 * un pie de sección y no compite con el contenido (One Hero Rule).
 *
 * Eyebrow **ámbar** sobre petróleo: adaptación documentada de la Eyebrow Rule
 * para fondos oscuros (el naranja editorial cae a ~2.6:1 ahí).
 *
 * `settings` es opcional porque la vista previa del panel no lo tiene: sin
 * WhatsApp configurado el CTA se degrada al enlace de /contacto.
 */
export function BlogCta({ settings, id }: { settings?: SiteSettings | null; id: string }) {
  const whatsappHref = settings?.whatsapp
    ? `https://wa.me/${settings.whatsapp.replace(/\D/g, "")}`
    : null;

  return (
    <section aria-labelledby={id} className="bg-petrol-deep">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-14 sm:py-16 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-wide text-amber">Asesoría</p>
          <h2 id={id} className="mt-2 text-balance text-2xl font-semibold text-white sm:text-3xl">
            ¿Tienes preguntas sobre nuestros productos?
          </h2>
          <p className="mt-3 text-white/80">
            Te ayudamos a elegir la margarina, mantequilla o aceite que mejor se ajusta a tu proceso
            de producción.
          </p>
        </div>
        {whatsappHref ? (
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex shrink-0 items-center gap-2.5 self-start rounded-md bg-amber px-7 py-3.5 text-base font-semibold text-petrol-deep transition ease-out hover:bg-amber-hover active:scale-[0.98] motion-reduce:active:scale-100 lg:self-auto"
          >
            <WhatsAppIcon className="size-5 shrink-0" />
            Escríbenos por WhatsApp
          </a>
        ) : (
          <Link
            href="/contacto"
            className="inline-block shrink-0 self-start rounded-md bg-amber px-7 py-3.5 text-base font-semibold text-petrol-deep transition ease-out hover:bg-amber-hover active:scale-[0.98] motion-reduce:active:scale-100 lg:self-auto"
          >
            Contáctanos
          </Link>
        )}
      </div>
    </section>
  );
}
