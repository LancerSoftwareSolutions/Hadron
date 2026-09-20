import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getLocaleParam } from '@/lib/auth'
import { getDict } from '@/lib/i18n'
import type { ListingWithBusiness } from '@/lib/types'
import { JobNotice } from '@/components/JobNotice'
import { Flash, type SearchParams } from '@/components/Flash'

const SELECT =
  'id, business_id, title, description, job_type, areas, salary_min, salary_max, salary_currency, display_name, contact_email, contact_phone, contact_website, status, paid_at, expires_at, created_at, businesses(name, category, areas, address, description, phone, email, website, logo_path, verified)'

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="M15.5 15.5L21 21" />
    </svg>
  )
}

function BriefcaseIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="3" y="7" width="18" height="13" rx="2.5" />
      <path d="M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7M3 13h18" />
    </svg>
  )
}

export default async function Home({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<SearchParams>
}) {
  const locale = await getLocaleParam(params)
  const sp = await searchParams
  const t = getDict(locale)

  const supabase = await createClient()
  const { data } = await supabase
    .from('listings')
    .select(SELECT)
    .eq('status', 'active')
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })
    .limit(6)
  const jobs = (data ?? []) as unknown as ListingWithBusiness[]

  return (
    <>
      <section className="hero on-navy">
        <div className="mx-auto w-full max-w-6xl px-4 pb-12 pt-10 md:pb-20 md:pt-16">
          <h1 className="display max-w-3xl text-[2.1rem] sm:text-5xl md:text-6xl">{t.home.title}</h1>
          <p className="mt-4 max-w-xl text-lg text-white/80">{t.home.sub}</p>

          <div className="mt-9 grid max-w-4xl gap-4 md:grid-cols-2">
            <div className="path-card">
              <span className="flex size-11 items-center justify-center rounded-full bg-sky-soft text-navy">
                <SearchIcon />
              </span>
              <h2 className="display mt-2 text-2xl">{t.home.seekerTitle}</h2>
              <p className="text-ink-soft">{t.home.seekerText}</p>
              <Link href={`/${locale}/jobs`} className="btn btn-primary mt-4">
                {t.home.seekerButton}
              </Link>
            </div>
            <div className="path-card">
              <span className="flex size-11 items-center justify-center rounded-full bg-sky-soft text-navy">
                <BriefcaseIcon />
              </span>
              <h2 className="display mt-2 text-2xl">{t.home.employerTitle}</h2>
              <p className="text-ink-soft">{t.home.employerText}</p>
              <Link href={`/${locale}/post-a-job`} className="btn btn-sky mt-4">
                {t.home.employerButton}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto w-full max-w-6xl px-4 py-12">
        <Flash t={t} sp={sp} />
        <div className="mb-6 flex flex-wrap items-baseline justify-between gap-3">
          <h2 className="display text-3xl">{t.home.latest}</h2>
          {jobs.length > 0 && (
            <Link href={`/${locale}/jobs`} className="font-bold text-navy underline">
              {t.home.seeAll}
            </Link>
          )}
        </div>

        {jobs.length > 0 ? (
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {jobs.map((job) => (
              <JobNotice key={job.id} job={job} locale={locale} t={t} />
            ))}
          </ul>
        ) : (
          <div className="panel max-w-xl">
            <p className="font-bold">{t.home.emptyBoard}</p>
            <p className="mt-1 text-ink-soft">{t.home.emptyBoardHint}</p>
          </div>
        )}
      </div>
    </>
  )
}
