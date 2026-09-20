import { cache } from 'react'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { isLocale, type Locale } from '@/lib/i18n'
import type { Role, SessionUser } from '@/lib/types'

export const getSessionUser = cache(async (): Promise<SessionUser | null> => {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name, phone')
    .eq('id', user.id)
    .maybeSingle()
  if (!profile) return null

  return {
    id: user.id,
    email: user.email ?? '',
    role: profile.role as Role,
    full_name: profile.full_name,
    phone: profile.phone,
  }
})

export function homeFor(role: Role | undefined): string {
  if (role === 'business') return 'business'
  if (role === 'admin') return 'admin'
  return 'seeker'
}

// For pages: send signed-out people to log in, and people with the wrong role home.
export async function requireRole(locale: Locale, role: Role, path: string): Promise<SessionUser> {
  const user = await getSessionUser()
  if (!user) redirect(`/${locale}/login?next=${encodeURIComponent(`/${locale}${path}`)}`)
  if (user.role !== role) redirect(`/${locale}/${homeFor(user.role)}`)
  return user
}

export async function getLocaleParam(params: Promise<{ locale: string }>): Promise<Locale> {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  return locale
}
