import { createSupabaseServerClient } from "@/lib/supabase/server";
import { SettingsForm } from "./SettingsForm";
import { PageHeader } from "@/components/admin/PageHeader";

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
      <PageHeader
        title="Información de contacto y datos generales"
        description="El sitio público solo muestra los canales que tengan datos. Si dejas un campo vacío, ese canal se oculta sin romper el diseño."
      />
      <SettingsForm settings={settings} />
    </div>
  );
}
