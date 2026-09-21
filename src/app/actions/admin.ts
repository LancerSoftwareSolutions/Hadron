'use server'

import { go, localeOf, num, optStr, requireActionUser, str } from '@/lib/actions'
import { PHONE_RE } from '@/lib/contact'

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

// The listing fee, how long a job stays live, and the Whish number businesses pay to.
export async function updateSettings(formData: FormData) {
  const locale = localeOf(formData)
  const { supabase } = await requireActionUser(locale, 'admin')

  const fee = num(formData, 'fee') // empty means "no fixed fee"
  const days = Math.round(num(formData, 'days') ?? 30)
  const whish = optStr(formData, 'whish')

  const valid =
    (fee == null || (fee > 0 && fee <= 100000)) && days >= 1 && days <= 365 && (!whish || PHONE_RE.test(whish))
  if (!valid) go(locale, '/admin', 'err', 'settings_invalid')

  const { error } = await supabase.rpc('admin_update_settings', { p_fee: fee, p_days: days, p_whish: whish ?? '' })
  if (error) go(locale, '/admin', 'err', 'settings_invalid')
  go(locale, '/admin', 'ok', 'settings_saved')
}
