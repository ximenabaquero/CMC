/**
 * Campos de formulario reutilizables del panel (presentacionales).
 * Válidos tanto en componentes cliente como servidor.
 */

import type { ActionState } from "@/lib/action-state";

export const inputClass =
  "w-full rounded-md border border-border bg-surface px-3 py-2.5 text-base focus:border-secondary";

const inputErrorClass = "border-accent";

/** Compone aria-describedby con el error y/o la ayuda del campo. */
function describedBy(name: string, error?: string, hint?: string): string | undefined {
  const ids = [error ? `${name}-error` : null, hint ? `${name}-hint` : null].filter(Boolean);
  return ids.length ? ids.join(" ") : undefined;
}

function FieldError({ name, error }: { name: string; error?: string }) {
  if (!error) return null;
  return (
    <p id={`${name}-error`} className="mt-1 text-sm text-accent">
      {error}
    </p>
  );
}

function FieldHint({ name, hint }: { name: string; hint?: string }) {
  if (!hint) return null;
  return (
    <p id={`${name}-hint`} className="mt-1 text-xs text-muted-foreground">
      {hint}
    </p>
  );
}

export function TextField({
  label,
  name,
  defaultValue,
  required,
  type = "text",
  hint,
  maxLength,
  error,
  autoComplete,
}: {
  label: string;
  name: string;
  defaultValue?: string | null;
  required?: boolean;
  type?: string;
  hint?: string;
  maxLength?: number;
  error?: string;
  autoComplete?: string;
}) {
  return (
    <div>
      <label htmlFor={name} className="mb-1 block text-sm font-medium">
        {label}
        {required ? <span aria-hidden="true"> *</span> : null}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        defaultValue={defaultValue ?? ""}
        required={required}
        maxLength={maxLength}
        autoComplete={autoComplete}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(name, error, hint)}
        className={`${inputClass}${error ? ` ${inputErrorClass}` : ""}`}
      />
      <FieldError name={name} error={error} />
      <FieldHint name={name} hint={hint} />
    </div>
  );
}

export function TextAreaField({
  label,
  name,
  defaultValue,
  required,
  rows = 4,
  hint,
  maxLength,
  error,
}: {
  label: string;
  name: string;
  defaultValue?: string | null;
  required?: boolean;
  rows?: number;
  hint?: string;
  maxLength?: number;
  error?: string;
}) {
  return (
    <div>
      <label htmlFor={name} className="mb-1 block text-sm font-medium">
        {label}
        {required ? <span aria-hidden="true"> *</span> : null}
      </label>
      <textarea
        id={name}
        name={name}
        defaultValue={defaultValue ?? ""}
        required={required}
        rows={rows}
        maxLength={maxLength}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(name, error, hint)}
        className={`${inputClass}${error ? ` ${inputErrorClass}` : ""}`}
      />
      <FieldError name={name} error={error} />
      <FieldHint name={name} hint={hint} />
    </div>
  );
}

export function SelectField({
  label,
  name,
  defaultValue,
  options,
  hint,
  error,
}: {
  label: string;
  name: string;
  defaultValue?: string | null;
  options: { value: string; label: string }[];
  hint?: string;
  error?: string;
}) {
  return (
    <div>
      <label htmlFor={name} className="mb-1 block text-sm font-medium">
        {label}
      </label>
      <select
        id={name}
        name={name}
        defaultValue={defaultValue ?? ""}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(name, error, hint)}
        className={`${inputClass}${error ? ` ${inputErrorClass}` : ""}`}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <FieldError name={name} error={error} />
      <FieldHint name={name} hint={hint} />
    </div>
  );
}

export function StatusField({ defaultValue, error }: { defaultValue: string; error?: string }) {
  return (
    <SelectField
      label="Estado"
      name="status"
      defaultValue={defaultValue}
      error={error}
      options={[
        { value: "DRAFT", label: "Borrador (no visible al público)" },
        { value: "PUBLISHED", label: "Publicado (visible al público)" },
      ]}
    />
  );
}

export function CheckboxField({
  label,
  name,
  defaultChecked,
  hint,
}: {
  label: string;
  name: string;
  defaultChecked?: boolean;
  hint?: string;
}) {
  return (
    <div className="flex items-start gap-2">
      <input
        id={name}
        name={name}
        type="checkbox"
        defaultChecked={defaultChecked}
        className="mt-1 h-5 w-5 rounded border-border"
      />
      <div>
        <label htmlFor={name} className="text-sm font-medium">
          {label}
        </label>
        {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
      </div>
    </div>
  );
}

/**
 * Error general del formulario, persistente (el toast se desvanece).
 * El éxito se comunica solo por toast: aquí no se renderiza nada.
 */
export function ActionFeedback({ state }: { state: ActionState }) {
  if (state.status !== "error" || !state.message) return null;
  return (
    <p role="alert" className="rounded-md border border-accent/40 bg-accent/10 p-3 text-sm text-accent">
      {state.message}
    </p>
  );
}
