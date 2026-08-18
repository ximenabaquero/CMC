"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { actionError, zodActionError, type ActionState } from "@/lib/action-state";

const loginSchema = z.object({
  email: z.string().trim().email("Ingresa un correo válido."),
  password: z.string().min(1, "Ingresa la contraseña."),
});

export async function login(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return zodActionError(parsed.error);
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    if (error.message.toLowerCase().includes("invalid login credentials")) {
      return actionError("Correo o contraseña incorrectos.");
    }
    return actionError(
      "No se pudo iniciar sesión. Verifica tu conexión o inténtalo más tarde. Si el problema persiste, la base de datos puede estar pausada."
    );
  }

  redirect("/admin");
}

export async function logout(): Promise<void> {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}
