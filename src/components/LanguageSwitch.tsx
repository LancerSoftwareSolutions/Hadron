'use client'

import { usePathname } from 'next/navigation'
import type { Locale } from '@/lib/i18n'

export function LanguageSwitch({ locale, label }: { locale: Locale; label: string }) {
  const pathname = usePathname()
  const other: Locale = locale === 'en' ? 'ar' : 'en'
  const href = pathname.replace(/^\/(en|ar)(?=\/|$)/, `/${other}`)

  return (
    <a
      href={href}
      lang={other}
      hrefLang={other}
      className="btn btn-quiet font-bold"
      onClick={(e) => {
        document.cookie = `NEXT_LOCALE=${other}; path=/; max-age=31536000; samesite=lax`
        e.currentTarget.search = window.location.search
      }}
    >
      {label}
    </a>
  )
}
