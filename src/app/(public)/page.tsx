import Link from "next/link";
import Image from "next/image";
import {
  extractPillars,
  getPublishedFaqs,
  getPublishedPosts,
  getPublishedProducts,
  getPublishedSections,
} from "@/lib/content";
import {
  CatalogInPreparation,
  DataUnavailable,
  FaqList,
  PostCard,
  ProductCard,
  SectionHeading,
} from "@/components/public/shared";

export default async function HomePage() {
  const [sectionsResult, productsResult, postsResult, faqsResult] = await Promise.allSettled([
    getPublishedSections(),
    getPublishedProducts(),
    getPublishedPosts(),
    getPublishedFaqs(),
  ]);

  const sections = sectionsResult.status === "fulfilled" ? sectionsResult.value : null;
  const products = productsResult.status === "fulfilled" ? productsResult.value : null;
  const posts = postsResult.status === "fulfilled" ? postsResult.value : null;
  const faqs = faqsResult.status === "fulfilled" ? faqsResult.value : null;

  const hero = sections?.home_hero;
  const intro = sections?.home_intro;
  const pillarsSection = sections?.pillars;
  const valueProposition = sections?.value_proposition;
  const pillars = extractPillars(pillarsSection);
  const featuredFaqs = (faqs ?? []).filter((f) => f.featured).slice(0, 3);

  return (
    <>
      {/* Hero corporativo */}
      <section className="border-b border-border bg-surface">
        <div className="mx-auto grid max-w-6xl items-center gap-8 px-4 py-14 sm:py-20 lg:grid-cols-[3fr_2fr]">
          <div>
            <h1 className="text-3xl font-semibold leading-tight sm:text-4xl lg:text-5xl">
              {hero?.title ?? "Margarinas, mantequillas y aceites con el respaldo de la experiencia"}
            </h1>
            {hero?.body ? (
              <p className="mt-4 max-w-xl text-lg text-muted-foreground">{hero.body}</p>
            ) : null}
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/productos"
                className="rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition hover:bg-primary-hover"
              >
                Conoce nuestros productos
              </Link>
              <Link
                href="/nosotros"
                className="rounded-md border border-border px-5 py-2.5 text-sm font-medium transition hover:bg-surface-muted"
              >
                Sobre nosotros
              </Link>
            </div>
          </div>
          <div className="hidden justify-center lg:flex">
            <Image
              src="/brand/logo-cmc-png.png"
              alt=""
              width={420}
              height={236}
              priority
              className="w-full max-w-sm"
            />
          </div>
        </div>
      </section>

      {/* Presentación breve */}
      {intro ? (
        <section className="mx-auto max-w-6xl px-4 py-14" aria-labelledby="quienes-somos">
          <div className="max-w-3xl">
            <h2 id="quienes-somos" className="text-2xl font-semibold sm:text-3xl">
              {intro.title ?? "¿Quiénes somos?"}
            </h2>
            {intro.body ? <p className="mt-3 text-muted-foreground">{intro.body}</p> : null}
            <Link
              href="/nosotros"
              className="mt-4 inline-block text-sm font-medium text-secondary underline-offset-2 hover:underline"
            >
              Conoce más sobre nosotros →
            </Link>
          </div>
        </section>
      ) : null}

      {/* Pilares */}
      {pillars.length > 0 ? (
        <section className="border-y border-border bg-surface-muted" aria-labelledby="pilares">
          <div className="mx-auto max-w-6xl px-4 py-14">
            <SectionHeading
              eyebrow="Nuestros pilares"
              title={pillarsSection?.title ?? "Nuestros pilares"}
              description={pillarsSection?.body}
            />
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {pillars.map((pillar) => (
                <li key={pillar.title} className="rounded-lg border border-border bg-surface p-5">
                  <h3 className="font-semibold">{pillar.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{pillar.description}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      {/* Vista previa del catálogo */}
      <section className="mx-auto max-w-6xl px-4 py-14" aria-labelledby="catalogo">
        <SectionHeading
          eyebrow="Catálogo"
          title="Nuestros productos"
          description="Margarinas, mantequillas y aceites para panadería, repostería e industria."
        />
        {products === null ? (
          <DataUnavailable resource="el catálogo" />
        ) : products.length === 0 ? (
          <CatalogInPreparation />
        ) : (
          <>
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {products.slice(0, 4).map((product) => (
                <li key={product.id}>
                  <ProductCard product={product} />
                </li>
              ))}
            </ul>
            <div className="mt-6">
              <Link
                href="/productos"
                className="text-sm font-medium text-secondary underline-offset-2 hover:underline"
              >
                Ver todo el catálogo →
              </Link>
            </div>
          </>
        )}
      </section>

      {/* Propuesta de valor */}
      {valueProposition ? (
        <section className="border-y border-border bg-primary/5" aria-labelledby="propuesta">
          <div className="mx-auto max-w-6xl px-4 py-14">
            <div className="max-w-3xl">
              <h2 id="propuesta" className="text-2xl font-semibold sm:text-3xl">
                {valueProposition.title ?? "Nuestra promesa"}
              </h2>
              {valueProposition.body ? (
                <div className="mt-3 space-y-3 text-muted-foreground">
                  {valueProposition.body.split(/\n\n+/).map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </section>
      ) : null}

      {/* Vista previa del blog */}
      <section className="mx-auto max-w-6xl px-4 py-14" aria-labelledby="blog">
        <SectionHeading
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
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {posts.slice(0, 3).map((post) => (
                <li key={post.id}>
                  <PostCard post={post} />
                </li>
              ))}
            </ul>
            <div className="mt-6">
              <Link
                href="/blog"
                className="text-sm font-medium text-secondary underline-offset-2 hover:underline"
              >
                Ver todos los artículos →
              </Link>
            </div>
          </>
        )}
      </section>

      {/* Preguntas frecuentes destacadas */}
      {featuredFaqs.length > 0 ? (
        <section className="border-t border-border bg-surface-muted" aria-labelledby="faqs">
          <div className="mx-auto max-w-3xl px-4 py-14">
            <SectionHeading
              eyebrow="Preguntas frecuentes"
              title="Resolvemos tus dudas"
            />
            <FaqList faqs={featuredFaqs} />
            <div className="mt-6">
              <Link
                href="/preguntas-frecuentes"
                className="text-sm font-medium text-secondary underline-offset-2 hover:underline"
              >
                Ver todas las preguntas →
              </Link>
            </div>
          </div>
        </section>
      ) : null}

      {/* Llamado a contacto */}
      <section className="border-t border-border bg-surface" aria-labelledby="cta-contacto">
        <div className="mx-auto max-w-6xl px-4 py-14 text-center">
          <h2 id="cta-contacto" className="text-2xl font-semibold sm:text-3xl">
            ¿Hablamos de tu negocio?
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-muted-foreground">
            Cuéntanos qué necesitas y te acompañamos con productos y procesos consistentes, ágiles
            y confiables.
          </p>
          <Link
            href="/contacto"
            className="mt-6 inline-block rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition hover:bg-primary-hover"
          >
            Ir a contacto
          </Link>
        </div>
      </section>
    </>
  );
}
