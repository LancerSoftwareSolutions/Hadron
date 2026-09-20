import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getLocaleParam, requireRole } from '@/lib/auth'
import { getDict } from '@/lib/i18n'
import { APPLICATION_STATUSES } from '@/lib/constants'
import { formatDate, telUrl, whatsappUrl } from '@/lib/format'
import type { Application, SeekerProfile } from '@/lib/types'
import { updateApplicationStatus } from '@/app/actions/business'
import { Flash, type SearchParams } from '@/components/Flash'
import { SubmitButton } from '@/components/SubmitButton'

type Props = { params: Promise<{ locale: string; id: string }>; searchParams: Promise<SearchParams> }

interface ApplicantRow extends Application {
  seeker: {
    full_name: string
    phone: string | null
    seeker_profiles: SeekerProfile | SeekerProfile[] | null
  } | null
}

export default async function ApplicantsPage({ params, searchParams }: Props) {
  const locale = await getLocaleParam(params)
  const { id } = await params
  const sp = await searchParams
  const t = getDict(locale)
  const user = await requireRole(locale, 'business', `/business/listings/${id}`)

  const supabase = await createClient()
  const { data: listing } = await supabase.from('listings').select('id, title, business_id').eq('id', id).maybeSingle()
  if (!listing) notFound()

  // Only the owner of this listing's business may see its applicants.
  const { data: owned } = await supabase
    .from('businesses')
    .select('id')
    .eq('id', listing.business_id)
    .eq('owner_id', user.id)
    .maybeSingle()
  if (!owned) notFound()

  const { data } = await supabase
    .from('applications')
    .select(
      'id, listing_id, seeker_id, cover_note, status, created_at, seeker:profiles!applications_seeker_id_fkey(full_name, phone, seeker_profiles(headline, summary, skills, languages, experience_years, area, cv_path))',
    )
    .eq('listing_id', id)
    .order('created_at', { ascending: false })
  const applicants = (data ?? []) as unknown as ApplicantRow[]

  const detailsOf = (a: ApplicantRow): SeekerProfile | null => {
    const raw = a.seeker?.seeker_profiles
    return (Array.isArray(raw) ? raw[0] : raw) ?? null
  }

  // CVs are private, so each one gets a short-lived link.
  const cvLinks = await Promise.all(
    applicants.map(async (a) => {
      const path = detailsOf(a)?.cv_path
      if (!path) return null
      const { data: signed } = await supabase.storage.from('cvs').createSignedUrl(path, 600)
      return signed?.signedUrl ?? null
    }),
  )

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10">
      <Link href={`/${locale}/business`} className="font-bold underline">
        {t.business.back}
      </Link>
      <h1 className="display mt-4 text-3xl">{listing.title}</h1>
      <h2 className="mb-6 mt-1 text-lg font-bold text-ink-soft">
        {t.business.applicantsTitle}: {t.business.applicants(applicants.length)}
      </h2>

      <Flash t={t} sp={sp} />

      {applicants.length === 0 && <p className="panel text-ink-soft">{t.business.noApplicants}</p>}

      <ul className="grid gap-4">
        {applicants.map((a, i) => {
          const d = detailsOf(a)
          const phone = a.seeker?.phone
          return (
            <li key={a.id} className="panel">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 dir="auto" className="text-lg font-extrabold">{a.seeker?.full_name}</h3>
                  {d?.headline && (
                    <p dir="auto" className="font-semibold text-ink-soft">
                      {d.headline}
                    </p>
                  )}
                  <p className="text-sm text-ink-soft">{t.business.appliedOn(formatDate(a.created_at, locale))}</p>
                </div>
                <span className="badge">{t.appStatus[a.status]}</span>
              </div>

              {a.cover_note && (
                <div className="mt-4">
                  <p className="label">{t.business.coverNote}</p>
                  <p dir="auto" className="whitespace-pre-line">{a.cover_note}</p>
                </div>
              )}

              {d && (
                <dl className="mt-4 grid gap-2 text-[0.95rem]">
                  {d.summary && (
                    <p dir="auto" className="whitespace-pre-line">
                      {d.summary}
                    </p>
                  )}
                  {d.experience_years != null && <p className="font-semibold">{t.business.experience(d.experience_years)}</p>}
                  {d.skills.length > 0 && (
                    <div>
                      <dt className="label">{t.business.skills}</dt>
                      <dd className="flex flex-wrap gap-2">
                        {d.skills.map((s) => (
                          <span key={s} className="badge">
                            {s}
                          </span>
                        ))}
                      </dd>
                    </div>
                  )}
                  {d.languages.length > 0 && (
                    <div>
                      <dt className="label">{t.business.languages}</dt>
                      <dd>{d.languages.map((l) => (t.seeker.langs as Record<string, string>)[l] ?? l).join(locale === 'ar' ? '، ' : ', ')}</dd>
                    </div>
                  )}
                </dl>
              )}

              <div className="mt-4 flex flex-wrap items-center gap-2">
                {phone && (
                  <>
                    <a href={whatsappUrl(phone)} rel="noopener" className="btn btn-outline">
                      {t.job.whatsapp}
                    </a>
                    <a href={telUrl(phone)} className="btn btn-outline">
                      {t.job.call}
                    </a>
                    <bdi className="text-sm text-ink-soft">{phone}</bdi>
                  </>
                )}
                {cvLinks[i] ? (
                  <a href={cvLinks[i]!} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                    {t.business.openCv}
                  </a>
                ) : (
                  <span className="text-sm text-ink-soft">{t.business.noCv}</span>
                )}
              </div>

              <form action={updateApplicationStatus} className="mt-5 flex flex-wrap items-end gap-3 border-t-2 border-dashed border-line-strong pt-4">
                <input type="hidden" name="locale" value={locale} />
                <input type="hidden" name="listing_id" value={id} />
                <input type="hidden" name="application_id" value={a.id} />
                <div>
                  <label htmlFor={`status-${a.id}`} className="label">
                    {t.business.setStatus}
                  </label>
                  <select id={`status-${a.id}`} name="status" defaultValue={a.status} className="input">
                    {APPLICATION_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {t.appStatus[s]}
                      </option>
                    ))}
                  </select>
                </div>
                <SubmitButton className="btn btn-outline">{t.business.updateStatus}</SubmitButton>
              </form>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
