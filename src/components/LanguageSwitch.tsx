'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import type { Locale } from '@/lib/i18n'

// A slider: English on one side, Arabic on the other. The page reloads in the chosen language.
export function LanguageSwitch({ locale, label }: { locale: Locale; label: string }) {
  const pathname = usePathname()
  const [arabic, setArabic] = useState(locale === 'ar')

  function toggle() {
    const next: Locale = arabic ? 'en' : 'ar'
    setArabic(!arabic)
    document.cookie = `NEXT_LOCALE=${next}; path=/; max-age=31536000; samesite=lax`
    const href = pathname.replace(/^\/(en|ar)(?=\/|$)/, `/${next}`) + window.location.search
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    window.setTimeout(() => window.location.assign(href), reduced ? 0 : 180)
  }

  return (
    <button type="button" role="switch" aria-checked={arabic} aria-label={label} onClick={toggle} dir="ltr" className="switch">
      <span className="switch-thumb" aria-hidden />
      <span className="switch-label" data-active={!arabic} aria-hidden>
        EN
      </span>
      <span className="switch-label" data-active={arabic} aria-hidden style={{ fontSize: '1rem' }}>
        ع
      </span>
    </button>
  )
}
