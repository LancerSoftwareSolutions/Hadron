import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getLocaleParam, getSessionUser } from '@/lib/auth'
import { getDict } from '@/lib/i18n'
import { formatDate, formatSalary, telUrl, whatsappUrl } from '@/lib/format'
import { areasLabel } from '@/lib/areas'
import { contactFor, EMAIL_RE, safeWebsiteUrl } from '@/lib/contact'
import type { Application, ListingWithBusiness } from '@/lib/types'
import { applyToListing, withdrawApplication } from '@/app/actions/seeker'
import { BusinessMark, VerifiedMark } from '@/components/JobNotice'
import { Flash, type SearchParams } from '@/components/Flash'
import { SubmitButton } from '@/components/SubmitButton'
import { TextArea } from '@/components/Field'

type Props = { params: Promise<{ locale: string; id: string }>; searchParams: Promise<SearchParams> }

const SELECT =
  'id, business_id, title, description, job_type, areas, salary_min, salary_max, salary_currency, display_name, contact_email, contact_phone, contact_website, status, paid_at, expires_at, created_at, businesses(name, category, areas, address, description, phone, email, website, logo_path, verified)'

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const supabase = await createClient()
  const { data } = await supabase.from('listings').select('title, businesses(name)').eq('id', id).maybeSingle()
  if (!data) return {}
  const business = data.businesses as unknown as { name: string } | null
  return { title: business ? `${data.title} - ${business.name}` : data.title }
}

export default async function JobPage({ params, searchParams }: Props) {
  const locale = await getLocaleParam(params)
  const { id } = await params
  const sp = await searchParams
  const t = getDict(locale)

  const supabase = await createClient()
  const { data } = await supabase.from('listings').select(SELECT).eq('id', id).maybeSingle()
  if (!data) notFound()

  const job = data as unknown as ListingWithBusiness
  const business = job.businesses
  const c = contactFor(job, business)
  const isOpen = job.status === 'active' && job.expires_at !== null && new Date(job.expires_at) > new Date()

  const user = await getSessionUser()
  let application: Application | null = null
  let hasCv = false
  if (user?.role === 'seeker') {
    const [{ data: app }, { data: profile }] = await Promise.all([
      supabase.from('applications').select('id, listing_id, seeker_id, cover_note, status, created_at').eq('listing_id', id).eq('seeker_id', user.id).maybeSingle(),
      supabase.from('seeker_profiles').select('cv_path').eq('user_id', user.id).maybeSingle(),
    ])
    application = app as Application | null
    hasCv = Boolean(profile?.cv_path)
  }

  const here = `/${locale}/jobs/${id}`
  const areaLabel = areasLabel(job.areas, t, locale, 8)

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8">
      <Link href={`/${locale}`} className="font-bold underline">
        {t.job.back}
      </Link>

      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_22rem]">
        <article>
          <Flash t={t} sp={sp} />
          <div className="flex items-center gap-3">
            {business && <BusinessMark name={c.name} logoPath={c.logoPath} />}
            <p dir="auto" className="flex items-center gap-2 font-bold text-ink-soft">
              {c.name}
              {c.verified && <VerifiedMark label={t.job.verified} />}
            </p>
          </div>
          <h1 dir="auto" className="display mt-3 text-[2rem] sm:text-4xl">{job.title}</h1>

          <dl className="mt-6 grid max-w-2xl grid-cols-1 overflow-hidden rounded-xl border border-line bg-paper sm:grid-cols-3">
            <div className="p-3 text-center">
              <dt className="sr-only">{t.job.type}</dt>
              <dd className="font-bold">{t.jobTypes[job.job_type]}</dd>
            </div>
            <div className="border-t border-line p-3 text-center sm:border-s sm:border-t-0">
              <dt className="sr-only">{t.job.area}</dt>
              <dd className="font-bold">{areaLabel}</dd>
            </div>
            <div className="border-t border-line p-3 text-center sm:border-s sm:border-t-0">
              <dt className="sr-only">{t.job.pay}</dt>
              <dd className="font-bold">
                <bdi>{formatSalary(job, t)}</bdi>
              </dd>
            </div>
          </dl>
          {isOpen && <p className="mt-3 text-sm text-ink-soft">{t.job.openUntil(formatDate(job.expires_at, locale))}</p>}

          <h2 className="display mt-10 text-xl">{t.job.about}</h2>
          <p dir="auto" className="mt-3 max-w-prose whitespace-pre-line">{job.description}</p>

          {business?.description && c.sameBusiness && (
            <>
              <h2 className="display mt-10 text-xl">{t.job.aboutBusiness}</h2>
              <p dir="auto" className="mt-3 max-w-prose whitespace-pre-line">{business.description}</p>
              {business.address && (
                <p dir="auto" className="mt-2 text-ink-soft">
                  {business.address}
                </p>
              )}
            </>
          )}
        </article>

        <aside className="grid content-start gap-6">
          <section className="panel">
            <h2 className="display text-xl">{t.job.apply.title}</h2>

            {!isOpen ? (
              <p className="mt-3 text-ink-soft">{t.job.apply.closed}</p>
            ) : !user ? (
              <div className="mt-4 grid gap-3">
                <Link href={`/${locale}/login?next=${encodeURIComponent(here)}`} className="btn btn-primary">
                  {t.job.apply.loginToApply}
                </Link>
                <Link href={`/${locale}/signup`} className="btn btn-outline">
                  {t.job.apply.signupToApply}
                </Link>
              </div>
            ) : user.role !== 'seeker' ? (
              <p className="mt-3 text-ink-soft">{t.job.apply.employerNote}</p>
            ) : application ? (
              <div className="mt-3 grid gap-3">
                <p>{t.job.apply.applied(formatDate(application.created_at, locale))}</p>
                <p>
                  <span className="badge badge-live">{t.appStatus[application.status]}</span>
                </p>
                <form action={withdrawApplication}>
                  <input type="hidden" name="locale" value={locale} />
                  <input type="hidden" name="listing_id" value={id} />
                  <input type="hidden" name="application_id" value={application.id} />
                  <SubmitButton className="btn btn-danger">{t.job.apply.withdraw}</SubmitButton>
                </form>
              </div>
            ) : (
              <form action={applyToListing} className="mt-4 grid gap-4">
                <input type="hidden" name="locale" value={locale} />
                <input type="hidden" name="listing_id" value={id} />
                <TextArea label={t.job.apply.note} name="cover_note" rows={4} placeholder={t.job.apply.notePlaceholder} />
                {!hasCv && (
                  <p className="hint">
                    {t.job.apply.addCv}{' '}
                    <Link href={`/${locale}/seeker`} className="font-bold text-ink underline">
                      {t.job.apply.editProfile}
                    </Link>
                  </p>
                )}
                <SubmitButton pending={t.job.apply.sending}>{t.job.apply.submit}</SubmitButton>
              </form>
            )}
          </section>

          {(c.phone || c.email || c.website) && (
            <section className="panel">
              <h2 className="display text-xl">{t.job.contact}</h2>
              <ul className="mt-3 grid gap-2">
                {c.phone && (
                  <li className="flex flex-wrap gap-2">
                    <a href={whatsappUrl(c.phone)} className="btn btn-outline" rel="noopener">
                      {t.job.whatsapp}
                    </a>
                    <a href={telUrl(c.phone)} className="btn btn-outline">
                      {t.job.call}
                    </a>
                    <bdi className="w-full text-sm text-ink-soft">{c.phone}</bdi>
                  </li>
                )}
                {c.email && EMAIL_RE.test(c.email) && (
                  <li>
                    <a href={`mailto:${c.email}`} className="break-all font-bold underline">
                      {c.email}
                    </a>
                  </li>
                )}
                {c.website && safeWebsiteUrl(c.website) && (
                  <li>
                    <a
                      href={safeWebsiteUrl(c.website) ?? '#'}
                      className="break-all font-bold underline"
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      {t.job.website}
                    </a>
                  </li>
                )}
              </ul>
            </section>
          )}
        </aside>
      </div>
    </div>
  )
}
