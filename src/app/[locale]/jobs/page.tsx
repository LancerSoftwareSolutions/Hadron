import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getLocaleParam } from '@/lib/auth'
import { getDict } from '@/lib/i18n'
import { AREAS, JOB_TYPES } from '@/lib/constants'
import { first } from '@/lib/format'
import type { ListingWithBusiness } from '@/lib/types'
import { JobNotice } from '@/components/JobNotice'
import { Flash, type SearchParams } from '@/components/Flash'

const SELECT =
  'id, business_id, title, description, job_type, areas, salary_min, salary_max, salary_currency, salary_period, display_name, contact_email, contact_phone, contact_website, status, paid_at, expires_at, created_at, businesses(name, category, areas, address, description, phone, email, website, logo_path, verified)'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const locale = await getLocaleParam(params)
  return { title: getDict(locale).jobsPage.title }
}

export default async function FindWork({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<SearchParams>
}) {
  const locale = await getLocaleParam(params)
  const sp = await searchParams
  const t = getDict(locale)
  const p = t.jobsPage

  const q = first(sp.q).replace(/[,()%*\\]/g, ' ').trim().slice(0, 60)
  const area = (AREAS as readonly string[]).includes(first(sp.area)) ? first(sp.area) : ''
  const type = (JOB_TYPES as readonly string[]).includes(first(sp.type)) ? first(sp.type) : ''
  const filtered = Boolean(q || area || type)

  const supabase = await createClient()
  let query = supabase
    .from('listings')
    .select(SELECT)
    .eq('status', 'active')
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })
    .limit(60)

  if (q) query = query.or(`title.ilike.%${q}%,description.ilike.%${q}%`)
  // A job for "all of Lebanon" matches every area filter.
  if (area) query = query.or(`areas.cs.{${area}},areas.cs.{all}`)
  if (type) query = query.eq('job_type', type)

  const { data } = await query
  const jobs = (data ?? []) as unknown as ListingWithBusiness[]

  return (
    <>
      <section className="hero on-navy">
        <div className="mx-auto w-full max-w-6xl px-4 pb-16 pt-8 md:pb-20 md:pt-12">
          <h1 className="display text-4xl md:text-5xl">{p.title}</h1>
          <p className="mt-3 max-w-xl text-lg text-white/80">{p.sub}</p>
        </div>
      </section>

      <div className="mx-auto w-full max-w-6xl px-4">
        <form method="get" role="search" aria-label={p.searchLabel} className="panel relative z-10 -mt-10 grid gap-3 md:grid-cols-[1fr_12rem_12rem_auto]">
          <div>
            <label htmlFor="q" className="sr-only">
              {p.searchLabel}
            </label>
            <input id="q" name="q" type="search" defaultValue={q} placeholder={p.searchPlaceholder} className="input" />
          </div>
          <div>
            <label htmlFor="area" className="sr-only">
              {t.job.area}
            </label>
            <select id="area" name="area" defaultValue={area} className="input">
              <option value="">{p.allAreas}</option>
              {AREAS.map((a) => (
                <option key={a} value={a}>
                  {t.areas[a]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="type" className="sr-only">
              {t.job.type}
            </label>
            <select id="type" name="type" defaultValue={type} className="input">
              <option value="">{p.allTypes}</option>
              {JOB_TYPES.map((j) => (
                <option key={j} value={j}>
                  {t.jobTypes[j]}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-3">
            <button type="submit" className="btn btn-primary flex-1 md:flex-none">
              {p.search}
            </button>
            {filtered && (
              <Link href={`/${locale}/jobs`} className="btn btn-quiet font-bold">
                {p.clear}
              </Link>
            )}
          </div>
        </form>

        <div className="py-10">
          <Flash t={t} sp={sp} />
          <p className="mb-5 font-bold text-ink-soft">{p.openings(jobs.length)}</p>

          {jobs.length > 0 ? (
            <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {jobs.map((job) => (
                <JobNotice key={job.id} job={job} locale={locale} t={t} />
              ))}
            </ul>
          ) : (
            <div className="panel max-w-xl">
              <p className="font-bold">{filtered ? p.empty : p.emptyBoard}</p>
              <p className="mt-1 text-ink-soft">{filtered ? p.emptyHint : p.emptyBoardHint}</p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
