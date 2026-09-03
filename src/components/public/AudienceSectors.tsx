import { SectionHeading } from "@/components/public/shared";
import { WhatsAppIcon } from "@/components/public/icons";

/**
 * Sectores a los que la empresa vende, al cierre de la página de contacto:
 * el visitante se reconoce en la lista y vuelve a los CTA de arriba.
 *
 * Los doce nombres son copy entregado por la clienta el 2026-08-20 (solo con
 * ortografía corregida) y se publican **literales**. Es contenido fijo:
 * todavía no existe una sección de `company_content` para editarlo desde el
 * CMS — registrado como pendiente en docs/CONTENT_PENDING.md.
 *
 * **Agrupación en tres familias (2026-09-03).** La lista plana de doce ítems
 * repartidos en tres columnas no comunicaba nada con la columna: el corte caía
 * donde lo dejaba el orden de entrega, y cuatro nombres muy parecidos
 * («Industrias panificadoras», «Empresas panificadoras», «Cadenas de
 * panificación», «Panaderías») quedaban desperdigados. Ahora cada columna es
 * una familia de cliente —planta industrial, oficio panadero y canal de
 * distribución—, así que el visitante encuentra su caso mirando un tercio de
 * la lista y no los doce. Los rótulos de grupo son lo **único** que no viene
 * de la clienta: son organizadores, no copy comercial, y revertirlos es
 * aplanar `SECTOR_GROUPS` en un solo arreglo.
 *
 * Presentación editorial con divisores, como HomePillars, pero sin
 * numeración: son doce sectores sin jerarquía entre sí.
 */
const SECTOR_GROUPS = [
  {
    label: "Industria",
    sectors: [
      "Industrias panificadoras",
      "Fábricas de alimentos",
      "Fábricas de helados",
      "Industrias de frituras",
      "Industrias de pasabocas",
    ],
  },
  {
    label: "Panadería y pastelería",
    sectors: ["Empresas panificadoras", "Cadenas de panificación", "Panaderías"],
  },
  {
    label: "Distribución y punto de venta",
    sectors: [
      "Distribuidores de insumos para el sector panadero",
      "Mayoristas",
      "Supermercados",
      "Tiendas hard discount",
    ],
  },
];

export function AudienceSectors({ whatsappHref }: { whatsappHref?: string | null }) {
  return (
    <section className="border-t border-border bg-surface-muted" aria-labelledby="publico-objetivo">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:py-20">
        {/* Una sola rejilla de tres columnas gobierna la sección: encabezado
            (2 columnas) + salida (1 columna) arriba, y los tres grupos abajo.
            El encabezado ocupaba antes el tercio izquierdo y dejaba un vacío
            ancho arriba a la derecha; ese hueco lo llena ahora la acción, y al
            caer en la misma columna que el tercer grupo queda alineada con él
            en vez de flotar. La página de contacto solo tenía botones en la
            cabecera: quien se reconoce en la lista ya no necesita volver a
            subir, y la sección deja de cerrar en una nota gris al pie.

            `order-last` en móvil manda la acción **después** de la lista: al
            apilarse, «¿Tu negocio está en esta lista?» leído antes de la lista
            señalaba a algo que todavía no había aparecido. */}
        <div className="grid gap-x-12 gap-y-10 lg:grid-cols-3">
          <div className="lg:col-span-2 lg:row-start-1">
            <SectionHeading
              id="publico-objetivo"
              size="lg"
              eyebrow="A quién servimos"
              title="Para quién producimos"
              description="Abastecemos a negocios que transforman nuestros productos todos los días, desde la panadería de barrio hasta la planta industrial."
            />
          </div>

          <div className="order-last lg:order-none lg:col-start-3 lg:row-start-1 lg:mb-8 lg:self-end">
            <p className="text-lg font-medium leading-snug text-petrol">
              ¿Tu negocio está en esta lista?
            </p>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Escríbenos y armamos juntos el abastecimiento que necesitas.
            </p>
            {whatsappHref ? (
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-flex items-center justify-center gap-2.5 rounded-md border-2 border-petrol px-6 py-3 text-sm font-semibold text-petrol transition hover:bg-petrol hover:text-white ease-out active:scale-[0.98] motion-reduce:active:scale-100"
              >
                <WhatsAppIcon className="size-5 shrink-0" />
                Escríbenos por WhatsApp
              </a>
            ) : null}
          </div>

          {/* Una columna por familia. El filete grueso de petróleo sobre el
              rótulo alinea los tres arranques en una misma línea y cierra el
              bloque por arriba; las columnas terminan a distinta altura a
              propósito (5, 3 y 4 sectores), que es lo que las hace leerse como
              grupos y no como una tabla de cuatro filas. */}
          <div className="grid gap-x-12 gap-y-10 sm:grid-cols-2 lg:col-span-3 lg:row-start-2 lg:grid-cols-3">
            {SECTOR_GROUPS.map((group) => (
              <div key={group.label} className="reveal">
                <h3 className="border-t-2 border-petrol pt-3 text-sm font-semibold uppercase tracking-wide text-petrol">
                  {group.label}
                </h3>
                <ul className="mt-2">
                  {group.sectors.map((sector) => (
                    <li
                      key={sector}
                      className="flex gap-3 border-t border-border py-3.5 first:border-t-0"
                    >
                      {/* mt calculado para centrar el punto en la primera línea
                          (line-height 1.5rem, punto de 0.375rem): los ítems que
                          ocupan dos líneas mantienen el marcador arriba. */}
                      <span
                        aria-hidden="true"
                        className="mt-[0.5625rem] h-1.5 w-1.5 shrink-0 rounded-full bg-amber"
                      />
                      <span className="text-petrol">{sector}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
