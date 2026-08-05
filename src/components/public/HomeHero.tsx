import Image from "next/image";
import Link from "next/link";
import type { CompanyContent } from "@/lib/supabase/types";

/* Categorías reales del portafolio; sin cifras ni certificaciones. */
const PRODUCT_CATEGORIES = [
  { label: "Margarinas", dotClass: "bg-primary" },
  { label: "Mantequillas", dotClass: "bg-butter" },
  { label: "Aceites", dotClass: "bg-accent" },
];

const FALLBACK_TITLE = "Productos confiables para cada preparación";
const FALLBACK_BODY =
  "Margarinas, mantequillas y aceites para panaderías, pastelerías e industrias que necesitan calidad, consistencia y respaldo en cada proceso.";

export function HomeHero({ hero }: { hero?: CompanyContent }) {
  const title = hero?.title?.trim() || FALLBACK_TITLE;
  const body = hero?.body?.trim() || FALLBACK_BODY;

  return (
    // overflow-hidden: la decoración con offsets negativos no debe generar scroll horizontal
    <section className="overflow-hidden border-b border-border bg-hero-cream">
      <div className="mx-auto grid max-w-[80rem] items-center gap-10 px-4 py-12 sm:py-16 lg:min-h-[37.5rem] lg:grid-cols-[52fr_48fr] lg:gap-14 lg:py-10">
        {/* Columna izquierda: mensaje y acciones */}
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-green-deep">
            Producción y distribución para el sector alimentario
          </p>
          <h1 className="mt-3 max-w-[17ch] text-[2.5rem] font-semibold leading-[1.1] sm:text-5xl sm:leading-[1.08] lg:text-[3.375rem]">
            {title}
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground">
            {body}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/productos"
              className="rounded-md bg-primary px-6 py-3 text-center text-sm font-medium text-primary-foreground transition hover:bg-primary-hover"
            >
              Conocer nuestros productos
            </Link>
            <Link
              href="/contacto"
              className="rounded-md border border-border bg-surface px-6 py-3 text-center text-sm font-medium transition hover:bg-surface-muted"
            >
              Hablar con nosotros
            </Link>
          </div>
          <ul aria-label="Categorías de productos" className="mt-9 flex flex-wrap gap-2.5">
            {PRODUCT_CATEGORIES.map(({ label, dotClass }) => (
              <li
                key={label}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3.5 py-1.5 text-sm font-medium"
              >
                <span aria-hidden="true" className={`h-2 w-2 rounded-full ${dotClass}`} />
                {label}
              </li>
            ))}
          </ul>
        </div>

        {/* Columna derecha: composición con producto real */}
        <div className="relative mx-auto w-full max-w-md lg:max-w-none">
          {/* Mancha amarillo mantequilla (decorativa) */}
          <div
            aria-hidden="true"
            className="absolute -top-6 right-0 h-44 w-44 rounded-[62%_38%_54%_46%/55%_46%_54%_45%] bg-butter-light sm:-top-8 sm:h-64 sm:w-64"
          />
          {/* Círculo verde tenue (solo escritorio) */}
          <div
            aria-hidden="true"
            className="absolute -bottom-10 -right-10 hidden h-40 w-40 rounded-full bg-primary/10 lg:block"
          />
          {/* Bodegón principal: multiply integra el fondo blanco de estudio al crema */}
          <Image
            src="/images/products/dap-preparado-graso/preparado-graso-con-productos-2.webp"
            alt="DAP Preparado Graso con productos de panadería"
            width={640}
            height={640}
            priority
            className="relative w-full mix-blend-multiply"
          />
          {/* Packshot enmarcado en tarjeta blanca (oculto en móvil: menos decoración) */}
          <div className="absolute bottom-2 z-10 hidden w-44 -rotate-3 rounded-lg border border-border bg-white p-2 shadow-lg sm:-left-2 sm:block lg:-left-6 lg:bottom-6 lg:w-52">
            <Image
              src="/images/products/dap-hojaldre/caja-dap-hojaldre.webp"
              alt="Caja de Margarina DAP Hojaldre"
              width={208}
              height={208}
              className="w-full"
            />
          </div>
          {/* Punto rojo de acento */}
          <span
            aria-hidden="true"
            className="absolute bottom-8 right-4 h-2.5 w-2.5 rounded-full bg-accent"
          />
        </div>
      </div>
    </section>
  );
}
