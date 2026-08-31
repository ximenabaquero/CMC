import type { Metadata } from "next";
import Image from "next/image";
import { LoginForm } from "./LoginForm";
import { BrandStripe } from "@/components/public/BrandStripe";

export const metadata: Metadata = {
  title: "Iniciar sesión — Panel administrativo",
  robots: { index: false, follow: false },
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ "sin-acceso"?: string }>;
}) {
  const params = await searchParams;
  const sinAcceso = params["sin-acceso"] === "1";

  return (
    <main className="flex min-h-screen items-center justify-center bg-surface-muted px-4">
      <div className="w-full max-w-md overflow-hidden rounded-lg border border-border bg-surface shadow-sm">
        <BrandStripe size="md" />
        <div className="p-8">
          <div className="mb-6 flex flex-col items-center gap-3 text-center">
            <Image
              src="/brand/logo-cmc-emblema.svg"
              alt="Logotipo de Compañía Mundial de Comercio S.A.S."
              width={484}
              height={468}
              priority
              className="h-20 w-auto"
            />
            <h1 className="font-display text-xl font-semibold text-petrol">Panel administrativo</h1>
            <p className="text-sm text-muted-foreground">
              Acceso exclusivo para administradores del sitio.
            </p>
          </div>

          {sinAcceso ? (
            <p
              role="alert"
              className="mb-4 rounded-md border border-accent/40 bg-accent/10 p-3 text-sm text-accent"
            >
              Tu cuenta no tiene permisos de administración. Contacta a la persona responsable del
              sitio.
            </p>
          ) : null}

          <LoginForm />
        </div>
      </div>
    </main>
  );
}
