import { SectionHeading } from "@/components/public/shared";

/**
 * Sectores a los que la empresa vende, al cierre de la página de contacto:
 * el visitante se reconoce en la lista y vuelve a los CTA de arriba.
 *
 * Copy entregado por la clienta el 2026-08-20 (solo con ortografía
 * corregida). Es contenido fijo: todavía no existe una sección de
 * `company_content` para editarlo desde el CMS — registrado como pendiente
 * en docs/CONTENT_PENDING.md.
 *
 * Presentación editorial con divisores, como HomePillars, pero sin
 * numeración: son doce sectores sin jerarquía entre sí.
 */
const AUDIENCE_SECTORS = [
  "Industrias panificadoras",
  "Fábricas de alimentos",
  "Empresas panificadoras",
  "Fábricas de helados",
  "Cadenas de panificación",
  "Panaderías",
  "Distribuidores de insumos para el sector panadero",
  "Mayoristas",
  "Supermercados",
  "Industrias de frituras",
  "Industrias de pasabocas",
  "Tiendas hard discount",
];

export function AudienceSectors() {
  return (
    <section className="border-t border-border bg-cream" aria-labelledby="publico-objetivo">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:py-20">
        <SectionHeading
          id="publico-objetivo"
          size="lg"
          eyebrow="A quién servimos"
          title="Para quién producimos"
          description="Abastecemos a negocios que transforman nuestros productos todos los días, desde la panadería de barrio hasta la planta industrial."
        />
        <ul className="grid gap-x-12 sm:grid-cols-2 lg:grid-cols-3">
          {AUDIENCE_SECTORS.map((sector) => (
            <li
              key={sector}
              className="reveal flex items-center gap-3 border-t border-border py-3.5"
            >
              <span
                aria-hidden="true"
                className="h-1.5 w-1.5 shrink-0 rounded-full bg-amber"
              />
              <span className="text-petrol">{sector}</span>
            </li>
          ))}
        </ul>
        <p className="mt-8 max-w-xl text-sm leading-relaxed text-muted-foreground">
          ¿Tu negocio está en esta lista? Escríbenos y armamos juntos el abastecimiento que
          necesitas.
        </p>
      </div>
    </section>
  );
}
