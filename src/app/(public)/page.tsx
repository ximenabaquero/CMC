import Image from "next/image";
import Link from "next/link";
import {
  extractPillars,
  getPublishedBrands,
  getPublishedFaqs,
  getPublishedPosts,
  getPublishedProducts,
  getPublishedSections,
  getSiteSettings,
} from "@/lib/content";
import { BrandsMarquee } from "@/components/public/BrandsMarquee";
import { HomeHero } from "@/components/public/HomeHero";
import { HomeStats } from "@/components/public/HomeStats";
import { HomePillars } from "@/components/public/HomePillars";
import { HomeProductCard } from "@/components/public/HomeProductCard";
import { HomePostsSection } from "@/components/public/HomePostsSection";
import { HomeCta } from "@/components/public/HomeCta";
import {
  CatalogInPreparation,
  DataUnavailable,
  FaqList,
  SectionHeading,
} from "@/components/public/shared";

export default async function HomePage() {
  const [
    sectionsResult,
    productsResult,
    postsResult,
    faqsResult,
    brandsResult,
    settingsResult,
  ] = await Promise.allSettled([
    getPublishedSections(),
    getPublishedProducts(),
    getPublishedPosts(),
    getPublishedFaqs(),
    getPublishedBrands(),
    getSiteSettings(),
  ]);

  const sections = sectionsResult.status === "fulfilled" ? sectionsResult.value : null;
  const products = productsResult.status === "fulfilled" ? productsResult.value : null;
  const posts = postsResult.status === "fulfilled" ? postsResult.value : null;
  const faqs = faqsResult.status === "fulfilled" ? faqsResult.value : null;
  // La sección de marcas es opcional: si falla o está vacía, se oculta.
  const brands = brandsResult.status === "fulfilled" ? brandsResult.value : [];
  // Settings alimenta eyebrow del hero y canales del CTA; sin él se degradan.
  const settings = settingsResult.status === "fulfilled" ? settingsResult.value : null;

  const hero = sections?.home_hero;
  const intro = sections?.home_intro;
  const pillarsSection = sections?.pillars;
  const valueProposition = sections?.value_proposition;
  const pillars = extractPillars(pillarsSection);
  const featuredFaqs = (faqs ?? []).filter((f) => f.featured).slice(0, 3);
  const introParagraphs = intro?.body ? intro.body.split(/\n\n+/) : [];

  return (
    <>
      {/* Hero corporativo con el logo animado de CMC */}
      <HomeHero hero={hero} settings={settings} />

      {/* Indicadores calculados del catálogo */}
      <HomeStats products={products} />

      {/* Presentación editorial: ¿quiénes somos? */}
      {intro ? (
        <section className="mx-auto max-w-6xl px-4 py-16 sm:py-20" aria-labelledby="quienes-somos">
          <div className="grid gap-8 lg:grid-cols-[2fr_3fr] lg:gap-14">
            <div>
              <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-orange">
                Nuestra empresa
              </p>
              <h2
                id="quienes-somos"
                className="text-balance text-3xl font-semibold text-petrol sm:text-4xl"
              >
                {intro.title ?? "¿Quiénes somos?"}
              </h2>
            </div>
            <div>
              {introParagraphs.map((paragraph, index) =>
                index === 0 ? (
                  <p
                    key={index}
                    className="text-xl font-medium leading-snug text-petrol sm:text-2xl"
                  >
                    {paragraph}
                  </p>
                ) : (
                  <p key={index} className="mt-4 text-muted-foreground">
                    {paragraph}
                  </p>
                )
              )}
              <Link
                href="/nosotros"
                className="mt-6 inline-block font-semibold text-primary underline-offset-4 hover:underline"
              >
                Conoce más sobre nosotros <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </section>
      ) : null}

      {/* Marcas que manejamos (solo si hay marcas publicadas con logo) */}
      {brands.length > 0 ? (
        <section className="border-t border-border bg-surface" aria-labelledby="marcas">
          <div className="mx-auto max-w-6xl px-4 py-14">
            <SectionHeading id="marcas" tone="warm" eyebrow="Confianza" title="Marcas que manejamos" />
            <BrandsMarquee brands={brands} />
          </div>
        </section>
      ) : null}

      {/* Pilares en presentación editorial */}
      <HomePillars section={pillarsSection} pillars={pillars} />

      {/* Vista previa del catálogo */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:py-20" aria-labelledby="catalogo">
        <div className="flex items-center justify-between gap-10">
          <SectionHeading
            id="catalogo"
            size="lg"
            tone="warm"
            eyebrow="Catálogo"
            title="Nuestros productos"
            description="Margarinas, mantequillas y aceites para panadería, repostería e industria."
          />
          {/* Logo DAP animado junto al encabezado (pedido de la clienta,
              2026-08-19). Entra una sola vez y queda fijo; estático con
              prefers-reduced-motion y oculto en móvil, mismo patrón que el
              hero. `mix-blend-multiply` integra el fondo del GIF/PNG al crema. */}
          <div className="mb-8 hidden shrink-0 lg:block">
            <Image
              src="/gifsanimados/dap-margarinas-entrada-una-vez.gif"
              alt="Logotipo animado de DAP Margarinas"
              width={512}
              height={512}
              className="w-64 mix-blend-multiply motion-reduce:hidden"
            />
            <Image
              src="/brand/dap-margarinas-azul.png"
              alt="Logotipo de DAP Margarinas"
              width={1536}
              height={1024}
              className="hidden w-64 mix-blend-multiply motion-reduce:block"
            />
          </div>
        </div>
        {products === null ? (
          <DataUnavailable resource="el catálogo" />
        ) : products.length === 0 ? (
          <CatalogInPreparation />
        ) : (
          <>
            <ul className="grid gap-6 sm:grid-cols-2">
              {products.slice(0, 4).map((product) => (
                <li key={product.id} className="reveal">
                  <HomeProductCard product={product} />
                </li>
              ))}
            </ul>
            <div className="mt-8">
              <Link
                href="/productos"
                className="inline-block rounded-md border-2 border-petrol px-6 py-3 text-sm font-semibold text-petrol transition hover:bg-petrol hover:text-white ease-out active:scale-[0.98] motion-reduce:active:scale-100"
              >
                Ver catálogo
              </Link>
            </div>
          </>
        )}
      </section>

      {/* Propuesta de valor */}
      {valueProposition ? (
        <section className="border-y border-border bg-cream-deep" aria-labelledby="propuesta">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:py-20">
            <div className="max-w-3xl">
              <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-orange">
                Propuesta de valor
              </p>
              <h2
                id="propuesta"
                className="text-balance text-3xl font-semibold text-petrol sm:text-4xl"
              >
                {valueProposition.title ?? "Nuestra promesa"}
              </h2>
              {valueProposition.body ? (
                <div className="mt-6 space-y-4">
                  {valueProposition.body.split(/\n\n+/).map((paragraph, index) =>
                    index === 0 ? (
                      <p
                        key={index}
                        className="text-xl font-medium leading-snug text-petrol sm:text-2xl"
                      >
                        {paragraph}
                      </p>
                    ) : (
                      <p key={index} className="text-muted-foreground">
                        {paragraph}
                      </p>
                    )
                  )}
                </div>
              ) : null}
            </div>
          </div>
        </section>
      ) : null}

      {/* Vista previa del blog */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:py-20" aria-labelledby="blog">
        <SectionHeading
          id="blog"
          size="lg"
          tone="warm"
          eyebrow="Blog"
          title="Últimos artículos"
          description="Consejos y contenido sobre panadería, repostería y nuestros productos."
        />
        {posts === null ? (
          <DataUnavailable resource="los artículos" />
        ) : posts.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border bg-surface-muted p-8 text-center text-sm text-muted-foreground">
            Muy pronto publicaremos nuestros primeros artículos.
          </p>
        ) : (
          <>
            <HomePostsSection posts={posts.slice(0, 3)} />
            <div className="mt-8">
              <Link
                href="/blog"
                className="font-semibold text-primary underline-offset-4 hover:underline"
              >
                Ver todos los artículos <span aria-hidden="true">→</span>
              </Link>
            </div>
          </>
        )}
      </section>

      {/* Preguntas frecuentes destacadas */}
      {featuredFaqs.length > 0 ? (
        <section className="border-t border-border bg-cream" aria-labelledby="faqs">
          <div className="mx-auto max-w-3xl px-4 py-16 sm:py-20">
            <SectionHeading
              id="faqs"
              tone="warm"
              eyebrow="Preguntas frecuentes"
              title="Resolvemos tus dudas"
            />
            <FaqList faqs={featuredFaqs} />
            <div className="mt-6">
              <Link
                href="/preguntas-frecuentes"
                className="font-semibold text-primary underline-offset-4 hover:underline"
              >
                Ver todas las preguntas <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </section>
      ) : null}

      {/* Llamado a contacto */}
      <HomeCta settings={settings} />
    </>
  );
}
