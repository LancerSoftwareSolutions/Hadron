'use server'

import type { SupabaseClient } from '@supabase/supabase-js'
import { go, localeOf, num, oneOf, optStr, requireActionUser, str } from '@/lib/actions'
import { parseAreas } from '@/lib/areas'
import { contactIsValid, sameText } from '@/lib/contact'
import { getPaymentSettings } from '@/lib/settings'
import type { Locale } from '@/lib/i18n'
import {
  APPLICATION_STATUSES,
  CATEGORIES,
  CURRENCIES,
  CUSTOM_CATEGORY,
  CUSTOM_CATEGORY_MAX,
  JOB_TYPES,
  PAYMENT_METHODS,
  SALARY_PERIODS,
} from '@/lib/constants'

export async function saveBusiness(formData: FormData) {
  const locale = localeOf(formData)
  const { supabase, user } = await requireActionUser(locale, 'business')

  const name = str(formData, 'name').slice(0, 100)
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
    address: optStr(formData, 'address')?.slice(0, 200) ?? null,
    description: optStr(formData, 'description')?.slice(0, 2000) ?? null,
    phone: optStr(formData, 'phone')?.slice(0, 40) ?? null,
    email: optStr(formData, 'email')?.slice(0, 120) ?? null,
    // The website is optional. Leaving it empty is fine.
    website: optStr(formData, 'website')?.replace(/\s+/g, '').slice(0, 200) || null,
  }
  if (!contactIsValid(values)) go(locale, '/business', 'err', 'contact_invalid')

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

// Reads and checks the job form. Contact details that match the business's own are stored as
// "empty", so the job keeps following the business if those details change later.
async function readListingFields(
  formData: FormData,
  supabase: SupabaseClient,
  businessId: string,
  locale: Locale,
  back: string,
) {
  const title = str(formData, 'title').slice(0, 150)
  const description = str(formData, 'description').slice(0, 5000)
  const min = num(formData, 'salary_min')
  const max = num(formData, 'salary_max')

  if (!title || !description) go(locale, back, 'err', 'listing_invalid')
  if ((min != null && min < 0) || (max != null && max < 0) || (min != null && max != null && min > max)) {
    go(locale, back, 'err', 'salary_range')
  }

  const period = oneOf(str(formData, 'salary_period'), SALARY_PERIODS)
  if ((min != null || max != null) && !period) go(locale, back, 'err', 'period_required')

  const contact = {
    name: optStr(formData, 'display_name')?.slice(0, 100) ?? null,
    email: optStr(formData, 'contact_email'),
    phone: optStr(formData, 'contact_phone'),
    website: optStr(formData, 'contact_website')?.replace(/\s+/g, '') || null,
  }
  if (!contactIsValid(contact)) go(locale, back, 'err', 'contact_invalid')

  const { data: business } = await supabase
    .from('businesses')
    .select('name, email, phone, website')
    .eq('id', businessId)
    .maybeSingle()
  const override = (value: string | null, base: string | null | undefined) =>
    value && !sameText(value, base) ? value : null

  const areas = parseAreas(formData.getAll('areas'))

  return {
    title,
    description,
    job_type: oneOf(str(formData, 'job_type'), JOB_TYPES) ?? 'full_time',
    // No location chosen means the job is open to all of Lebanon.
    areas: areas.length > 0 ? areas : ['all'],
    salary_min: min,
    salary_max: max,
    salary_currency: oneOf(str(formData, 'salary_currency'), CURRENCIES) ?? 'USD',
    salary_period: period,
    display_name: override(contact.name, business?.name),
    contact_email: override(contact.email, business?.email),
    contact_phone: override(contact.phone, business?.phone),
    contact_website: override(contact.website, business?.website),
  }
}

export async function createListing(formData: FormData) {
  const locale = localeOf(formData)
  const { supabase } = await requireActionUser(locale, 'business')

  const businessId = str(formData, 'business_id')
  if (!businessId) go(locale, '/business', 'err', 'no_business')

  const fields = await readListingFields(formData, supabase, businessId, locale, '/business')
  const { error } = await supabase.from('listings').insert({ business_id: businessId, ...fields })

  if (error) go(locale, '/business', 'err', 'save_failed')
  go(locale, '/business', 'ok', 'listing_created')
}

export async function updateListing(formData: FormData) {
  const locale = localeOf(formData)
  const { supabase } = await requireActionUser(locale, 'business')

  const listingId = str(formData, 'listing_id')
  const back = `/business/listings/${listingId}/edit`

  const { data: listing } = await supabase.from('listings').select('business_id, status').eq('id', listingId).maybeSingle()
  if (!listing) go(locale, '/business', 'err', 'save_failed')
  if (listing.status === 'closed') go(locale, '/business', 'err', 'closed_no_edit')

  const fields = await readListingFields(formData, supabase, listing.business_id, locale, back)
  const { error } = await supabase.from('listings').update(fields).eq('id', listingId)

  if (error) go(locale, back, 'err', 'save_failed')
  go(locale, '/business', 'ok', 'listing_updated')
}

// The database only allows this for jobs that never had a payment record.
export async function deleteListing(formData: FormData) {
  const locale = localeOf(formData)
  const { supabase } = await requireActionUser(locale, 'business')

  const { data, error } = await supabase.from('listings').delete().eq('id', str(formData, 'listing_id')).select('id')
  if (error || !data || data.length === 0) go(locale, '/business', 'err', 'delete_failed')
  go(locale, '/business', 'ok', 'listing_deleted')
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

  // With a fixed listing fee the database sets the amount. Otherwise the business types it.
  const settings = await getPaymentSettings()
  const amount = settings.fee ?? num(formData, 'amount')
  if (amount == null || amount <= 0) go(locale, '/business', 'err', 'amount_invalid')

  const reference = optStr(formData, 'reference')?.slice(0, 100) ?? null
  if (!reference) go(locale, '/business', 'err', 'reference_required')

  const { error } = await supabase.from('payments').insert({
    listing_id: str(formData, 'listing_id'),
    amount,
    currency: 'USD',
    method: oneOf(str(formData, 'method'), PAYMENT_METHODS) ?? 'whish',
    reference,
  })

  if (error) {
    const reason = error.message.includes('one_pending') ? 'payment_already_waiting' : 'reference_used'
    go(locale, '/business', 'err', error.code === '23505' ? reason : 'save_failed')
  }
  go(locale, '/business', 'ok', 'payment_recorded')
}

// Fix the method or transaction number of a payment that has not been confirmed yet.
export async function updatePayment(formData: FormData) {
  const locale = localeOf(formData)
  const { supabase } = await requireActionUser(locale, 'business')

  const reference = optStr(formData, 'reference')?.slice(0, 100) ?? null
  if (!reference) go(locale, '/business', 'err', 'reference_required')

  const { data, error } = await supabase
    .from('payments')
    .update({ method: oneOf(str(formData, 'method'), PAYMENT_METHODS) ?? 'whish', reference })
    .eq('id', str(formData, 'payment_id'))
    .select('id')

  if (error) go(locale, '/business', 'err', error.code === '23505' ? 'reference_used' : 'save_failed')
  if (!data || data.length === 0) go(locale, '/business', 'err', 'save_failed')
  go(locale, '/business', 'ok', 'payment_updated')
}

// Cancel a payment that has not been confirmed yet. The record is kept, marked as cancelled.
export async function cancelPayment(formData: FormData) {
  const locale = localeOf(formData)
  const { supabase } = await requireActionUser(locale, 'business')

  const { data, error } = await supabase
    .from('payments')
    .update({ status: 'cancelled' })
    .eq('id', str(formData, 'payment_id'))
    .select('id')

  if (error || !data || data.length === 0) go(locale, '/business', 'err', 'save_failed')
  go(locale, '/business', 'ok', 'payment_cancelled')
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
