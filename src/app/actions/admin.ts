'use server'

import { go, localeOf, num, requireActionUser, str } from '@/lib/actions'

export async function confirmPayment(formData: FormData) {
  const locale = localeOf(formData)
  const { supabase } = await requireActionUser(locale, 'admin')

  const days = Math.min(365, Math.max(1, Math.round(num(formData, 'days') ?? 30)))
  const { error } = await supabase.rpc('admin_confirm_payment', {
    p_payment_id: str(formData, 'payment_id'),
    p_days: days,
  })

  if (error) go(locale, '/admin', 'err', 'generic')
  go(locale, '/admin', 'ok', 'payment_confirmed')
}

export async function rejectPayment(formData: FormData) {
  const locale = localeOf(formData)
  const { supabase } = await requireActionUser(locale, 'admin')

  const { error } = await supabase.rpc('admin_reject_payment', { p_payment_id: str(formData, 'payment_id') })
  if (error) go(locale, '/admin', 'err', 'generic')
  go(locale, '/admin', 'ok', 'payment_rejected')
}

export async function setBusinessVerified(formData: FormData) {
  const locale = localeOf(formData)
  const { supabase } = await requireActionUser(locale, 'admin')

  const { error } = await supabase.rpc('admin_set_business_verified', {
    p_business_id: str(formData, 'business_id'),
    p_verified: str(formData, 'verified') === 'true',
  })

  if (error) go(locale, '/admin', 'err', 'generic')
  go(locale, '/admin', 'ok', 'verified_updated')
}
