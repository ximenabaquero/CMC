import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/supabase/types";

export interface AdminSession {
  userId: string;
  email: string;
  profile: Profile;
}

/**
 * Exige un usuario autenticado con perfil ADMIN activo.
 * - Sin sesión → redirige a /admin/login.
 * - Con sesión pero sin perfil ADMIN → redirige a /admin/login?sin-acceso=1.
 * - Error de conexión con la base → lanza (la UI lo captura y muestra
 *   un estado de error claro en el panel).
 */
export async function requireAdmin(): Promise<AdminSession> {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/admin/login");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    throw new Error(
      "No se pudo verificar el perfil del administrador. La base de datos puede estar pausada o inaccesible."
    );
  }

  if (!profile || profile.role !== "ADMIN") {
    redirect("/admin/login?sin-acceso=1");
  }

  return { userId: user.id, email: user.email ?? profile.email, profile };
}
