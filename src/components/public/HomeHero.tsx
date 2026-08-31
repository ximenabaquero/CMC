import Image from "next/image";
import Link from "next/link";
import type { CompanyContent, SiteSettings } from "@/lib/supabase/types";

const FALLBACK_EYEBROW = "Producción y distribución para el sector alimentario";
const FALLBACK_TITLE = "Productos confiables para cada preparación";
const FALLBACK_BODY =
  "Margarinas, mantequillas y aceites para panaderías, pastelerías e industrias que necesitan calidad, consistencia y respaldo en cada proceso.";

/* Escenario del hero (2026-08-30, pedido de la clienta): las fotos de
   APLICACIÓN de los tres productos destacados, turnándose en primer plano.
   Cada una trae la caja y, al lado, lo que sale de ella —ponqués y galletería,
   tortas, hojaldres—, que es exactamente lo que pidió: «que destaque el
   resultado de lo que pueden hacer con sus productos». Están fotografiadas
   sobre blanco puro, así que `mix-blend-multiply` las funde con el disco sin
   recortarlas. El orden es el del podio de destacados. */
const STAGE_PHOTOS = [
  {
    src: "/images/products/dap-alta-reposteria-ponque/dap-alta-reposteria-ponque-aplicacion-01.webp",
    alt: "Caja de margarina DAP Alta Repostería Ponqué junto a ponqués, cupcakes, brazo de reina y galletería recién horneados",
  },
  {
    src: "/images/products/dap-reposteria/dap-reposteria-aplicacion-01.webp",
    alt: "Caja de margarina DAP Repostería entre una bandeja de galletas surtidas y una torta glaseada con almendras",
  },
  {
    src: "/images/products/dap-hojaldre/dap-hojaldre-aplicacion-01.webp",
    alt: "Caja de margarina DAP Hojaldre junto a palmeritas, pasteles y panes hojaldrados sobre rejilla",
  },
];

/* Fondo rotativo del hero (pedido de la clienta, 2026-08-20). Desde el
   2026-08-30 son SOLO escenas de producto terminado, sin una sola caja: las
   fotos de aplicación salieron de aquí porque al ampliarse a pantalla
   completa detrás del titular dejaban un empaque gigante y legible —
   exactamente lo que la clienta descartó— compitiendo con el escenario.
   Tres fotos para que el fondo gire en el MISMO compás de 6s que el
   escenario (18s de ciclo en las dos capas): el hero cambia como una sola
   composición y no como dos relojes sueltos. */
const HERO_SLIDES = [
  "/images/photos/hero-mesa-panaderia-01.webp",
  "/images/photos/composicion-surtido-amasijos-01.webp",
  "/images/photos/canasta-panes-surtidos-01.webp",
];

/**
 * Hero de la home. El texto (título y párrafo) viene de `company_content`
 * (`home_hero`), editable desde el admin.
 *
 * **Rediseño del 2026-08-28 (requerimiento 06)**: el protagonista pasó del
 * logotipo al producto, y el logotipo animado quedó como sello.
 *
 * **Ajuste del 2026-08-30, tras revisión de la clienta.** Dos correcciones
 * suyas sobre esa primera versión:
 *
 * 1. «No me convencen las cajas, sería mejor poner una foto de producto […]
 *    que se vieran panes o torta, que destaque el resultado de lo que pueden
 *    hacer con sus productos». La pila de tres empaques se reemplazó por las
 *    fotos de aplicación, que traen caja **y** resultado. Ella pidió primero
 *    «poner a pasar las fotos» y, si no se podía, un banner fijo: sí se puede,
 *    y el vocabulario de rotación por CSS ya existía en el sitio (fondo del
 *    hero, rotador del blog).
 * 2. «El logo ahí no queda bien, podemos probar poniéndolo al otro lado y un
 *    poquito más grandecito»: el sello pasó de la esquina izquierda a la
 *    derecha y subió de 144 a 176 px.
 *
 * Lo que NO cambia, porque le gustó: el fondo fotográfico rotativo y la
 * entrada escalonada.
 *
 * El eyebrow no lee `site_settings.slogan`: desde que el lema vive en el
 * lockup del header, repetirlo aquí lo duplicaba dentro del mismo viewport.
 *
 * Relevo GIF → vector (2026-08-23, conservado): el GIF de entrada cede el
 * puesto a `logo-cmc.svg` al terminar (`step-end`, ver globals.css), así el
 * frame congelado nunca se ve interpolado. Con prefers-reduced-motion el GIF
 * no se monta y solo queda el vector.
 */
export function HomeHero({
  hero,
  settings,
}: {
  hero?: CompanyContent;
  settings?: SiteSettings | null;
}) {
  const eyebrow = FALLBACK_EYEBROW;
  const title = hero?.title?.trim() || FALLBACK_TITLE;
  const body = hero?.body?.trim() || FALLBACK_BODY;

  return (
    <section className="relative isolate overflow-hidden bg-surface">
      {/* Fondo fotográfico rotativo (2026-08-20): textura a baja opacidad
          DETRÁS de todo el contenido. `-z-10` dentro de la sección `isolate`
          pinta sobre el blanco y bajo el grid. Decorativo puro (aria-hidden,
          alt=""); con prefers-reduced-motion solo se ve la primera foto,
          estática. El `overflow-hidden` de la sección acota el zoom Ken
          Burns. */}
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
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-12 sm:py-16 lg:min-h-[min(84vh,42rem)] lg:grid-cols-[48fr_52fr] lg:gap-12 lg:py-12">
        {/* Columna izquierda: mensaje y acciones */}
        <div>
          <p className="enter text-sm font-semibold uppercase tracking-wider text-orange">
            {eyebrow}
          </p>
          <h1 className="enter enter-lcp enter-2 mt-4 max-w-[16ch] text-balance text-[2.6rem] font-semibold leading-[1.06] text-petrol sm:text-[3.4rem] sm:leading-[1.04] lg:text-[3.75rem]">
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

        {/* Columna derecha: producto y resultado, en primer plano */}
        <div className="enter-visual relative mx-auto w-full max-w-md lg:max-w-none">
          {/* Sello de marca arriba a la DERECHA (pedido de la clienta,
              2026-08-30). A 176 px el GIF se pinta muy por debajo de su tamaño
              nativo (512 px), así que no se interpola, y el relevo al vector lo
              deja nítido en cuanto la animación termina. */}
          <div className="mb-1 flex justify-end">
            <div className="relative z-20 w-40 mix-blend-multiply sm:w-44">
              <div className="relative aspect-[512/340] w-full">
                <Image
                  src="/brand/logo-cmc.svg"
                  alt={`Logotipo de ${settings?.company_name ?? "Compañía Mundial de Comercio S.A.S."}`}
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

          <div className="relative">
            {/* Disco azul suave: escenario de las fotos y la nota de color que
                la clienta pidió traer al hero. Decorativo. */}
            <div
              aria-hidden="true"
              className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-tint-blue sm:h-80 sm:w-80 lg:h-[24rem] lg:w-[24rem]"
            />
            {/* Las fotos se apilan en una sola celda de grid: el alto lo fija
                la más alta y el relevo no desplaza nada. Vocabulario de motion
                en globals.css (`.hero-stage`). */}
            <div className="hero-stage relative z-10 grid mix-blend-multiply">
              {STAGE_PHOTOS.map((photo, index) => (
                <Image
                  key={photo.src}
                  src={photo.src}
                  alt={photo.alt}
                  width={1200}
                  height={1200}
                  priority={index === 0}
                  loading={index === 0 ? "eager" : "lazy"}
                  className="hero-stage-photo col-start-1 row-start-1 h-auto w-full"
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
