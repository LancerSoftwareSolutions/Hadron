type Base = {
  label: string
  name: string
  id?: string
  hint?: string
  required?: boolean
}

export function Field({
  label,
  name,
  id,
  hint,
  required,
  type = 'text',
  defaultValue,
  autoComplete,
  inputMode,
  placeholder,
  minLength,
  min,
  step,
}: Base & {
  type?: string
  defaultValue?: string | number | null
  autoComplete?: string
  inputMode?: 'text' | 'numeric' | 'tel' | 'email' | 'decimal' | 'url'
  placeholder?: string
  minLength?: number
  min?: number
  step?: string
}) {
  const fieldId = id ?? name
  return (
    <div>
      <label htmlFor={fieldId} className="label">
        {label}
      </label>
      <input
        id={fieldId}
        name={name}
        type={type}
        required={required}
        defaultValue={defaultValue ?? undefined}
        autoComplete={autoComplete}
        inputMode={inputMode}
        placeholder={placeholder}
        minLength={minLength}
        min={min}
        step={step}
        className="input"
        aria-describedby={hint ? `${fieldId}-hint` : undefined}
      />
      {hint && (
        <p id={`${fieldId}-hint`} className="hint">
          {hint}
        </p>
      )}
    </div>
  )
}

export function TextArea({
  label,
  name,
  id,
  hint,
  required,
  defaultValue,
  rows = 5,
  placeholder,
  noResize,
  autoComplete,
  inputMode,
}: Base & {
  defaultValue?: string | null
  rows?: number
  placeholder?: string
  noResize?: boolean
  autoComplete?: string
  inputMode?: 'text' | 'url'
}) {
  const fieldId = id ?? name
  return (
    <div>
      <label htmlFor={fieldId} className="label">
        {label}
      </label>
      <textarea
        id={fieldId}
        name={name}
        required={required}
        rows={rows}
        defaultValue={defaultValue ?? undefined}
        placeholder={placeholder}
        autoComplete={autoComplete}
        inputMode={inputMode}
        className={noResize ? 'input resize-none' : 'input'}
        aria-describedby={hint ? `${fieldId}-hint` : undefined}
      />
      {hint && (
        <p id={`${fieldId}-hint`} className="hint">
          {hint}
        </p>
      )}
    </div>
  )
}

export function SelectField({
  label,
  name,
  id,
  options,
  defaultValue,
  placeholder,
  required,
  hint,
}: Base & {
  options: { value: string; label: string }[]
  defaultValue?: string | null
  placeholder?: string
}) {
  const fieldId = id ?? name
  return (
    <div>
      <label htmlFor={fieldId} className="label">
        {label}
      </label>
      <select
        id={fieldId}
        name={name}
        required={required}
        defaultValue={defaultValue ?? ''}
        className="input"
        aria-describedby={hint ? `${fieldId}-hint` : undefined}
      >
        {placeholder !== undefined && <option value="">{placeholder}</option>}
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {hint && (
        <p id={`${fieldId}-hint`} className="hint">
          {hint}
        </p>
      )}
    </div>
  )
}
