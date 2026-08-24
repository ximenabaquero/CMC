import Image from "next/image";
import Link from "next/link";
import type { CompanyContent, SiteSettings } from "@/lib/supabase/types";

const FALLBACK_EYEBROW = "Producción y distribución para el sector alimentario";
const FALLBACK_TITLE = "Productos confiables para cada preparación";
const FALLBACK_BODY =
  "Margarinas, mantequillas y aceites para panaderías, pastelerías e industrias que necesitan calidad, consistencia y respaldo en cada proceso.";

/* Fondo rotativo del hero (pedido de la clienta, 2026-08-20): 2 escenas
   editoriales sin uso previo + 5 fotos de aplicación de producto variadas
   (hojaldre, repostería, aliñado, ponqué y multipropósito), todas WebP
   1200×1200 sobre fondo blanco. Las de aplicación ya viven en las fichas
   de producto y aquí reaparecen solo como TEXTURA a baja opacidad —
   excepción documentada a «ninguna foto se repite» en
   docs/FOTOS_ADICIONALES.md. La rotación es CSS pura:
   `.hero-slides`/`.hero-slide` en globals.css. El orden alterna
   escena ↔ aplicación; la primera es la que queda estática con
   prefers-reduced-motion. */
const HERO_SLIDES = [
  "/images/photos/hero-mesa-panaderia-01.webp",
  "/images/products/dap-hojaldre/dap-hojaldre-aplicacion-01.webp",
  "/images/photos/composicion-surtido-amasijos-01.webp",
  "/images/products/dap-reposteria/dap-reposteria-aplicacion-01.webp",
  "/images/products/dap-alinado/dap-alinado-aplicacion-01.webp",
  "/images/products/dap-alta-reposteria-ponque/dap-alta-reposteria-ponque-aplicacion-01.webp",
  "/images/products/dap-multiproposito/dap-multiproposito-aplicacion-01.webp",
];

/**
 * Hero de la home. El texto (título y párrafo) viene de `company_content`
 * (`home_hero`) y el eyebrow del slogan de `site_settings`, ambos editables
 * desde el admin. La composición derecha muestra el logo animado de CMC
 * sobre un círculo blanco (decisión de la clienta, 2026-08-19: reemplaza el
 * packshot del primer producto publicado; el círculo pasó de ámbar a blanco
 * y se retiró el anillo naranja).
 *
 * Relevo GIF → vector (2026-08-23): aquí el logo se pinta a ~640 px y el GIF
 * solo tiene 512 px de ancho, así que al congelarse se veía interpolado. La
 * animación sigue siendo el GIF, pero al terminar cede el puesto a
 * `logo-cmc.svg`, cuyo viewBox está recortado al mismo lockup que el frame
 * final. El cambio es seco y simultáneo (`step-end`, ver globals.css): nunca
 * se ven las dos capas superpuestas. Con prefers-reduced-motion el GIF no se
 * monta y solo queda el vector.
 *
 * Nota: `mix-blend-multiply` integra el fondo blanco del GIF al crema;
 * requiere `isolate` en la sección para no mezclarse con capas externas.
 *
 * Fondo (2026-08-20): capa rotativa de 7 fotos del cliente a baja opacidad
 * (`.hero-slides` en globals.css), `-z-10` bajo todo el contenido. El
 * mix-blend-multiply de los logos multiplica por blanco (identidad) en la
 * zona que sobresale del círculo: el fondo se ve igual a través del GIF.
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
      {/* Fondo fotográfico rotativo (2026-08-20): textura a baja opacidad
          DETRÁS de todo el contenido. `-z-10` dentro de la sección `isolate`
          pinta sobre el crema y bajo el grid: círculo blanco, logos y texto
          quedan intactos encima. Decorativo puro (aria-hidden, alt="");
          con prefers-reduced-motion solo se ve la primera foto, estática.
          El `overflow-hidden` de la sección acota el zoom Ken Burns. */}
      <div
        aria-hidden="true"
        className="hero-slides pointer-events-none absolute inset-0 -z-10 select-none"
      >
        {HERO_SLIDES.map((src, index) => (
          <Image
            key={src}
            src={src}
            alt=""
            width={1200}
            height={1200}
            loading={index === 0 ? "eager" : "lazy"}
            fetchPriority="low"
            className="hero-slide absolute inset-0 h-full w-full object-cover"
          />
        ))}
      </div>
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
              visual cae en ≈49/49 % del contenedor → centrar basta). Desde el
              relevo al vector (2026-08-23) la geometría es idéntica con y sin
              reduced-motion, así que ya no hace falta override. */}
          <div
            aria-hidden="true"
            className="absolute left-1/2 top-1/2 h-56 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white sm:h-80 sm:w-80 lg:h-[26rem] lg:w-[26rem]"
          />
          {/* Relevo GIF → vector (2026-08-23). Las dos capas ocupan el mismo
              sitio y se turnan: el GIF manda hasta los 2 s y ahí el vector
              toma el relevo, sin solape (ver `logo-relevo-*` en globals.css).
              El `mix-blend-multiply` va en el contenedor y no en cada imagen,
              para que el crema se multiplique una sola vez. El `aspect` fija
              la caja sin depender del GIF, que con reduced-motion no se
              monta. */}
          <div className="relative z-10 aspect-[512/340] w-full scale-125 mix-blend-multiply">
            {/* Posición medida sobre el frame final del GIF: su tinta ocupa
                19.53–78.32 % en horizontal y arranca al 15 % en vertical del
                lienzo 512×340. El viewBox de logo-cmc.svg está recortado a esa
                misma tinta, así que el relevo no mueve ni un píxel (verificado
                por diferencia de imagen, docs/VERIFICATION_LOG.md). */}
            {/* Eager y sin bajar prioridad: es la capa que QUEDA. Si llegara
                después del relevo, el GIF ya se habría retirado sobre nada. */}
            <Image
              src="/brand/logo-cmc.svg"
              alt="Logotipo de Compañía Mundial de Comercio S.A.S."
              width={608}
              height={579}
              loading="eager"
              className="hero-logo-vector absolute left-[19.53%] top-[15%] w-[58.79%]"
            />
            <Image
              src="/gifsanimados/cmc-logo-entrada-una-vez.gif"
              alt=""
              width={512}
              height={340}
              priority
              className="hero-logo-gif absolute inset-0 h-full w-full motion-reduce:hidden"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
