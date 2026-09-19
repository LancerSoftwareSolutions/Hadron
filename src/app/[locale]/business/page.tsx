import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getLocaleParam, requireRole } from '@/lib/auth'
import { getDict, type Dict, type Locale } from '@/lib/i18n'
import { AREAS, CATEGORIES, CURRENCIES, JOB_TYPES, LISTING_FEE_USD, LOGO_MAX_MB, PAYMENT_METHODS, WHISH_NUMBER } from '@/lib/constants'
import { effectiveStatus, formatDate, logoUrl } from '@/lib/format'
import type { Business, Listing, Payment } from '@/lib/types'
import { closeListing, createListing, recordPayment, saveBusiness } from '@/app/actions/business'
import { Field, SelectField, TextArea } from '@/components/Field'
import { Flash, type SearchParams } from '@/components/Flash'
import { SubmitButton } from '@/components/SubmitButton'
import { UploadField } from '@/components/UploadField'

type Props = { params: Promise<{ locale: string }>; searchParams: Promise<SearchParams> }

export default async function BusinessPage({ params, searchParams }: Props) {
  const locale = await getLocaleParam(params)
  const sp = await searchParams
  const t = getDict(locale)
  const user = await requireRole(locale, 'business', '/business')

  const supabase = await createClient()
  const { data: businessRow } = await supabase
    .from('businesses')
    .select('*')
    .eq('owner_id', user.id)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle()
  const business = businessRow as Business | null

  let listings: Listing[] = []
  let payments: Payment[] = []
  const applicantCounts: Record<string, number> = {}

  if (business) {
    const { data: l } = await supabase
      .from('listings')
      .select('*')
      .eq('business_id', business.id)
      .order('created_at', { ascending: false })
    listings = (l ?? []) as Listing[]

    const ids = listings.map((x) => x.id)
    if (ids.length > 0) {
      const [{ data: p }, { data: a }] = await Promise.all([
        supabase.from('payments').select('*').in('listing_id', ids).order('created_at', { ascending: false }),
        supabase.from('applications').select('listing_id').in('listing_id', ids),
      ])
      payments = (p ?? []) as Payment[]
      for (const row of a ?? []) applicantCounts[row.listing_id] = (applicantCounts[row.listing_id] ?? 0) + 1
    }
  }

  const categoryOptions = CATEGORIES.map((c) => ({ value: c, label: t.categories[c] }))
  const areaOptions = AREAS.map((a) => ({ value: a, label: t.areas[a] }))

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10">
      <h1 className="display text-3xl">{business ? t.business.title : t.business.createTitle}</h1>
      {!business && <p className="mt-2 text-ink-soft">{t.business.createIntro}</p>}
      <div className="mt-6">
        <Flash t={t} sp={sp} />
      </div>

      {business && (
        <section className="mb-12">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="display text-2xl">{t.business.listingsTitle}</h2>
          </div>

          {listings.length === 0 && <p className="mb-4 text-ink-soft">{t.business.noListings}</p>}

          <ul className="mb-6 grid gap-4">
            {listings.map((l) => (
              <ListingRow
                key={l.id}
                listing={l}
                payments={payments.filter((p) => p.listing_id === l.id)}
                applicants={applicantCounts[l.id] ?? 0}
                locale={locale}
                t={t}
              />
            ))}
          </ul>

          <details className="panel" open={listings.length === 0}>
            <summary className="cursor-pointer font-extrabold">{t.business.newListing}</summary>
            <form action={createListing} className="mt-5 grid gap-4">
              <input type="hidden" name="locale" value={locale} />
              <input type="hidden" name="business_id" value={business.id} />
              <Field label={t.business.jobTitle} name="title" id="listing-title" required />
              <TextArea label={t.business.jobDescription} name="description" id="listing-description" required rows={6} hint={t.business.jobDescriptionHint} />
              <div className="grid gap-4 sm:grid-cols-2">
                <SelectField label={t.business.jobType} name="job_type" options={JOB_TYPES.map((j) => ({ value: j, label: t.jobTypes[j] }))} defaultValue="full_time" />
                <SelectField label={t.business.area} name="area" id="listing-area" options={areaOptions} placeholder={t.business.chooseArea} defaultValue={business.area} />
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <Field label={t.business.salaryMin} name="salary_min" type="number" min={0} inputMode="numeric" />
                <Field label={t.business.salaryMax} name="salary_max" type="number" min={0} inputMode="numeric" />
                <SelectField label={t.business.currency} name="salary_currency" options={CURRENCIES.map((c) => ({ value: c, label: c }))} defaultValue="USD" />
              </div>
              <div>
                <SubmitButton pending={t.business.saving}>{t.business.createListing}</SubmitButton>
              </div>
            </form>
          </details>
        </section>
      )}

      <section>
        {business && (
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <h2 className="display text-2xl">{t.business.profileTitle}</h2>
            <span className={`badge ${business.verified ? 'badge-live' : ''}`}>
              {business.verified ? t.business.verified : t.business.notVerified}
            </span>
          </div>
        )}
        <form action={saveBusiness} className="panel grid gap-4">
          <input type="hidden" name="locale" value={locale} />
          {business && <input type="hidden" name="business_id" value={business.id} />}
          <Field label={t.business.name} name="name" required defaultValue={business?.name} />
          <div className="grid gap-4 sm:grid-cols-2">
            <SelectField label={t.business.category} name="category" options={categoryOptions} placeholder={t.business.chooseCategory} defaultValue={business?.category} />
            <SelectField label={t.business.area} name="area" options={areaOptions} placeholder={t.business.chooseArea} defaultValue={business?.area} />
          </div>
          <Field label={t.business.address} name="address" defaultValue={business?.address} autoComplete="street-address" />
          <TextArea label={t.business.description} name="description" rows={4} defaultValue={business?.description} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t.business.phone} name="phone" type="tel" inputMode="tel" defaultValue={business?.phone ?? user.phone} />
            <Field label={t.business.email} name="email" type="email" inputMode="email" defaultValue={business?.email ?? user.email} />
          </div>
          <Field label={t.business.website} name="website" inputMode="text" defaultValue={business?.website} />
          <UploadField
            bucket="logos"
            name="logo_path"
            userId={user.id}
            accept="image/png,image/jpeg,image/webp"
            maxMb={LOGO_MAX_MB}
            label={t.business.logo}
            hint={t.business.logoHint}
            previewUrl={logoUrl(business?.logo_path ?? null)}
            t={t.upload}
          />
          <div>
            <SubmitButton pending={t.business.saving}>{t.business.save}</SubmitButton>
          </div>
        </form>
      </section>
    </div>
  )
}

function ListingRow({
  listing,
  payments,
  applicants,
  locale,
  t,
}: {
  listing: Listing
  payments: Payment[]
  applicants: number
  locale: Locale
  t: Dict
}) {
  const status = effectiveStatus(listing)
  const latest = payments[0]
  const needsPayment = status === 'pending_payment' || status === 'expired'
  const badge = status === 'active' ? 'badge-live' : status === 'pending_payment' ? 'badge-wait' : ''

  return (
    <li className="panel">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 dir="auto" className="text-lg font-extrabold">{listing.title}</h3>
          {status === 'active' && (
            <p className="text-sm text-ink-soft">{t.business.liveUntil(formatDate(listing.expires_at, locale))}</p>
          )}
        </div>
        <span className={`badge ${badge}`}>{t.business.status[status]}</span>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Link href={`/${locale}/business/listings/${listing.id}`} className="btn btn-outline">
          {t.business.viewApplicants}
        </Link>
        <span className="text-sm font-bold text-ink-soft">{t.business.applicants(applicants)}</span>
        {status !== 'closed' && (
          <form action={closeListing} className="ms-auto">
            <input type="hidden" name="locale" value={locale} />
            <input type="hidden" name="listing_id" value={listing.id} />
            <SubmitButton className="btn btn-danger">{t.business.close}</SubmitButton>
          </form>
        )}
      </div>

      {needsPayment && (
        <div className="mt-5 border-t-2 border-dashed border-line-strong pt-5">
          <h4 className="font-extrabold">{status === 'expired' ? t.business.renewTitle : t.business.payTitle}</h4>

          {latest?.status === 'pending' ? (
            <p className="mt-2 font-semibold text-cedar">{t.business.waiting}</p>
          ) : (
            <>
              {latest?.status === 'rejected' && <p className="mt-2 font-semibold text-marker">{t.business.rejected}</p>}
              <p className="mt-2 text-ink-soft">{t.business.payIntro(LISTING_FEE_USD)}</p>
              {WHISH_NUMBER && <p className="mt-1 font-bold">{t.business.payTo(WHISH_NUMBER)}</p>}
              <form action={recordPayment} className="mt-4 grid gap-4 sm:grid-cols-3">
                <input type="hidden" name="locale" value={locale} />
                <input type="hidden" name="listing_id" value={listing.id} />
                <Field label={t.business.amount} name="amount" id={`amount-${listing.id}`} type="number" min={0} step="0.01" inputMode="decimal" required defaultValue={LISTING_FEE_USD || undefined} />
                <SelectField label={t.business.method} name="method" id={`method-${listing.id}`} options={PAYMENT_METHODS.map((m) => ({ value: m, label: t.business.methods[m] }))} />
                <Field label={t.business.reference} name="reference" id={`reference-${listing.id}`} hint={t.business.referenceHint} required />
                <div className="sm:col-span-3">
                  <SubmitButton pending={t.business.saving}>{t.business.recordPayment}</SubmitButton>
                </div>
              </form>
            </>
          )}
        </div>
      )}
    </li>
  )
}
