import { ALL_AREAS, AREAS } from './constants'
import type { Dict, Locale } from './i18n'

// Turns submitted checkboxes into a clean list. "All of Lebanon" wins over any single area.
export function parseAreas(values: FormDataEntryValue[]): string[] {
  const picked = values.filter((v): v is string => typeof v === 'string')
  if (picked.includes(ALL_AREAS)) return [ALL_AREAS]
  return AREAS.filter((a) => picked.includes(a))
}

// A short label for cards: "Beirut, Bekaa +1" or "All of Lebanon".
export function areasLabel(areas: string[] | null | undefined, t: Dict, locale: Locale, max = 2): string {
  if (!areas || areas.length === 0) return t.job.anywhere
  if (areas.includes(ALL_AREAS)) return t.areas.all
  const names = areas.map((a) => (t.areas as Record<string, string>)[a] ?? a)
  const sep = locale === 'ar' ? '، ' : ', '
  if (names.length <= max) return names.join(sep)
  return `${names.slice(0, max).join(sep)} +${names.length - max}`
}
