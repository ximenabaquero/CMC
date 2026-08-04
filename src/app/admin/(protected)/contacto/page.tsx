import { createSupabaseServerClient } from "@/lib/supabase/server";
import { SettingsForm } from "./SettingsForm";

export const metadata = { title: "Información de contacto" };

export default async function AdminContactPage() {
  const supabase = await createSupabaseServerClient();

  const { data: settings, error } = await supabase
    .from("site_settings")
    .select("*")
    .eq("id", 1)
    .maybeSingle();

  if (error || !settings) throw new Error("No se pudo cargar la configuración del sitio.");

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-2 text-2xl font-semibold">Información de contacto y datos generales</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        El sitio público solo muestra los canales que tengan datos. Si dejas un campo vacío, ese
        canal se oculta sin romper el diseño.
      </p>
      <SettingsForm settings={settings} />
    </div>
  );
}
