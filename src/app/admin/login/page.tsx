import type { Metadata } from "next";
import Image from "next/image";
import { LoginForm } from "./LoginForm";

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
      <div className="w-full max-w-md rounded-lg border border-border bg-surface p-8 shadow-sm">
        <div className="mb-6 flex flex-col items-center gap-3 text-center">
          <Image
            src="/brand/logo-cmc-png.png"
            alt="Logotipo de Compañía Mundial de Comercio S.A.S."
            width={160}
            height={90}
            priority
          />
          <h1 className="text-xl font-semibold">Panel administrativo</h1>
          <p className="text-sm text-muted-foreground">
            Acceso exclusivo para administradores del sitio.
          </p>
        </div>

        {sinAcceso ? (
          <p
            role="alert"
            className="mb-4 rounded-md border border-accent/40 bg-accent/10 p-3 text-sm text-accent"
          >
            Tu cuenta no tiene permisos de administración. Contacta a la persona
            responsable del sitio.
          </p>
        ) : null}

        <LoginForm />
      </div>
    </main>
  );
}
