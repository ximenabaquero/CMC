import Image from "next/image";
import Link from "next/link";
import { mediaUrl } from "@/lib/media";
import type { ProductWithImage } from "@/lib/content";
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

/* Geometría de la pila de empaques. El del centro va delante y más grande
   (es el producto n.º 1 del orden destacado); los laterales entran girados
   y un poco más abajo, con solape negativo, para que se lea como una
   composición y no como tres tarjetas. Si solo hay uno o dos productos
   publicados con foto, se usan las primeras entradas y la pila se centra
   sola: no hay hueco reservado. */
const STACK = [
  { width: "w-[40%]", offset: "-mr-[6%] translate-y-5", angle: "-rotate-6", z: "z-10" },
  { width: "w-[54%]", offset: "", angle: "rotate-0", z: "z-20" },
  { width: "w-[40%]", offset: "-ml-[6%] translate-y-5", angle: "rotate-6", z: "z-10" },
];

/**
 * Hero de la home. El texto (título y párrafo) viene de `company_content`
 * (`home_hero`), editable desde el admin.
 *
 * **Rediseño del 2026-08-28 (requerimiento 06).** El protagonista pasa de ser
 * el logotipo a ser el producto: la columna derecha monta los empaques de los
 * tres productos destacados en primer plano sobre un disco azul suave, y el
 * logotipo animado queda como sello pequeño en la esquina. El razonamiento de
 * la clienta es directo: el logo ya se muestra grande en el header, y el hero
 * debe contestar «qué vende CMC», no «cómo se llama». Lo que NO cambia,
 * porque le gustó: el fondo fotográfico rotativo y la animación de entrada.
 *
 * El eyebrow dejó de leer el lema (`site_settings.slogan`): desde que el lema
 * vive en el lockup del header, repetirlo aquí lo duplicaba dentro del mismo
 * viewport. Ahora es un descriptor fijo de categoría, que es lo que pide la
 * Eyebrow Rule de DESIGN.md.
 *
 * Los empaques van con `mix-blend-multiply`: se fotografiaron sobre blanco
 * puro, así que multiplicar los funde con el disco y con el fondo sin
 * recortarlos. Requiere `isolate` en la sección para no mezclarse con capas
 * externas.
 *
 * Relevo GIF → vector (2026-08-23, conservado): el GIF de entrada cede el
 * puesto a `logo-cmc.svg` al terminar (`step-end`, ver globals.css), así el
 * frame congelado nunca se ve interpolado. Con prefers-reduced-motion el GIF
 * no se monta y solo queda el vector.
 */
export function HomeHero({
  hero,
  settings,
  products,
}: {
  hero?: CompanyContent;
  settings?: SiteSettings | null;
  products?: ProductWithImage[] | null;
}) {
  const eyebrow = FALLBACK_EYEBROW;
  const title = hero?.title?.trim() || FALLBACK_TITLE;
  const body = hero?.body?.trim() || FALLBACK_BODY;
  // Solo productos con imagen: un hueco gris en la pila comunicaría descuido.
  const showcase = (products ?? []).filter((product) => product.image).slice(0, 3);
  // El del medio es el destacado n.º 1; con tres productos el orden de pintado
  // es [2.º, 1.º, 3.º] para que el principal quede al centro y delante.
  const stackOrder =
    showcase.length === 3 ? [showcase[1], showcase[0], showcase[2]] : showcase;

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

        {/* Columna derecha: los empaques en primer plano */}
        <div className="enter-visual relative mx-auto w-full max-w-md lg:max-w-none">
          {stackOrder.length > 0 ? (
            <>
              {/* Sello de marca: el logotipo conserva su entrada animada pero
                  pequeño y arriba, fuera de la pila. Al pintarse a ~160 px
                  —una cuarta parte de antes— el GIF ya no se ve interpolado,
                  que era la queja de la clienta, y el relevo al vector lo deja
                  nítido en cuanto termina. */}
              <div className="relative z-20 mb-2 w-36 mix-blend-multiply sm:w-40">
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

              <div className="relative">
                {/* Disco azul suave: escenario de los empaques y la nota de
                    color que la clienta pidió traer al hero. Decorativo. */}
                <div
                  aria-hidden="true"
                  className="absolute left-1/2 top-1/2 h-60 w-60 -translate-x-1/2 -translate-y-1/2 rounded-full bg-tint-blue sm:h-72 sm:w-72 lg:h-[23rem] lg:w-[23rem]"
                />
                {/* La pila desborda su caja un ~26 % por diseño (los laterales
                    salen del disco). En móvil ese desborde llegaba al filo de
                    la pantalla y rebanaba las cajas, así que la caja se
                    encoge en pantallas angostas y el desborde cabe entero. */}
                <div className="relative z-10 mx-auto flex w-[78%] items-end justify-center mix-blend-multiply sm:w-[92%] lg:w-full">
                  {stackOrder.map((product, index) => {
                    const shape = STACK[stackOrder.length === 3 ? index : index + 1] ?? STACK[1];
                    return (
                      <Image
                        key={product.id}
                        src={mediaUrl(product.image!)}
                        alt={product.image!.alt_text}
                        width={product.image!.width ?? 1200}
                        height={product.image!.height ?? 1200}
                        priority={index === Math.floor(stackOrder.length / 2)}
                        className={`${shape.width} ${shape.offset} ${shape.angle} ${shape.z} h-auto`}
                      />
                    );
                  })}
                </div>
              </div>
            </>
          ) : (
            // Sin catálogo publicado el hero no se queda vacío: el lockup
            // vectorial vuelve al centro, como antes del rediseño.
            <div className="relative z-10 mx-auto w-2/3">
              <Image
                src="/brand/logo-cmc.svg"
                alt="Logotipo de Compañía Mundial de Comercio S.A.S."
                width={608}
                height={579}
                priority
                className="w-full"
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
