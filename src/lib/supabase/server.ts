import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import type { Database } from "./types";

function getSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error(
      "Faltan NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_ANON_KEY. Copia .env.example a .env.local y complétalas."
    );
  }
  return { url, anonKey };
}

/**
 * Cliente para Server Components, Server Actions y Route Handlers,
 * con la sesión del usuario (cookies). Las operaciones del admin
 * usan SU sesión: la autorización real la aplican las políticas RLS.
 */
export async function createSupabaseServerClient() {
  // cookies() primero: durante el build marca la ruta como dinámica
  // antes de validar variables de entorno.
  const cookieStore = await cookies();
  const { url, anonKey } = getSupabaseEnv();

  return createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Llamado desde un Server Component (solo lectura de cookies):
          // el middleware se encarga de refrescar la sesión.
        }
      },
    },
  });
}

/**
 * Cliente anónimo SIN sesión para los fetchers de contenido público
 * (cacheados con unstable_cache, donde no se puede acceder a cookies).
 * Solo ve contenido PUBLISHED gracias a RLS.
 */
export function createSupabasePublicClient() {
  const { url, anonKey } = getSupabaseEnv();
  return createClient<Database>(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}
