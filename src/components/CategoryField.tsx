'use client'

import { useState } from 'react'
import { CUSTOM_CATEGORY, CUSTOM_CATEGORY_MAX } from '@/lib/constants'

// A category dropdown that ends with a "custom" choice; picking it reveals a box to type in.
export function CategoryField({
  label,
  placeholder,
  options,
  customOption,
  customLabel,
  customPlaceholder,
  defaultValue,
}: {
  label: string
  placeholder: string
  options: { value: string; label: string }[]
  customOption: string
  customLabel: string
  customPlaceholder: string
  defaultValue?: string | null
}) {
  const known = options.some((o) => o.value === defaultValue)
  const [choice, setChoice] = useState(defaultValue ? (known ? defaultValue : CUSTOM_CATEGORY) : '')
  const [text, setText] = useState(defaultValue && !known ? defaultValue : '')

  return (
    <div className="grid gap-4">
      <div>
        <label htmlFor="category" className="label">
          {label}
        </label>
        <select id="category" name="category" value={choice} onChange={(e) => setChoice(e.target.value)} className="input">
          <option value="">{placeholder}</option>
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
          <option value={CUSTOM_CATEGORY}>{customOption}</option>
        </select>
      </div>

      {choice === CUSTOM_CATEGORY && (
        <div>
          <label htmlFor="category_custom" className="label">
            {customLabel}
          </label>
          <input
            id="category_custom"
            name="category_custom"
            type="text"
            required
            maxLength={CUSTOM_CATEGORY_MAX}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={customPlaceholder}
            className="input"
          />
        </div>
      )}
    </div>
  )
}
