import type { Dict } from '@/lib/i18n'
import { first } from '@/lib/format'

export type SearchParams = Record<string, string | string[] | undefined>

export function Flash({ t, sp }: { t: Dict; sp: SearchParams }) {
  const err = first(sp.err)
  const ok = first(sp.ok)
  if (!err && !ok) return null

  const isError = Boolean(err)
  const key = err || ok
  const message = t.flash[key] ?? (isError ? t.flash.generic : null)
  if (!message) return null

  return (
    <p
      role={isError ? 'alert' : 'status'}
      className={`mb-6 rounded-md border-2 px-4 py-3 font-semibold ${
        isError ? 'border-marker bg-paper text-marker' : 'border-cedar bg-paper text-cedar'
      }`}
    >
      {message}
    </p>
  )
}
