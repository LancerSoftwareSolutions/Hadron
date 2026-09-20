import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getLocaleParam, requireRole } from '@/lib/auth'
import { getDict } from '@/lib/i18n'
import type { Business, Listing } from '@/lib/types'
import { updateListing } from '@/app/actions/business'
import { ListingFields } from '@/components/ListingFields'
import { Flash, type SearchParams } from '@/components/Flash'
import { SubmitButton } from '@/components/SubmitButton'

type Props = { params: Promise<{ locale: string; id: string }>; searchParams: Promise<SearchParams> }

export default async function EditListing({ params, searchParams }: Props) {
  const locale = await getLocaleParam(params)
  const { id } = await params
  const sp = await searchParams
  const t = getDict(locale)
  const user = await requireRole(locale, 'business', `/business/listings/${id}/edit`)

  const supabase = await createClient()
  const { data: listingRow } = await supabase.from('listings').select('*').eq('id', id).maybeSingle()
  if (!listingRow) notFound()
  const listing = listingRow as Listing

  // Only the owner of this job's business may edit it.
  const { data: businessRow } = await supabase
    .from('businesses')
    .select('*')
    .eq('id', listing.business_id)
    .eq('owner_id', user.id)
    .maybeSingle()
  if (!businessRow) notFound()
  const business = businessRow as Business

  if (listing.status === 'closed') redirect(`/${locale}/business?err=closed_no_edit`)

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10">
      <Link href={`/${locale}/business`} className="font-bold text-navy underline">
        {t.business.back}
      </Link>
      <h1 className="display mb-6 mt-4 text-3xl">{t.business.editTitle}</h1>
      <Flash t={t} sp={sp} />

      <form action={updateListing} className="panel grid gap-4">
        <input type="hidden" name="locale" value={locale} />
        <input type="hidden" name="listing_id" value={listing.id} />
        <ListingFields
          t={t}
          idPrefix="edit"
          defaults={{
            title: listing.title,
            description: listing.description,
            job_type: listing.job_type,
            areas: listing.areas,
            salary_min: listing.salary_min,
            salary_max: listing.salary_max,
            salary_currency: listing.salary_currency,
            display_name: listing.display_name ?? business.name,
            contact_email: listing.contact_email ?? business.email,
            contact_phone: listing.contact_phone ?? business.phone,
            contact_website: listing.contact_website ?? business.website,
          }}
        />
        <div>
          <SubmitButton pending={t.business.saving}>{t.business.saveChanges}</SubmitButton>
        </div>
      </form>
    </div>
  )
}
