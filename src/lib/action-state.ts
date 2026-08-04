/** Estado estándar devuelto por las Server Actions del panel. */
export interface ActionState {
  success: string | null;
  error: string | null;
}

export const initialActionState: ActionState = { success: null, error: null };

/** Mensaje genérico para errores de conexión/base de datos. */
export const DB_ERROR_MESSAGE =
  "No se pudo guardar: la base de datos no respondió. Puede estar pausada (plan gratuito) o sin conexión. Intenta de nuevo en unos minutos.";
