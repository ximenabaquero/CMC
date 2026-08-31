import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { logout } from "@/actions/auth";
import { AdminNav } from "@/components/admin/AdminNav";
import { ToastProvider } from "@/components/admin/toast";
import { BrandStripe } from "@/components/public/BrandStripe";

export const metadata: Metadata = {
  title: { default: "Panel administrativo", template: "%s — Panel administrativo" },
  robots: { index: false, follow: false },
};

// El panel depende de la sesión: nunca se pre-renderiza.
export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAdmin();

  return (
    <div className="flex min-h-screen flex-col bg-surface-muted lg:flex-row">
      {/* Identidad del panel (2026-08-28): el mismo emblema vectorial y la
          misma franja tricolor del sitio público, para que el panel no se
          sienta una herramienta ajena. `BrandStripe` es la única pieza de
          marca que comparten las dos cáscaras; vive en `components/public`
          porque allí nació. */}
      <aside className="border-b border-border bg-surface lg:w-64 lg:shrink-0 lg:border-b-0 lg:border-r">
        <BrandStripe />
        <div className="flex items-center gap-3 border-b border-border p-4">
          <Image
            src="/brand/logo-cmc-emblema.svg"
            alt=""
            aria-hidden="true"
            width={484}
            height={468}
            className="h-10 w-auto"
          />
          <div className="min-w-0">
            <p className="truncate font-display text-sm font-semibold text-petrol">
              Panel administrativo
            </p>
            <p className="truncate text-xs text-muted-foreground">{session.email}</p>
          </div>
        </div>
        <AdminNav />
        <div className="border-t border-border p-4">
          <form action={logout}>
            <button
              type="submit"
              className="min-h-11 w-full rounded-md border border-border px-3 py-2 text-sm font-medium transition hover:bg-surface-muted"
            >
              Cerrar sesión
            </button>
          </form>
          <Link
            href="/"
            className="mt-2 block text-center text-xs text-muted-foreground underline-offset-2 hover:underline"
            target="_blank"
          >
            Ver sitio público ↗
          </Link>
        </div>
      </aside>
      <ToastProvider>
        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </ToastProvider>
    </div>
  );
}
