import Link from "next/link";
import Image from "next/image";
import { getSiteSettings } from "@/lib/content";
import { DesktopNav, MobileNav } from "@/components/public/MobileNav";
import { BakerySideOrnament } from "@/components/public/BakerySideOrnament";
import { NAV_ITEMS } from "@/lib/nav";
import type { SiteSettings } from "@/lib/supabase/types";

const FALLBACK_NAME = "Compañía Mundial de Comercio S.A.S.";

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  // Si la base de datos no responde, el sitio sigue funcionando con
  // los datos mínimos (los canales de contacto simplemente se ocultan).
  let settings: SiteSettings | null = null;
  try {
    settings = await getSiteSettings();
  } catch {
    settings = null;
  }

  const companyName = settings?.company_name ?? FALLBACK_NAME;

  const contactChannels = [
    settings?.phone ? { label: "Teléfono", value: settings.phone } : null,
    settings?.email ? { label: "Correo", value: settings.email } : null,
    settings?.address
      ? { label: "Dirección", value: [settings.address, settings.city].filter(Boolean).join(", ") }
      : null,
    settings?.schedule ? { label: "Horario", value: settings.schedule } : null,
  ].filter((c): c is { label: string; value: string } => Boolean(c));

  const socialLinks = [
    settings?.facebook_url ? { label: "Facebook", href: settings.facebook_url } : null,
    settings?.instagram_url ? { label: "Instagram", href: settings.instagram_url } : null,
    settings?.linkedin_url ? { label: "LinkedIn", href: settings.linkedin_url } : null,
    settings?.tiktok_url ? { label: "TikTok", href: settings.tiktok_url } : null,
  ].filter((s): s is { label: string; href: string } => Boolean(s));

  return (
    // `public-site` activa la tipografía display (Fraunces) solo en el
    // sitio público; el panel admin conserva Geist (ver globals.css).
    <div className="public-site flex min-h-screen flex-col">
      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:rounded-md focus:bg-surface focus:px-3 focus:py-2 focus:text-sm"
      >
        Saltar al contenido
      </a>

      {/* Ornamentos de obrador dibujados a mano, fijos en ambos márgenes
          (solo desktop). Decorativos puros: no afectan layout ni interacción. */}
      <BakerySideOrnament />
      <BakerySideOrnament side="derecho" />

      <header className="sticky top-0 z-40 border-b border-border bg-cream/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <Link href="/" className="flex items-center gap-2" aria-label={`${companyName} — Inicio`}>
            {/* Logo animado: entra una sola vez y queda fijo (el loop continuo
                dejaba el logo "en blanco" en cada reinicio); estático con
                prefers-reduced-motion. */}
            <Image
              src="/gifsanimados/cmc-logo-entrada-una-vez.gif"
              alt={`Logotipo de ${companyName}`}
              width={512}
              height={340}
              priority
              className="h-11 w-auto motion-reduce:hidden"
            />
            <Image
              src="/brand/logo-cmc-png-copia-1.png"
              alt={`Logotipo de ${companyName}`}
              width={72}
              height={48}
              className="hidden h-11 w-auto motion-reduce:block"
            />
            <span className="hidden text-sm font-semibold leading-tight text-petrol sm:block">
              Compañía Mundial
              <br />
              de Comercio S.A.S.
            </span>
          </Link>
          <nav aria-label="Menú principal" className="hidden lg:block">
            <DesktopNav />
          </nav>
          <div className="flex items-center gap-2">
            <Link
              href="/contacto"
              className="hidden rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary-hover ease-out active:scale-[0.98] motion-reduce:active:scale-100 sm:block"
            >
              Contáctanos
            </Link>
            <MobileNav />
          </div>
        </div>
      </header>

      <main id="contenido" className="flex-1">
        {children}
      </main>

      <footer className="border-t border-border bg-cream-deep">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-8 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_auto]">
          <div>
            {/* Logo estático: el momento animado de marca vive solo en el
                header; repetir el mismo GIF aquí devaluaba el gesto. */}
            <Image
              src="/brand/logo-cmc-png-copia-1.png"
              alt=""
              width={96}
              height={64}
              className="mb-3 h-10 w-auto"
            />
            <p className="text-sm font-semibold text-petrol">{companyName}</p>
            {settings?.slogan ? (
              <p className="text-sm italic text-muted-foreground">{settings.slogan}</p>
            ) : null}
            <p className="mt-2 max-w-xs text-sm text-muted-foreground">
              Producción y distribución de margarinas, mantequillas y aceites.
            </p>
          </div>

          <nav aria-label="Mapa del sitio">
            <h2 className="mb-3 text-sm font-semibold text-petrol">Navegación</h2>
            <ul className="grid grid-cols-2 gap-x-6 gap-y-1.5 sm:grid-cols-1 sm:gap-y-2 lg:grid-cols-2">
              {NAV_ITEMS.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-muted-foreground underline-offset-2 hover:text-petrol hover:underline"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h2 className="mb-3 text-sm font-semibold text-petrol">Contacto</h2>
            {contactChannels.length > 0 ? (
              <ul className="space-y-2">
                {contactChannels.map((channel) => (
                  <li key={channel.label} className="text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">{channel.label}: </span>
                    {channel.value}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">
                Pronto publicaremos nuestros canales de contacto.
              </p>
            )}
            {socialLinks.length > 0 ? (
              <ul className="mt-3 flex flex-wrap gap-3">
                {socialLinks.map((social) => (
                  <li key={social.label}>
                    <a
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-secondary underline-offset-2 hover:underline"
                    >
                      {social.label}
                    </a>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>

          {/* Puerta de entrada al panel: discreta a propósito (pedido de la
              clienta, 2026-08-19) — jerarquía mínima, no compite con los CTA. */}
          <div className="sm:justify-self-end">
            <Link
              href="/admin"
              className="inline-block rounded-md border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition hover:border-petrol hover:text-petrol"
            >
              Admin
            </Link>
          </div>
        </div>
        <div className="border-t border-border py-4">
          <p className="mx-auto max-w-6xl px-4 text-xs text-muted-foreground">
            © {new Date().getFullYear()} {companyName}. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
