import Image from "next/image";
import Link from "next/link";
import { mediaUrl } from "@/lib/media";
import type { ProductWithImage } from "@/lib/content";
import type { CompanyContent, SiteSettings } from "@/lib/supabase/types";

const FALLBACK_EYEBROW = "Producción y distribución para el sector alimentario";
const FALLBACK_TITLE = "Productos confiables para cada preparación";
const FALLBACK_BODY =
  "Margarinas, mantequillas y aceites para panaderías, pastelerías e industrias que necesitan calidad, consistencia y respaldo en cada proceso.";

/**
 * Hero de la home. El texto (título y párrafo) viene de `company_content`
 * (`home_hero`) y el eyebrow del slogan de `site_settings`, ambos editables
 * desde el admin. La composición derecha usa los primeros productos
 * PUBLICADOS con imagen (máx. 3, ya filtrados por la página): si no hay
 * ninguno, se degrada a la composición geométrica sola.
 *
 * Nota: `mix-blend-multiply` integra el fondo blanco de estudio de los
 * packshots al crema; requiere `isolate` en la sección para no mezclarse
 * con capas externas.
 */
export function HomeHero({
  hero,
  settings,
  products = [],
}: {
  hero?: CompanyContent;
  settings?: SiteSettings | null;
  products?: ProductWithImage[];
}) {
  const eyebrow = settings?.slogan?.trim() || FALLBACK_EYEBROW;
  const title = hero?.title?.trim() || FALLBACK_TITLE;
  const body = hero?.body?.trim() || FALLBACK_BODY;

  const [mainProduct, secondProduct, thirdProduct] = products;

  return (
    <section className="relative isolate overflow-hidden border-b border-border bg-hero-cream">
      <div className="mx-auto grid max-w-[80rem] items-center gap-10 px-4 py-12 sm:py-16 lg:min-h-[min(88vh,44rem)] lg:grid-cols-[52fr_48fr] lg:gap-14 lg:py-12">
        {/* Columna izquierda: mensaje y acciones */}
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-orange">{eyebrow}</p>
          <h1 className="mt-4 max-w-[16ch] text-balance text-[2.75rem] font-semibold leading-[1.06] text-petrol sm:text-6xl sm:leading-[1.04] lg:text-[4rem]">
            {title}
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">{body}</p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/productos"
              className="rounded-md bg-primary px-7 py-3.5 text-center text-base font-semibold text-primary-foreground transition hover:bg-primary-hover"
            >
              Conocer nuestros productos
            </Link>
            <Link
              href="/contacto"
              className="rounded-md border-2 border-petrol px-7 py-3.5 text-center text-base font-semibold text-petrol transition hover:bg-petrol hover:text-white"
            >
              Hablar con nosotros
            </Link>
          </div>
        </div>

        {/* Columna derecha: composición con productos reales publicados */}
        <div
          className={`relative mx-auto w-full max-w-md lg:max-w-none ${
            mainProduct ? "" : "hidden lg:block lg:min-h-96"
          }`}
        >
          {/* Círculo ámbar protagonista (decorativo) */}
          <div
            aria-hidden="true"
            className="absolute -top-4 right-2 h-56 w-56 rounded-full bg-amber sm:-top-8 sm:right-0 sm:h-80 sm:w-80 lg:h-[26rem] lg:w-[26rem] lg:-top-10 lg:-right-6"
          />
          {/* Anillo naranja fino (decorativo) */}
          <div
            aria-hidden="true"
            className="absolute -bottom-8 -left-6 h-36 w-36 rounded-full border-2 border-orange/40 lg:h-48 lg:w-48"
          />
          {/* Punto naranja de acento */}
          <span
            aria-hidden="true"
            className="absolute bottom-10 right-2 h-3 w-3 rounded-full bg-orange"
          />

          {mainProduct?.image ? (
            <Image
              src={mediaUrl(mainProduct.image)}
              alt={mainProduct.image.alt_text}
              width={mainProduct.image.width ?? 640}
              height={mainProduct.image.height ?? 640}
              priority
              className="relative z-10 w-full -rotate-2 mix-blend-multiply"
            />
          ) : null}

          {secondProduct?.image ? (
            <div className="absolute bottom-0 z-20 hidden w-44 rotate-3 rounded-lg border border-border bg-white p-2 shadow-lg sm:-left-2 sm:block lg:-left-8 lg:bottom-8 lg:w-52">
              <Image
                src={mediaUrl(secondProduct.image)}
                alt={secondProduct.image.alt_text}
                width={secondProduct.image.width ?? 208}
                height={secondProduct.image.height ?? 208}
                className="w-full"
              />
            </div>
          ) : null}

          {thirdProduct?.image ? (
            <div className="absolute -top-2 right-0 z-20 hidden w-40 -rotate-2 rounded-lg border border-border bg-white p-2 shadow-md lg:block">
              <Image
                src={mediaUrl(thirdProduct.image)}
                alt={thirdProduct.image.alt_text}
                width={thirdProduct.image.width ?? 160}
                height={thirdProduct.image.height ?? 160}
                className="w-full"
              />
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
