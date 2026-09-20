import Link from 'next/link'
import type { Dict, Locale } from '@/lib/i18n'
import type { ListingWithBusiness } from '@/lib/types'
import { formatSalary, logoUrl } from '@/lib/format'
import { areasLabel } from '@/lib/areas'

export function VerifiedMark({ label }: { label: string }) {
  return (
    <svg role="img" aria-label={label} viewBox="0 0 20 20" className="size-[18px] shrink-0 text-sky">
      <title>{label}</title>
      <circle cx="10" cy="10" r="10" fill="currentColor" />
      <path d="M5.5 10.4l3 3 6-6.4" fill="none" stroke="#14264a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function BusinessMark({ name, logoPath, size = 'md' }: { name: string; logoPath: string | null; size?: 'md' | 'lg' }) {
  const src = logoUrl(logoPath)
  const box = size === 'lg' ? 'size-14 text-xl' : 'size-10 text-base'
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt="" className={`${box} shrink-0 rounded-lg border border-line bg-white object-contain`} />
  }
  return (
    <span aria-hidden className={`${box} flex shrink-0 items-center justify-center rounded-lg bg-sky-soft font-extrabold text-navy`}>
      {name.trim().charAt(0).toUpperCase()}
    </span>
  )
}

// A job shown as a card on the job lists.
export function JobNotice({ job, locale, t }: { job: ListingWithBusiness; locale: Locale; t: Dict }) {
  const business = job.businesses

  return (
    <li className="card">
      <Link href={`/${locale}/jobs/${job.id}`} className="p-5">
        <div className="flex items-center gap-3">
          {business && <BusinessMark name={business.name} logoPath={business.logo_path} />}
          <span dir="auto" className="truncate font-semibold text-ink-soft">
            {business?.name}
          </span>
          {business?.verified && <VerifiedMark label={t.job.verified} />}
        </div>

        <h3 dir="auto" className="card-title display mt-4 text-[1.35rem]">
          {job.title}
        </h3>
        <div className="mt-2">
          <p dir="auto" className="line-clamp-3 text-[0.95rem] text-ink-soft">
            {job.description}
          </p>
        </div>

        <ul className="mt-4 flex flex-wrap gap-2">
          <li className="chip">{t.jobTypes[job.job_type] ?? job.job_type}</li>
          <li className="chip">{areasLabel(job.areas, t, locale)}</li>
        </ul>
        <p className="mt-auto pt-4 font-bold text-navy">
          <bdi>{formatSalary(job, t)}</bdi>
        </p>
      </Link>
    </li>
  )
}
