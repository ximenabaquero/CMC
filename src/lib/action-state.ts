import { z } from "zod";

/** Estado estándar devuelto por las Server Actions del panel. */
export type ActionStatus = "idle" | "success" | "error";

export interface ActionState {
  status: ActionStatus;
  message: string | null;
  /** Errores por campo: la clave es el atributo `name` del input. */
  fieldErrors?: Record<string, string[]>;
  /** Marca única por respuesta; el toast solo se dispara cuando cambia. */
  ts?: number;
}

export const initialActionState: ActionState = { status: "idle", message: null };

/** Mensaje genérico para errores de conexión/base de datos. */
export const DB_ERROR_MESSAGE =
  "No se pudo guardar: la base de datos no respondió. Puede estar pausada (plan gratuito) o sin conexión. Intenta de nuevo en unos minutos.";

/**
 * Mensaje cuando un update no afectó ninguna fila. RLS filtra en
 * silencio (0 filas con error null), así que sin esta comprobación el
 * panel mostraría un éxito en falso.
 */
export const NO_ROWS_MESSAGE =
  "No se guardó ningún cambio: el registro no existe o tu usuario ya no tiene permisos de administrador. Recarga la página e inicia sesión de nuevo.";

/**
 * Éxito con mensaje (dispara toast). Con `message = null` el éxito es
 * silencioso: sin `ts`, el cliente no muestra nada (reordenar galería).
 */
export function actionSuccess(message: string | null): ActionState {
  return message === null
    ? { status: "success", message: null }
    : { status: "success", message, ts: Date.now() };
}

export function actionError(
  message: string,
  fieldErrors?: Record<string, string[]>
): ActionState {
  return { status: "error", message, fieldErrors, ts: Date.now() };
}

/** Convierte un error de Zod en estado con errores por campo. */
export function zodActionError(error: z.ZodError): ActionState {
  const { formErrors, fieldErrors } = z.flattenError(error);
  const hasFieldErrors = Object.keys(fieldErrors).length > 0;
  return actionError(
    hasFieldErrors
      ? "No fue posible guardar los cambios. Revisa los campos indicados."
      : formErrors[0] ?? "Revisa los campos del formulario.",
    hasFieldErrors ? (fieldErrors as Record<string, string[]>) : undefined
  );
}
