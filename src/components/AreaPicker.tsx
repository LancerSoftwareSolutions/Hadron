'use client'

import { useState } from 'react'
import { ALL_AREAS, AREAS } from '@/lib/constants'

// Pick one, several, or all locations. "All of Lebanon" replaces the individual choices.
export function AreaPicker({
  idPrefix,
  label,
  hint,
  selected,
  labels,
  name = 'areas',
}: {
  idPrefix: string
  label: string
  hint?: string
  selected: string[]
  labels: Record<string, string>
  name?: string
}) {
  const [all, setAll] = useState(selected.includes(ALL_AREAS))
  const [picked, setPicked] = useState<string[]>(selected.filter((a) => a !== ALL_AREAS))

  const toggle = (area: string, on: boolean) =>
    setPicked((cur) => (on ? [...cur.filter((a) => a !== area), area] : cur.filter((a) => a !== area)))

  return (
    <fieldset aria-describedby={hint ? `${idPrefix}-hint` : undefined}>
      <legend className="label">{label}</legend>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
        <label className="check-chip col-span-2 sm:col-span-3 lg:col-span-4">
          <input
            type="checkbox"
            name={name}
            value={ALL_AREAS}
            checked={all}
            onChange={(e) => setAll(e.target.checked)}
            className="size-4 accent-sky"
          />
          {labels[ALL_AREAS]}
        </label>
        {AREAS.map((area) => (
          <label key={area} className="check-chip">
            <input
              type="checkbox"
              name={name}
              value={area}
              checked={!all && picked.includes(area)}
              disabled={all}
              onChange={(e) => toggle(area, e.target.checked)}
              className="size-4 accent-sky"
            />
            {labels[area]}
          </label>
        ))}
      </div>
      {hint && (
        <p id={`${idPrefix}-hint`} className="hint">
          {hint}
        </p>
      )}
    </fieldset>
  )
}
