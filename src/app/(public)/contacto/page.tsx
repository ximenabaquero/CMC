import type { Metadata } from "next";
import { getSiteSettings } from "@/lib/content";
import { BakerySideOrnament } from "@/components/public/BakerySideOrnament";
import { ContactMap, mapsSearchHref } from "@/components/public/ContactMap";
import { PhoneIcon, WhatsAppIcon } from "@/components/public/icons";
import { AudienceSectors } from "@/components/public/AudienceSectors";
import { DataUnavailable } from "@/components/public/shared";
import type { SiteSettings } from "@/lib/supabase/types";

export const metadata: Metadata = {
  title: "Contacto",
  description: "Canales de contacto de Compañía Mundial de Comercio S.A.S.",
};

export default async function ContactPage() {
  let settings: SiteSettings | null = null;
  let unavailable = false;
  try {
    settings = await getSiteSettings();
  } catch {
    unavailable = true;
  }

  // Jerarquía de conversión: WhatsApp y teléfono (el objetivo del sitio) van
  // como botones protagonistas; el resto de canales, en lista sobria debajo.
  const whatsappHref = settings?.whatsapp
    ? `https://wa.me/${settings.whatsapp.replace(/\D/g, "")}`
    : null;
  const phoneHref = settings?.phone ? `tel:${settings.phone.replace(/[^+\d]/g, "")}` : null;

  // La dirección enlaza a Google Maps con la misma consulta que alimenta el
  // mapa embebido de abajo (ver ContactMap).
  const fullAddress = settings?.address
    ? [settings.address, settings.city].filter(Boolean).join(", ")
    : null;

  type Channel = { label: string; value: string; href: string | null; external?: boolean };

  const channels: (Channel | null)[] = [
    settings?.email
      ? { label: "Correo electrónico", value: settings.email, href: `mailto:${settings.email}` }
      : null,
    settings?.address && fullAddress
      ? {
          label: "Dirección",
          value: fullAddress,
          href: mapsSearchHref(settings.address, settings.city),
          external: true,
        }
      : null,
    settings?.schedule ? { label: "Horario de atención", value: settings.schedule, href: null } : null,
  ];
  const secondaryChannels = channels.filter((c): c is Channel => Boolean(c));

  const hasChannels = Boolean(whatsappHref || phoneHref) || secondaryChannels.length > 0;

  const socialLinks = [
    settings?.facebook_url ? { label: "Facebook", href: settings.facebook_url } : null,
    settings?.instagram_url ? { label: "Instagram", href: settings.instagram_url } : null,
    settings?.linkedin_url ? { label: "LinkedIn", href: settings.linkedin_url } : null,
    settings?.tiktok_url ? { label: "TikTok", href: settings.tiktok_url } : null,
  ].filter((s): s is { label: string; href: string } => Boolean(s));

  return (
    <>
    {/* Ornamentos de obrador anclados a la zona de canales (decoración por
        sección, pedido de la clienta 2026-08-20): wrapper full-bleed relative
        + overflow-x-clip, requisito del ornamento absoluto. La sección de
        sectores queda fuera para que los ornamentos no la invadan. */}
    <div className="relative overflow-x-clip">
      <BakerySideOrnament />
      <BakerySideOrnament side="derecho" />
      <div className="mx-auto max-w-3xl px-4 py-14">
      <header className="mb-10">
        <p className="mb-1 text-sm font-semibold uppercase tracking-wide text-orange">Contacto</p>
        <h1 className="text-3xl font-semibold text-petrol sm:text-4xl">Hablemos</h1>
        <p className="mt-3 text-muted-foreground">
          Queremos ser tu aliado. Escríbenos o llámanos por cualquiera de nuestros canales.
        </p>
      </header>

      {unavailable ? (
        <DataUnavailable resource="la información de contacto" />
      ) : !hasChannels && socialLinks.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border bg-surface-muted p-10 text-center">
          <p className="font-medium">Canales de contacto en preparación</p>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            Estamos configurando nuestros canales oficiales de atención. Muy pronto encontrarás
            aquí el teléfono, el correo y la dirección de la empresa.
          </p>
        </div>
      ) : (
        <>
          {whatsappHref || phoneHref ? (
            <div className="mb-10 flex flex-col gap-3 sm:flex-row">
              {whatsappHref ? (
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2.5 rounded-md bg-primary px-6 py-3.5 text-base font-semibold text-primary-foreground transition hover:bg-primary-hover ease-out active:scale-[0.98] motion-reduce:active:scale-100"
                >
                  <WhatsAppIcon className="size-5 shrink-0" />
                  Escríbenos por WhatsApp
                </a>
              ) : null}
              {phoneHref ? (
                <a
                  href={phoneHref}
                  // py-3 (no py-3.5) compensa el borde de 2 px para que
                  // apilados en móvil los dos botones midan igual — misma
                  // convención que el CTA outline de ProductDetail.
                  className="flex items-center justify-center gap-2.5 rounded-md border-2 border-petrol px-6 py-3 text-base font-semibold text-petrol transition hover:bg-petrol hover:text-white ease-out active:scale-[0.98] motion-reduce:active:scale-100"
                >
                  <PhoneIcon className="size-5 shrink-0" />
                  Llámanos: {settings?.phone}
                </a>
              ) : null}
            </div>
          ) : null}

          {secondaryChannels.length > 0 ? (
            <ul>
              {secondaryChannels.map((channel) => (
                <li key={channel.label} className="border-t border-border py-4 last:border-b">
                  <h2 className="text-xs font-semibold uppercase tracking-wide text-orange">
                    {channel.label}
                  </h2>
                  {channel.href ? (
                    <a
                      href={channel.href}
                      target={channel.external ? "_blank" : undefined}
                      rel={channel.external ? "noopener noreferrer" : undefined}
                      className="mt-1 block text-foreground underline-offset-4 hover:underline"
                    >
                      {channel.value}
                    </a>
                  ) : (
                    <p className="mt-1 text-muted-foreground">{channel.value}</p>
                  )}
                </li>
              ))}
            </ul>
          ) : null}

          <ContactMap
            address={settings?.address ?? null}
            city={settings?.city ?? null}
            companyName={settings?.company_name ?? "Compañía Mundial de Comercio S.A.S."}
          />

          {socialLinks.length > 0 ? (
            <section aria-labelledby="redes" className="mt-8">
              <h2 id="redes" className="mb-3 text-sm font-semibold">
                Redes sociales
              </h2>
              <ul className="flex flex-wrap gap-3">
                {socialLinks.map((social) => (
                  <li key={social.label}>
                    <a
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-md border border-border px-4 py-2 text-sm font-medium hover:bg-surface-muted"
                    >
                      {social.label}
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </>
      )}
      </div>
    </div>
    <AudienceSectors />
    </>
  );
}
