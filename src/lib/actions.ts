import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getSessionUser } from '@/lib/auth'
import { isLocale, type Locale } from '@/lib/i18n'
import type { Role, SessionUser } from '@/lib/types'

export function str(fd: FormData, key: string): string {
  const v = fd.get(key)
  return typeof v === 'string' ? v.trim() : ''
}

export function optStr(fd: FormData, key: string): string | null {
  const s = str(fd, key)
  return s === '' ? null : s
}

export function num(fd: FormData, key: string): number | null {
  const s = str(fd, key)
  if (s === '') return null
  const n = Number(s)
  return Number.isFinite(n) ? n : null
}

export function localeOf(fd: FormData): Locale {
  const l = str(fd, 'locale')
  return isLocale(l) ? l : 'en'
}

export function oneOf<T extends string>(value: string, allowed: readonly T[]): T | null {
  return (allowed as readonly string[]).includes(value) ? (value as T) : null
}

// Redirect back to a page with a message shown on it.
export function go(locale: Locale, path: string, kind: 'ok' | 'err', key: string): never {
  const sep = path.includes('?') ? '&' : '?'
  redirect(`/${locale}${path}${sep}${kind}=${key}`)
}

// Only follow "next" links that stay on this site.
export function safeNext(next: string): string | null {
  if (!next.startsWith('/') || next.startsWith('//') || next.includes('\\')) return null
  return next
}

export async function requireActionUser(locale: Locale, role: Role) {
  const user: SessionUser | null = await getSessionUser()
  if (!user) redirect(`/${locale}/login`)
  if (user.role !== role) redirect(`/${locale}`)
  const supabase = await createClient()
  return { supabase, user }
}
