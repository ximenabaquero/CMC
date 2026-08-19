import Image from "next/image";
import Link from "next/link";
import type { CompanyContent, SiteSettings } from "@/lib/supabase/types";

const FALLBACK_EYEBROW = "Producción y distribución para el sector alimentario";
const FALLBACK_TITLE = "Productos confiables para cada preparación";
const FALLBACK_BODY =
  "Margarinas, mantequillas y aceites para panaderías, pastelerías e industrias que necesitan calidad, consistencia y respaldo en cada proceso.";

/**
 * Hero de la home. El texto (título y párrafo) viene de `company_content`
 * (`home_hero`) y el eyebrow del slogan de `site_settings`, ambos editables
 * desde el admin. La composición derecha muestra el logo animado de CMC
 * sobre un círculo blanco (decisión de la clienta, 2026-08-19: reemplaza el
 * packshot del primer producto publicado; el círculo pasó de ámbar a blanco
 * y se retiró el anillo naranja); con prefers-reduced-motion se usa la
 * versión estática del logotipo.
 *
 * Nota: `mix-blend-multiply` integra el fondo blanco del GIF/PNG al crema;
 * requiere `isolate` en la sección para no mezclarse con capas externas.
 */
export function HomeHero({
  hero,
  settings,
}: {
  hero?: CompanyContent;
  settings?: SiteSettings | null;
}) {
  const eyebrow = settings?.slogan?.trim() || FALLBACK_EYEBROW;
  const title = hero?.title?.trim() || FALLBACK_TITLE;
  const body = hero?.body?.trim() || FALLBACK_BODY;

  return (
    <section className="relative isolate overflow-hidden border-b border-border bg-hero-cream">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-12 sm:py-16 lg:min-h-[min(88vh,44rem)] lg:grid-cols-[52fr_48fr] lg:gap-14 lg:py-12">
        {/* Columna izquierda: mensaje y acciones */}
        <div>
          <p className="enter text-sm font-semibold uppercase tracking-wider text-orange">
            {eyebrow}
          </p>
          <h1 className="enter enter-lcp enter-2 mt-4 max-w-[16ch] text-balance text-[2.75rem] font-semibold leading-[1.06] text-petrol sm:text-6xl sm:leading-[1.04] lg:text-[4rem]">
            {title}
          </h1>
          <p className="enter enter-3 mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
            {body}
          </p>
          <div className="enter enter-4 mt-9 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/productos"
              className="rounded-md bg-primary px-7 py-3.5 text-center text-base font-semibold text-primary-foreground transition hover:bg-primary-hover ease-out active:scale-[0.98] motion-reduce:active:scale-100"
            >
              Ver catálogo
            </Link>
            <Link
              href="/contacto"
              className="rounded-md border-2 border-petrol px-7 py-3.5 text-center text-base font-semibold text-petrol transition hover:bg-petrol hover:text-white ease-out active:scale-[0.98] motion-reduce:active:scale-100"
            >
              Contáctanos
            </Link>
          </div>
        </div>

        {/* Columna derecha: logo CMC animado sobre el círculo blanco */}
        <div className="enter-visual relative mx-auto w-full max-w-md lg:max-w-none">
          {/* Círculo blanco protagonista (decorativo; antes ámbar — pedido
              de la clienta, 2026-08-19). Centrado con el emblema del logo
              (medido sobre el frame final del GIF, con el scale-125 el centro
              visual cae en ≈49/49 % del contenedor → centrar basta); en el
              PNG estático de reduced-motion el emblema queda más arriba
              (≈40 %), de ahí el override motion-reduce. */}
          <div
            aria-hidden="true"
            className="absolute left-1/2 top-1/2 h-56 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white sm:h-80 sm:w-80 lg:h-[26rem] lg:w-[26rem] motion-reduce:top-[40%]"
          />
          {/* Logo animado: entra una sola vez y queda fijo; estático con
              prefers-reduced-motion (mismo patrón que el header). */}
          <Image
            src="/gifsanimados/cmc-logo-entrada-una-vez.gif"
            alt="Logotipo animado de Compañía Mundial de Comercio S.A.S."
            width={512}
            height={340}
            priority
            className="relative z-10 w-full scale-125 mix-blend-multiply motion-reduce:hidden"
          />
          <Image
            src="/brand/logo-cmc-png.png"
            alt="Logotipo de Compañía Mundial de Comercio S.A.S."
            width={1920}
            height={1080}
            className="relative z-10 hidden w-full scale-125 mix-blend-multiply motion-reduce:block"
          />
        </div>
      </div>
    </section>
  );
}
