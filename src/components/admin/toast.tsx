"use client";

/**
 * Sistema global de notificaciones del panel (sin dependencias).
 * - Región aria-live pre-montada: los lectores de pantalla anuncian
 *   los toasts aunque se monten después.
 * - Auto-cierre a los 4.5 s, pausado mientras el toast tiene el
 *   cursor encima o el foco dentro.
 * - Dedupe: un mensaje idéntico visible reinicia su temporizador en
 *   vez de apilarse.
 * - Motion con los tokens de globals.css (--ease-drawer, --dur-fast);
 *   bajo prefers-reduced-motion solo se desvanece (sin desplazamiento).
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { ActionState } from "@/lib/action-state";

export type ToastVariant = "success" | "error" | "warning" | "info";

export interface ToastOptions {
  variant: ToastVariant;
  message: string;
  /** Milisegundos antes del cierre automático. */
  duration?: number;
}

interface ToastItem extends Required<ToastOptions> {
  id: number;
  leaving: boolean;
}

interface ToastContextValue {
  toast: (options: ToastOptions) => void;
  dismiss: (id: number) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const DEFAULT_DURATION = 4500;
const EXIT_MS = 150; // --dur-fast

let nextId = 1;

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast debe usarse dentro de <ToastProvider>.");
  }
  return context;
}

/**
 * Dispara un toast cuando llega un ActionState nuevo del servidor.
 * El campo `ts` identifica cada respuesta: sin `ts` (estado inicial o
 * éxito silencioso) no se muestra nada, y un mismo `ts` nunca se
 * re-dispara aunque el componente re-renderice (StrictMode incluido).
 */
export function useActionToast(state: ActionState): void {
  const { toast } = useToast();
  const lastTs = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (!state.ts || state.ts === lastTs.current || !state.message) return;
    lastTs.current = state.ts;
    toast({
      variant: state.status === "error" ? "error" : "success",
      message: state.message,
    });
  }, [state, toast]);
}

const VARIANT_STYLES: Record<ToastVariant, { border: string; icon: string }> = {
  success: { border: "border-l-primary", icon: "text-primary" },
  error: { border: "border-l-accent", icon: "text-accent" },
  warning: { border: "border-l-amber-600", icon: "text-amber-700" },
  info: { border: "border-l-secondary", icon: "text-secondary" },
};

function ToastIcon({ variant }: { variant: ToastVariant }) {
  const common = {
    width: 20,
    height: 20,
    viewBox: "0 0 20 20",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };
  switch (variant) {
    case "success":
      return (
        <svg {...common}>
          <circle cx="10" cy="10" r="8" />
          <path d="m6.5 10.5 2.5 2.5 4.5-5" />
        </svg>
      );
    case "error":
      return (
        <svg {...common}>
          <circle cx="10" cy="10" r="8" />
          <path d="m7.5 7.5 5 5m0-5-5 5" />
        </svg>
      );
    case "warning":
      return (
        <svg {...common}>
          <path d="M10 3 2.5 16h15L10 3Z" />
          <path d="M10 8.5v3.5m0 2.2v.05" />
        </svg>
      );
    case "info":
      return (
        <svg {...common}>
          <circle cx="10" cy="10" r="8" />
          <path d="M10 9v4.5m0-7.2v-.05" />
        </svg>
      );
  }
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  // Espejo síncrono del estado: permite leer/escribir la lista fuera de
  // los updaters de React (que deben ser puros: StrictMode los duplica).
  const toastsRef = useRef<ToastItem[]>([]);
  const timers = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());

  const commit = useCallback((next: ToastItem[]) => {
    toastsRef.current = next;
    setToasts(next);
  }, []);

  const clearTimer = useCallback((id: number) => {
    const timer = timers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
  }, []);

  const dismiss = useCallback(
    (id: number) => {
      clearTimer(id);
      // Marca el toast como saliente; se retira del árbol tras la transición.
      commit(
        toastsRef.current.map((item) => (item.id === id ? { ...item, leaving: true } : item))
      );
      setTimeout(() => {
        commit(toastsRef.current.filter((item) => item.id !== id));
      }, EXIT_MS);
    },
    [clearTimer, commit]
  );

  const startTimer = useCallback(
    (id: number, duration: number) => {
      clearTimer(id);
      timers.current.set(
        id,
        setTimeout(() => dismiss(id), duration)
      );
    },
    [clearTimer, dismiss]
  );

  const toast = useCallback(
    (options: ToastOptions) => {
      const duration = options.duration ?? DEFAULT_DURATION;
      const existing = toastsRef.current.find(
        (item) =>
          !item.leaving &&
          item.variant === options.variant &&
          item.message === options.message
      );
      // Dedupe: un mensaje idéntico visible solo reinicia su temporizador.
      if (existing) {
        startTimer(existing.id, duration);
        return;
      }
      const id = nextId++;
      commit([
        ...toastsRef.current,
        { id, variant: options.variant, message: options.message, duration, leaving: false },
      ]);
      startTimer(id, duration);
    },
    [commit, startTimer]
  );

  useEffect(() => {
    const pending = timers.current;
    return () => {
      pending.forEach((timer) => clearTimeout(timer));
      pending.clear();
    };
  }, []);

  const value = useMemo(() => ({ toast, dismiss }), [toast, dismiss]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {/* Viewport pre-montado: móvil arriba a lo ancho, escritorio arriba a la derecha. */}
      <div
        role="region"
        aria-label="Notificaciones"
        aria-live="polite"
        className="pointer-events-none fixed inset-x-4 top-4 z-50 flex flex-col items-stretch gap-2 sm:inset-x-auto sm:right-4 sm:w-96 sm:max-w-[calc(100vw-2rem)]"
      >
        {toasts.map((item) => {
          const styles = VARIANT_STYLES[item.variant];
          return (
            <div
              key={item.id}
              role={item.variant === "error" ? "alert" : "status"}
              onMouseEnter={() => clearTimer(item.id)}
              onMouseLeave={() => {
                if (!item.leaving) startTimer(item.id, item.duration);
              }}
              onFocus={() => clearTimer(item.id)}
              onBlur={(event) => {
                if (
                  !item.leaving &&
                  !event.currentTarget.contains(event.relatedTarget as Node | null)
                ) {
                  startTimer(item.id, item.duration);
                }
              }}
              className={`pointer-events-auto flex items-start gap-3 rounded-lg border border-border ${styles.border} border-l-4 bg-surface p-3 shadow-md transition-[opacity,translate] duration-200 [transition-timing-function:var(--ease-drawer)] starting:opacity-0 starting:-translate-y-2 motion-reduce:starting:translate-y-0 ${
                item.leaving ? "opacity-0 duration-[var(--dur-fast)]" : ""
              }`}
            >
              <span className={`mt-0.5 shrink-0 ${styles.icon}`}>
                <ToastIcon variant={item.variant} />
              </span>
              <p className="min-w-0 flex-1 py-0.5 text-base text-foreground">{item.message}</p>
              <button
                type="button"
                onClick={() => dismiss(item.id)}
                aria-label="Cerrar notificación"
                className="-m-1 flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition hover:bg-surface-muted hover:text-foreground"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  aria-hidden="true"
                >
                  <path d="m3 3 8 8m0-8-8 8" />
                </svg>
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
