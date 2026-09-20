import Link from 'next/link'
import type { Dict, Locale } from '@/lib/i18n'
import type { ListingWithBusiness } from '@/lib/types'
import { formatSalary, logoUrl } from '@/lib/format'

export function VerifiedMark({ label }: { label: string }) {
  return (
    <svg role="img" aria-label={label} viewBox="0 0 20 20" className="size-[18px] shrink-0 text-cedar">
      <title>{label}</title>
      <circle cx="10" cy="10" r="10" fill="currentColor" />
      <path d="M5.5 10.4l3 3 6-6.4" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function BusinessMark({ name, logoPath }: { name: string; logoPath: string | null }) {
  const src = logoUrl(logoPath)
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt="" className="size-8 shrink-0 rounded border border-line bg-white object-contain" />
  }
  return (
    <span
      aria-hidden
      className="flex size-8 shrink-0 items-center justify-center rounded bg-highlight text-sm font-black"
    >
      {name.trim().charAt(0).toUpperCase()}
    </span>
  )
}

export function JobNotice({ job, locale, t }: { job: ListingWithBusiness; locale: Locale; t: Dict }) {
  const business = job.businesses
  const typeLabel = t.jobTypes[job.job_type] ?? job.job_type
  const areaLabel = job.area ? (t.areas as Record<string, string>)[job.area] ?? job.area : t.job.anywhere

  return (
    <li className="notice">
      <Link href={`/${locale}/jobs/${job.id}`}>
        <div className="flex items-center gap-2.5 px-4 pt-4">
          {business && <BusinessMark name={business.name} logoPath={business.logo_path} />}
          <span dir="auto" className="truncate text-[0.95rem] font-bold text-ink-soft">{business?.name}</span>
          {business?.verified && <VerifiedMark label={t.job.verified} />}
        </div>
        <h3 dir="auto" className="notice-title px-4 pt-3">{job.title}</h3>
        <div className="px-4 pb-5 pt-2">
          <p dir="auto" className="line-clamp-3 text-[0.95rem] text-ink-soft">
            {job.description}
          </p>
        </div>

        <dl className="notice-tabs">
          <div>
            <dt className="sr-only">{t.job.type}</dt>
            <dd>{typeLabel}</dd>
          </div>
          <div>
            <dt className="sr-only">{t.job.area}</dt>
            <dd>{areaLabel}</dd>
          </div>
          <div>
            <dt className="sr-only">{t.job.pay}</dt>
            <dd>
              <bdi>{formatSalary(job, t)}</bdi>
            </dd>
          </div>
        </dl>
      </Link>
    </li>
  )
}
