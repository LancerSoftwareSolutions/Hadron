'use client'

import { useEffect, useState } from 'react'

function Sun() {
  return (
    <svg viewBox="0 0 24 24" className="size-[18px]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M18.7 5.3l-1.6 1.6M6.9 17.1l-1.6 1.6" />
    </svg>
  )
}

function Moon() {
  return (
    <svg viewBox="0 0 24 24" className="size-[18px]" fill="currentColor" aria-hidden>
      <path d="M20.5 14.6A8.5 8.5 0 0 1 9.4 3.5a.6.6 0 0 0-.8-.7A9.5 9.5 0 1 0 21.2 15.4a.6.6 0 0 0-.7-.8z" />
    </svg>
  )
}

// A slider for light and dark mode. The choice is remembered in a cookie.
export function ThemeSwitch({ initialTheme, label }: { initialTheme: 'light' | 'dark'; label: string }) {
  const [dark, setDark] = useState(initialTheme === 'dark')

  // On a first visit there is no cookie yet, so pick up whatever the device preference set.
  useEffect(() => {
    setDark(document.documentElement.dataset.theme === 'dark')
  }, [])

  function toggle() {
    const next = dark ? 'light' : 'dark'
    setDark(!dark)
    document.documentElement.dataset.theme = next
    document.cookie = `theme=${next}; path=/; max-age=31536000; samesite=lax`
  }

  return (
    <button type="button" role="switch" aria-checked={dark} aria-label={label} onClick={toggle} dir="ltr" className="switch">
      <span className="switch-thumb" aria-hidden />
      <span className="switch-label" data-active={!dark} aria-hidden>
        <Sun />
      </span>
      <span className="switch-label" data-active={dark} aria-hidden>
        <Moon />
      </span>
    </button>
  )
}
