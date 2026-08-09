import Link from "next/link";
import type { SiteSettings } from "@/lib/supabase/types";

/**
 * Banda comercial final antes del footer. Los canales de contacto salen de
 * `site_settings` (editable en /admin/contacto) y solo se muestran los que
 * estén configurados; sin ninguno, el bloque se centra sin columna vacía.
 */
export function HomeCta({ settings }: { settings: SiteSettings | null }) {
  const channels = [
    settings?.phone
      ? {
          label: "Teléfono",
          value: settings.phone,
          href: `tel:${settings.phone.replace(/[^+\d]/g, "")}`,
          external: false,
        }
      : null,
    settings?.whatsapp
      ? {
          label: "WhatsApp",
          value: settings.whatsapp,
          href: `https://wa.me/${settings.whatsapp.replace(/\D/g, "")}`,
          external: true,
        }
      : null,
    settings?.email
      ? {
          label: "Correo",
          value: settings.email,
          href: `mailto:${settings.email}`,
          external: false,
        }
      : null,
  ].filter((c): c is NonNullable<typeof c> => Boolean(c));

  const hasChannels = channels.length > 0;

  return (
    <section
      aria-labelledby="cta-contacto"
      className="relative isolate overflow-hidden bg-petrol-deep"
    >
      {/* Círculo ámbar recortado (decorativo) */}
      <div
        aria-hidden="true"
        className="absolute -right-24 -top-24 -z-10 h-72 w-72 rounded-full bg-amber/15"
      />
      <div
        className={`mx-auto max-w-6xl px-4 py-16 sm:py-20 ${
          hasChannels ? "grid gap-12 lg:grid-cols-[3fr_2fr] lg:items-center" : ""
        }`}
      >
        <div className={hasChannels ? "" : "mx-auto max-w-2xl text-center"}>
          <h2
            id="cta-contacto"
            className="text-balance text-3xl font-semibold text-white sm:text-4xl lg:text-5xl"
          >
            ¿Hablamos de tu negocio?
          </h2>
          <p className={`mt-4 text-lg text-white/90 ${hasChannels ? "max-w-xl" : ""}`}>
            Cuéntanos qué necesitas y te acompañamos con productos y procesos consistentes,
            ágiles y confiables.
          </p>
          <Link
            href="/contacto"
            className="mt-8 inline-block rounded-md bg-amber px-8 py-4 text-base font-semibold text-petrol-deep transition hover:bg-amber-hover"
          >
            Ir a contacto
          </Link>
        </div>

        {hasChannels ? (
          <ul>
            {channels.map((channel) => (
              <li key={channel.label} className="border-t border-white/15 py-3.5 last:border-b">
                <a
                  href={channel.href}
                  {...(channel.external
                    ? { target: "_blank", rel: "noopener noreferrer" }
                    : {})}
                  className="group block"
                >
                  <span className="block text-xs font-semibold uppercase tracking-wide text-amber">
                    {channel.label}
                  </span>
                  <span className="mt-0.5 block text-white underline-offset-4 group-hover:underline">
                    {channel.value}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </section>
  );
}
