import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getLocaleParam, requireRole } from '@/lib/auth'
import { getDict, type Dict, type Locale } from '@/lib/i18n'
import { CATEGORIES, LOGO_MAX_MB, PAYMENT_METHODS } from '@/lib/constants'
import { daysLeft, effectiveStatus, formatDate, logoUrl } from '@/lib/format'
import { formatFee, getPaymentSettings, type PaymentSettings } from '@/lib/settings'
import type { Business, Listing, Payment } from '@/lib/types'
import {
  cancelPayment,
  closeListing,
  createListing,
  deleteListing,
  recordPayment,
  saveBusiness,
  updatePayment,
} from '@/app/actions/business'
import { ListingFields } from '@/components/ListingFields'
import { Field, SelectField, TextArea } from '@/components/Field'
import { AreaPicker } from '@/components/AreaPicker'
import { CategoryField } from '@/components/CategoryField'
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

  const settings = await getPaymentSettings()
  const categoryOptions = CATEGORIES.map((c) => ({ value: c, label: t.categories[c] }))

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
                settings={settings}
              />
            ))}
          </ul>

          <details className="panel" open={listings.length === 0}>
            <summary className="cursor-pointer font-extrabold">{t.business.newListing}</summary>
            <form action={createListing} className="mt-5 grid gap-4">
              <input type="hidden" name="locale" value={locale} />
              <input type="hidden" name="business_id" value={business.id} />
              <ListingFields
                t={t}
                idPrefix="new"
                defaults={{
                  title: '',
                  description: '',
                  job_type: 'full_time',
                  areas: business.areas,
                  salary_min: null,
                  salary_max: null,
                  salary_currency: 'USD',
                  salary_period: 'monthly',
                  display_name: business.name,
                  contact_email: business.email,
                  contact_phone: business.phone,
                  contact_website: business.website,
                }}
              />
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
          <CategoryField
            label={t.business.category}
            placeholder={t.business.chooseCategory}
            options={categoryOptions}
            customOption={t.categories.custom}
            customLabel={t.business.categoryCustomLabel}
            customPlaceholder={t.business.categoryCustomPlaceholder}
            defaultValue={business?.category}
          />
          <AreaPicker idPrefix="business" label={t.business.areasBusiness} hint={t.business.areasHint} selected={business?.areas ?? []} labels={t.areas} />
          <Field label={t.business.address} name="address" defaultValue={business?.address} autoComplete="street-address" />
          <TextArea label={t.business.description} name="description" rows={4} defaultValue={business?.description} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t.business.phone} name="phone" type="tel" inputMode="tel" defaultValue={business?.phone ?? user.phone} />
            <Field label={t.business.email} name="email" type="email" inputMode="email" defaultValue={business?.email ?? user.email} />
          </div>
          <TextArea label={t.business.website} name="website" rows={2} noResize inputMode="url" autoComplete="url" defaultValue={business?.website} placeholder={t.business.websitePlaceholder} />
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
  settings,
}: {
  listing: Listing
  payments: Payment[]
  applicants: number
  locale: Locale
  t: Dict
  settings: PaymentSettings
}) {
  const status = effectiveStatus(listing)
  const latest = payments[0]
  // Only jobs that never had a payment can be deleted. Others can be closed.
  const canDelete = payments.length === 0
  const remaining = status === 'active' ? daysLeft(listing.expires_at) : 0
  const renewSoon = status === 'active' && remaining <= 7
  const canPay = status === 'pending_payment' || status === 'expired' || renewSoon
  const hasPending = latest?.status === 'pending'
  const badge = status === 'active' ? 'badge-live' : status === 'pending_payment' ? 'badge-wait' : ''
  const methodLabel = (m: string) => (t.business.methods as Record<string, string>)[m] ?? m
  const methodOptions = PAYMENT_METHODS.map((m) => ({ value: m, label: t.business.methods[m] }))
  const fixedFee = settings.fee != null ? formatFee(settings.fee) : null

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
          <Link href={`/${locale}/business/listings/${listing.id}/edit`} className="btn btn-outline">
            {t.business.edit}
          </Link>
        )}
      </div>

      {(status !== 'closed' || canDelete) && (
        <details className="mt-4 rounded-lg border border-line">
          <summary className="cursor-pointer px-4 py-3 font-bold text-ink-soft">{t.business.closeOrDelete}</summary>
          <div className="grid gap-5 border-t border-line p-4">
            {status !== 'closed' && (
              <div>
                <p className="font-semibold">{t.business.closeWarning}</p>
                <form action={closeListing} className="mt-3">
                  <input type="hidden" name="locale" value={locale} />
                  <input type="hidden" name="listing_id" value={listing.id} />
                  <SubmitButton className="btn btn-danger">{t.business.closeConfirm}</SubmitButton>
                </form>
              </div>
            )}
            {canDelete ? (
              <div>
                <p className="font-semibold">{t.business.deleteWarning(applicants)}</p>
                <form action={deleteListing} className="mt-3">
                  <input type="hidden" name="locale" value={locale} />
                  <input type="hidden" name="listing_id" value={listing.id} />
                  <SubmitButton className="btn btn-danger">{t.business.deleteConfirm}</SubmitButton>
                </form>
              </div>
            ) : (
              <p className="text-sm text-ink-soft">{t.business.keepRecords}</p>
            )}
          </div>
        </details>
      )}

      {renewSoon && <p className="mt-4 rounded-lg bg-sky-soft px-4 py-3 font-semibold">{t.business.renewSoon(remaining)}</p>}

      {canPay && (
        <div className="mt-5 border-t-2 border-dashed border-line-strong pt-5">
          <h4 className="font-extrabold">{status === 'pending_payment' ? t.business.payTitle : t.business.renewTitle}</h4>

          {hasPending ? (
            <>
              <p className="mt-2 font-semibold text-cedar">{t.business.waiting}</p>
              <p className="mt-1 text-sm text-ink-soft">
                {methodLabel(latest.method)}, <bdi>{latest.reference}</bdi>
              </p>
              <details className="mt-3">
                <summary className="cursor-pointer font-bold text-navy underline">{t.business.fixOrCancel}</summary>
                <p className="hint">{t.business.fixOrCancelHint}</p>
                <form action={updatePayment} className="mt-3 grid gap-4 sm:grid-cols-2">
                  <input type="hidden" name="locale" value={locale} />
                  <input type="hidden" name="payment_id" value={latest.id} />
                  <SelectField label={t.business.method} name="method" id={`fix-method-${latest.id}`} options={methodOptions} defaultValue={latest.method} />
                  <Field label={t.business.reference} name="reference" id={`fix-reference-${latest.id}`} required maxLength={100} defaultValue={latest.reference} />
                  <div className="sm:col-span-2">
                    <SubmitButton className="btn btn-outline" pending={t.business.saving}>
                      {t.business.saveChanges}
                    </SubmitButton>
                  </div>
                </form>
                <form action={cancelPayment} className="mt-3">
                  <input type="hidden" name="locale" value={locale} />
                  <input type="hidden" name="payment_id" value={latest.id} />
                  <SubmitButton className="btn btn-danger">{t.business.cancelPayment}</SubmitButton>
                </form>
              </details>
            </>
          ) : (
            <>
              {latest?.status === 'rejected' && <p className="mt-2 font-semibold text-marker">{t.business.rejected}</p>}
              <p className="mt-2 text-ink-soft">{t.business.payIntro(fixedFee ?? '')}</p>
              {settings.whishNumber && <p className="mt-1 font-bold">{t.business.payTo(settings.whishNumber)}</p>}

              <div className="mt-4 rounded-lg border-2 border-dashed border-line-strong p-3">
                <p className="label !mb-0">{t.business.paymentCode}</p>
                <p className="display text-2xl">
                  <bdi>{listing.payment_code}</bdi>
                </p>
                <p className="hint">{t.business.paymentCodeHelp}</p>
              </div>
              {fixedFee && <p className="mt-4 text-lg font-extrabold">{t.business.amountFixed(fixedFee)}</p>}

              <form action={recordPayment} className={`mt-4 grid gap-4 ${fixedFee ? 'sm:grid-cols-2' : 'sm:grid-cols-3'}`}>
                <input type="hidden" name="locale" value={locale} />
                <input type="hidden" name="listing_id" value={listing.id} />
                {!fixedFee && (
                  <Field label={t.business.amount} name="amount" id={`amount-${listing.id}`} type="number" min={0} step="0.01" inputMode="decimal" required />
                )}
                <SelectField label={t.business.method} name="method" id={`method-${listing.id}`} options={methodOptions} />
                <Field label={t.business.reference} name="reference" id={`reference-${listing.id}`} hint={t.business.referenceHint} required maxLength={100} />
                <div className={fixedFee ? 'sm:col-span-2' : 'sm:col-span-3'}>
                  <SubmitButton pending={t.business.saving}>{t.business.recordPayment}</SubmitButton>
                </div>
              </form>
            </>
          )}
        </div>
      )}

      {payments.length > 0 && (
        <details className="mt-4">
          <summary className="cursor-pointer font-bold text-navy underline">
            {t.business.paymentHistory} ({payments.length})
          </summary>
          <ul className="mt-3 grid gap-2">
            {payments.map((p) => (
              <li key={p.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-line px-3 py-2 text-sm">
                <span>
                  {formatDate(p.created_at, locale)}, <bdi>${formatFee(Number(p.amount))}</bdi>, {methodLabel(p.method)}, <bdi>{p.reference}</bdi>
                </span>
                <span className={`badge ${p.status === 'confirmed' ? 'badge-live' : p.status === 'pending' ? 'badge-wait' : 'badge-bad'}`}>
                  {t.admin.paymentStatus[p.status]}
                </span>
              </li>
            ))}
          </ul>
        </details>
      )}
    </li>
  )
}
