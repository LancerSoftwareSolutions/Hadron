'use server'

import { go, localeOf, num, oneOf, optStr, requireActionUser, str } from '@/lib/actions'
import { parseAreas } from '@/lib/areas'
import {
  APPLICATION_STATUSES,
  CATEGORIES,
  CURRENCIES,
  CUSTOM_CATEGORY,
  CUSTOM_CATEGORY_MAX,
  JOB_TYPES,
  PAYMENT_METHODS,
} from '@/lib/constants'

export async function saveBusiness(formData: FormData) {
  const locale = localeOf(formData)
  const { supabase, user } = await requireActionUser(locale, 'business')

  const name = str(formData, 'name')
  if (!name) go(locale, '/business', 'err', 'name_required')

  // A category is either one from the list, or text the owner typed in themselves.
  const categoryChoice = str(formData, 'category')
  const customCategory = optStr(formData, 'category_custom')
  const category =
    categoryChoice === CUSTOM_CATEGORY
      ? (customCategory?.slice(0, CUSTOM_CATEGORY_MAX) ?? null)
      : oneOf(categoryChoice, CATEGORIES)

  const values = {
    name,
    category,
    areas: parseAreas(formData.getAll('areas')),
    address: optStr(formData, 'address'),
    description: optStr(formData, 'description'),
    phone: optStr(formData, 'phone'),
    email: optStr(formData, 'email'),
    // The website is optional. Leaving it empty is fine.
    website: optStr(formData, 'website')?.replace(/\s+/g, '').slice(0, 200) || null,
  }

  // A logo path is only accepted if it sits in this user's own storage folder.
  const logo = optStr(formData, 'logo_path')
  const logoPatch = logo && logo.startsWith(`${user.id}/`) ? { logo_path: logo } : {}

  const businessId = optStr(formData, 'business_id')
  const { error } = businessId
    ? await supabase
        .from('businesses')
        .update({ ...values, ...logoPatch })
        .eq('id', businessId)
    : await supabase.from('businesses').insert({ owner_id: user.id, ...values, ...logoPatch })

  if (error) go(locale, '/business', 'err', 'save_failed')
  go(locale, '/business', 'ok', 'business_saved')
}

export async function createListing(formData: FormData) {
  const locale = localeOf(formData)
  const { supabase } = await requireActionUser(locale, 'business')

  const businessId = str(formData, 'business_id')
  const title = str(formData, 'title')
  const description = str(formData, 'description')
  const min = num(formData, 'salary_min')
  const max = num(formData, 'salary_max')

  if (!businessId) go(locale, '/business', 'err', 'no_business')
  if (!title || !description) go(locale, '/business', 'err', 'listing_invalid')
  if (min != null && max != null && min > max) go(locale, '/business', 'err', 'salary_range')

  const areas = parseAreas(formData.getAll('areas'))

  const { error } = await supabase.from('listings').insert({
    business_id: businessId,
    title,
    description,
    job_type: oneOf(str(formData, 'job_type'), JOB_TYPES) ?? 'full_time',
    // No location chosen means the job is open to all of Lebanon.
    areas: areas.length > 0 ? areas : ['all'],
    salary_min: min,
    salary_max: max,
    salary_currency: oneOf(str(formData, 'salary_currency'), CURRENCIES) ?? 'USD',
  })

  if (error) go(locale, '/business', 'err', 'save_failed')
  go(locale, '/business', 'ok', 'listing_created')
}

export async function closeListing(formData: FormData) {
  const locale = localeOf(formData)
  const { supabase } = await requireActionUser(locale, 'business')

  const { error } = await supabase.from('listings').update({ status: 'closed' }).eq('id', str(formData, 'listing_id'))
  if (error) go(locale, '/business', 'err', 'save_failed')
  go(locale, '/business', 'ok', 'listing_closed')
}

export async function recordPayment(formData: FormData) {
  const locale = localeOf(formData)
  const { supabase } = await requireActionUser(locale, 'business')

  const amount = num(formData, 'amount')
  if (amount == null || amount <= 0) go(locale, '/business', 'err', 'amount_invalid')

  const { error } = await supabase.from('payments').insert({
    listing_id: str(formData, 'listing_id'),
    amount,
    currency: 'USD',
    method: oneOf(str(formData, 'method'), PAYMENT_METHODS) ?? 'whish',
    reference: optStr(formData, 'reference'),
  })

  if (error) go(locale, '/business', 'err', 'save_failed')
  go(locale, '/business', 'ok', 'payment_recorded')
}

export async function updateApplicationStatus(formData: FormData) {
  const locale = localeOf(formData)
  const { supabase } = await requireActionUser(locale, 'business')

  const listingId = str(formData, 'listing_id')
  const status = oneOf(str(formData, 'status'), APPLICATION_STATUSES)
  const back = `/business/listings/${listingId}`
  if (!status) go(locale, back, 'err', 'generic')

  const { error } = await supabase.from('applications').update({ status }).eq('id', str(formData, 'application_id'))
  if (error) go(locale, back, 'err', 'save_failed')
  go(locale, back, 'ok', 'status_updated')
}
