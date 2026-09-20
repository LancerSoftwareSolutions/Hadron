'use server'

import { go, localeOf, num, optStr, requireActionUser, str } from '@/lib/actions'
import { parseAreas } from '@/lib/areas'
import { SPOKEN_LANGUAGES } from '@/lib/constants'

export async function saveSeekerProfile(formData: FormData) {
  const locale = localeOf(formData)
  const { supabase, user } = await requireActionUser(locale, 'seeker')

  const fullName = str(formData, 'full_name')
  const phone = optStr(formData, 'phone')
  if (fullName) {
    const { error } = await supabase.from('profiles').update({ full_name: fullName, phone }).eq('id', user.id)
    if (error) go(locale, '/seeker', 'err', 'save_failed')
  }

  const skills = str(formData, 'skills')
    .split(/[,،\n]/)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 30)
  const languages = formData
    .getAll('languages')
    .filter((v): v is string => typeof v === 'string' && (SPOKEN_LANGUAGES as readonly string[]).includes(v))
  const years = num(formData, 'experience_years')

  const cv = optStr(formData, 'cv_path')
  const cvPatch = cv && cv.startsWith(`${user.id}/`) ? { cv_path: cv } : {}

  const values = {
    headline: optStr(formData, 'headline'),
    summary: optStr(formData, 'summary'),
    skills,
    languages,
    experience_years: years != null && years >= 0 ? Math.round(years) : null,
    areas: parseAreas(formData.getAll('areas')),
    ...cvPatch,
  }

  const { data: existing } = await supabase.from('seeker_profiles').select('user_id').eq('user_id', user.id).maybeSingle()
  const { error } = existing
    ? await supabase.from('seeker_profiles').update(values).eq('user_id', user.id)
    : await supabase.from('seeker_profiles').insert({ user_id: user.id, ...values })

  if (error) go(locale, '/seeker', 'err', 'save_failed')
  go(locale, '/seeker', 'ok', 'profile_saved')
}

export async function applyToListing(formData: FormData) {
  const locale = localeOf(formData)
  const { supabase, user } = await requireActionUser(locale, 'seeker')

  const listingId = str(formData, 'listing_id')
  const { error } = await supabase.from('applications').insert({
    listing_id: listingId,
    seeker_id: user.id,
    cover_note: optStr(formData, 'cover_note'),
  })

  const back = `/jobs/${listingId}`
  if (error) go(locale, back, 'err', error.code === '23505' ? 'already_applied' : 'apply_failed')
  go(locale, back, 'ok', 'applied')
}

export async function withdrawApplication(formData: FormData) {
  const locale = localeOf(formData)
  const { supabase } = await requireActionUser(locale, 'seeker')

  const listingId = str(formData, 'listing_id')
  const { error } = await supabase.from('applications').delete().eq('id', str(formData, 'application_id'))
  const back = listingId ? `/jobs/${listingId}` : '/seeker'
  if (error) go(locale, back, 'err', 'save_failed')
  go(locale, back, 'ok', 'withdrawn')
}
