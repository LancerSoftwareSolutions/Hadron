'use server'

import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { go, localeOf, safeNext, str } from '@/lib/actions'
import { homeFor } from '@/lib/auth'
import type { Role } from '@/lib/types'

export async function signUp(formData: FormData) {
  const locale = localeOf(formData)
  const email = str(formData, 'email').toLowerCase()
  const password = str(formData, 'password')
  const fullName = str(formData, 'full_name')
  const phone = str(formData, 'phone')
  const role: Role = str(formData, 'role') === 'business' ? 'business' : 'seeker'

  if (str(formData, 'accept_terms') !== 'on') {
    go(locale, `/signup?role=${role}`, 'err', 'terms_required')
  }
  if (!email || password.length < 8 || !fullName || !phone) {
    go(locale, `/signup?role=${role}`, 'err', 'invalid_signup')
  }

  const origin = (await headers()).get('origin') ?? process.env.NEXT_PUBLIC_SITE_URL ?? ''
  const dest = `/${locale}/${homeFor(role)}`

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName.slice(0, 100), phone: phone.slice(0, 40), role, terms_accepted_at: new Date().toISOString() },
      emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent(dest)}`,
    },
  })

  if (error) {
    go(locale, `/signup?role=${role}`, 'err', error.code === 'user_already_exists' ? 'email_taken' : 'signup_failed')
  }
  if (data.session) redirect(dest)
  go(locale, '/login', 'ok', 'check_email')
}

export async function signIn(formData: FormData) {
  const locale = localeOf(formData)
  const email = str(formData, 'email').toLowerCase()
  const password = str(formData, 'password')
  const next = safeNext(str(formData, 'next'))

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) {
    const back = next ? `/login?next=${encodeURIComponent(next)}` : '/login'
    go(locale, back, 'err', error.code === 'email_not_confirmed' ? 'email_not_confirmed' : 'bad_login')
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()
  const { data: profile } = user
    ? await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle()
    : { data: null }

  redirect(next ?? `/${locale}/${homeFor(profile?.role as Role | undefined)}`)
}

export async function signOut(formData: FormData) {
  const locale = localeOf(formData)
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect(`/${locale}`)
}

// Sends a fresh confirmation link. Always answers the same way, so nobody can use it to learn who has an account.
export async function resendConfirmation(formData: FormData) {
  const locale = localeOf(formData)
  const email = str(formData, 'email').toLowerCase()
  if (!email) go(locale, '/login', 'err', 'bad_login')

  const origin = (await headers()).get('origin') ?? process.env.NEXT_PUBLIC_SITE_URL ?? ''
  const supabase = await createClient()
  await supabase.auth.resend({
    type: 'signup',
    email,
    // Business and admin accounts are sent on to their own page from here.
    options: { emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent(`/${locale}/seeker`)}` },
  })

  go(locale, '/login', 'ok', 'confirmation_sent')
}
