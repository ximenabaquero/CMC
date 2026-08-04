/**
 * Campos de formulario reutilizables del panel (presentacionales).
 * Válidos tanto en componentes cliente como servidor.
 */

const inputClass =
  "w-full rounded-md border border-border bg-surface px-3 py-2 text-sm focus:border-secondary";

export function TextField({
  label,
  name,
  defaultValue,
  required,
  type = "text",
  hint,
  maxLength,
}: {
  label: string;
  name: string;
  defaultValue?: string | null;
  required?: boolean;
  type?: string;
  hint?: string;
  maxLength?: number;
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
        className={inputClass}
      />
      {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
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
}: {
  label: string;
  name: string;
  defaultValue?: string | null;
  required?: boolean;
  rows?: number;
  hint?: string;
  maxLength?: number;
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
        className={inputClass}
      />
      {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

export function SelectField({
  label,
  name,
  defaultValue,
  options,
  hint,
}: {
  label: string;
  name: string;
  defaultValue?: string | null;
  options: { value: string; label: string }[];
  hint?: string;
}) {
  return (
    <div>
      <label htmlFor={name} className="mb-1 block text-sm font-medium">
        {label}
      </label>
      <select id={name} name={name} defaultValue={defaultValue ?? ""} className={inputClass}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

export function StatusField({ defaultValue }: { defaultValue: string }) {
  return (
    <SelectField
      label="Estado"
      name="status"
      defaultValue={defaultValue}
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
        className="mt-1 h-4 w-4 rounded border-border"
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

export function ActionFeedback({ success, error }: { success: string | null; error: string | null }) {
  if (error) {
    return (
      <p role="alert" className="rounded-md border border-accent/40 bg-accent/10 p-3 text-sm text-accent">
        {error}
      </p>
    );
  }
  if (success) {
    return (
      <p role="status" className="rounded-md border border-primary/40 bg-primary/10 p-3 text-sm text-primary">
        {success}
      </p>
    );
  }
  return null;
}
