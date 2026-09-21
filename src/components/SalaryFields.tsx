'use client'

import { useState } from 'react'
import { Field, SelectField } from './Field'

// Pay fields where the labels follow the chosen salary type, e.g. "Pay from (per hour)".
export function SalaryFields({
  idPrefix,
  labels,
  periodOptions,
  perLabels,
  currencyOptions,
  defaults,
}: {
  idPrefix: string
  labels: { type: string; choose: string; min: string; max: string; currency: string; hint: string }
  periodOptions: { value: string; label: string }[]
  perLabels: Record<string, string>
  currencyOptions: { value: string; label: string }[]
  defaults: { period: string | null; min: number | null; max: number | null; currency: string }
}) {
  const [period, setPeriod] = useState(defaults.period ?? '')
  const suffix = period ? ` (${perLabels[period]})` : ''

  return (
    <div className="grid gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor={`${idPrefix}-period`} className="label">
            {labels.type}
          </label>
          <select
            id={`${idPrefix}-period`}
            name="salary_period"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="input"
          >
            <option value="">{labels.choose}</option>
            {periodOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <SelectField
          label={labels.currency}
          name="salary_currency"
          id={`${idPrefix}-currency`}
          options={currencyOptions}
          defaultValue={defaults.currency}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={`${labels.min}${suffix}`} name="salary_min" id={`${idPrefix}-min`} type="number" min={0} inputMode="numeric" defaultValue={defaults.min} />
        <Field label={`${labels.max}${suffix}`} name="salary_max" id={`${idPrefix}-max`} type="number" min={0} inputMode="numeric" defaultValue={defaults.max} />
      </div>
      <p className="hint !mt-0">{labels.hint}</p>
    </div>
  )
}
