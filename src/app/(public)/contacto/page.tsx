import type { Metadata } from "next";
import { getSiteSettings } from "@/lib/content";
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

  const channels = [
    settings?.phone
      ? { label: "Teléfono", value: settings.phone, href: `tel:${settings.phone.replace(/\s+/g, "")}` }
      : null,
    settings?.whatsapp
      ? {
          label: "WhatsApp",
          value: settings.whatsapp,
          href: `https://wa.me/${settings.whatsapp.replace(/\D/g, "")}`,
        }
      : null,
    settings?.email ? { label: "Correo electrónico", value: settings.email, href: `mailto:${settings.email}` } : null,
    settings?.address
      ? {
          label: "Dirección",
          value: [settings.address, settings.city].filter(Boolean).join(", "),
          href: null,
        }
      : null,
    settings?.schedule ? { label: "Horario de atención", value: settings.schedule, href: null } : null,
  ].filter((c): c is { label: string; value: string; href: string | null } => Boolean(c));

  const socialLinks = [
    settings?.facebook_url ? { label: "Facebook", href: settings.facebook_url } : null,
    settings?.instagram_url ? { label: "Instagram", href: settings.instagram_url } : null,
    settings?.linkedin_url ? { label: "LinkedIn", href: settings.linkedin_url } : null,
    settings?.tiktok_url ? { label: "TikTok", href: settings.tiktok_url } : null,
  ].filter((s): s is { label: string; href: string } => Boolean(s));

  return (
    <div className="mx-auto max-w-3xl px-4 py-14">
      <header className="mb-10">
        <p className="mb-1 text-sm font-semibold uppercase tracking-wide text-primary">Contacto</p>
        <h1 className="text-3xl font-semibold sm:text-4xl">Hablemos</h1>
        <p className="mt-3 text-muted-foreground">
          Queremos ser tu aliado. Escríbenos o llámanos por cualquiera de nuestros canales.
        </p>
      </header>

      {unavailable ? (
        <DataUnavailable resource="la información de contacto" />
      ) : channels.length === 0 && socialLinks.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border bg-surface-muted p-10 text-center">
          <p className="font-medium">Canales de contacto en preparación</p>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            Estamos configurando nuestros canales oficiales de atención. Muy pronto encontrarás
            aquí el teléfono, el correo y la dirección de la empresa.
          </p>
        </div>
      ) : (
        <>
          <ul className="grid gap-4 sm:grid-cols-2">
            {channels.map((channel) => (
              <li key={channel.label} className="rounded-lg border border-border bg-surface p-5">
                <h2 className="text-sm font-semibold">{channel.label}</h2>
                {channel.href ? (
                  <a
                    href={channel.href}
                    className="mt-1 block text-secondary underline-offset-2 hover:underline"
                  >
                    {channel.value}
                  </a>
                ) : (
                  <p className="mt-1 text-muted-foreground">{channel.value}</p>
                )}
              </li>
            ))}
          </ul>
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
  );
}
