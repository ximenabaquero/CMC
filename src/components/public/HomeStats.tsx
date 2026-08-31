import type { ProductWithImage } from "@/lib/content";

/**
 * Fecha de fundación de la empresa. No es una cifra inventada ni redondeada:
 * está publicada, literal, en el bloque «¿Quiénes somos?» del CMS —«Desde la
 * fundación de nuestra empresa, el 9 de septiembre de 2019»—. Se guarda aquí
 * como dato y no se parsea de ese texto: el copy es editable y una expresión
 * regular sobre prosa se rompería en la primera reescritura. Si la clienta
 * corrige la fecha en el panel, hay que corregirla también aquí.
 */
const FOUNDED = { year: 2019, month: 9, day: 9 };

/**
 * Años cumplidos desde la fundación. Ojo: la home es estática, así que esto se
 * congela en el build y no cambia solo al llegar el aniversario — se refresca
 * cuando algo revalide la home (cualquier guardado desde el panel lo hace).
 * Un día de desfase una vez al año es aceptable; una cifra escrita a mano que
 * nadie recuerda actualizar, no.
 */
function yearsSinceFounding(now = new Date()): number {
  let years = now.getFullYear() - FOUNDED.year;
  const month = now.getMonth() + 1;
  if (month < FOUNDED.month || (month === FOUNDED.month && now.getDate() < FOUNDED.day)) {
    years -= 1;
  }
  return years;
}

/**
 * Franja de indicadores bajo el hero. Los valores del catálogo se calculan con
 * los datos ya cargados por la home (productos publicados): nunca se escriben
 * cifras fijas. Un indicador con valor bajo (< 3) resta más de lo que suma
 * como cifra de confianza, así que se oculta; si no queda ninguno (o el
 * catálogo no cargó), la franja entera desaparece sin dejar hueco.
 * El layout es flexible: funciona igual con uno o con tres indicadores.
 *
 * Banda azul desde el 2026-08-28 (requerimiento 01): era petróleo y ahora
 * lleva el azul del logotipo, primer golpe de color al salir del hero. Las
 * cifras siguen en ámbar —3.15:1 sobre el azul, suficiente para AA en texto
 * grande (36–48 px semibold) y solo para eso— y las etiquetas suben a
 * `white/90` para no quedarse cortas.
 *
 * **Años de experiencia (2026-08-30).** Con solo dos cifras la banda dejaba
 * vacíos dos tercios de su ancho: mucho color para poco dato. El tercer
 * indicador no es de catálogo sino de trayectoria, que es además el que más
 * pesa para un comprador B2B, y se calcula desde la fecha de fundación
 * publicada — así se actualiza solo y nunca contradice al copy. Va primero por
 * eso mismo. Cuidado al tocarlo: es la única cifra de esta franja que no sale
 * de la base de datos.
 */
export function HomeStats({ products }: { products: ProductWithImage[] | null }) {
  if (!products) return null;

  const categoryCount = new Set(products.filter((p) => p.category).map((p) => p.category!.id)).size;

  const items = [
    { value: yearsSinceFounding(), label: "Años de experiencia" },
    { value: products.length, label: "Productos en catálogo" },
    { value: categoryCount, label: "Categorías de producto" },
  ].filter((item) => item.value >= 3);

  if (items.length === 0) return null;

  return (
    <section aria-label="Indicadores de la empresa" className="bg-secondary">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8 sm:flex-row sm:items-center sm:gap-0">
        {items.map((item, index) => (
          <div
            key={item.label}
            className={`reveal flex items-baseline gap-3 sm:flex-col sm:gap-0 sm:pr-10 ${
              index > 0 ? "sm:border-l sm:border-white/25 sm:pl-10" : ""
            }`}
          >
            <span className="font-display text-4xl font-semibold text-amber sm:text-5xl">
              {item.value}
            </span>
            <span className="text-sm text-white/90">{item.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
