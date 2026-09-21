import type { Currency, SalaryPeriod } from './constants'
import type { Dict, Locale } from './i18n'

export function formatMoney(value: number, currency: Currency, t: Dict): string {
  const n = value.toLocaleString('en-US', { maximumFractionDigits: 0 })
  return currency === 'USD' ? `$${n}` : `${n} ${t.currency.LBP}`
}

export function formatSalary(
  job: { salary_min: number | null; salary_max: number | null; salary_currency: Currency; salary_period?: SalaryPeriod | null },
  t: Dict,
): string {
  const { salary_min: min, salary_max: max, salary_currency: cur } = job
  let amount: string
  if (min != null && max != null) {
    amount = min === max ? formatMoney(min, cur, t) : `${formatMoney(min, cur, t)} – ${formatMoney(max, cur, t)}`
  } else if (min != null) {
    amount = t.job.payFrom(formatMoney(min, cur, t))
  } else if (max != null) {
    amount = t.job.payUpTo(formatMoney(max, cur, t))
  } else {
    return t.job.negotiable
  }
  // "$5 – $8 per hour". Older jobs have no salary type and show the amount only.
  return job.salary_period ? `${amount} ${t.salaryPer[job.salary_period]}` : amount
}

export function formatDate(iso: string | null, locale: Locale): string {
  if (!iso) return ''
  const tag = locale === 'ar' ? 'ar-LB-u-nu-latn' : 'en-GB'
  return new Date(iso).toLocaleDateString(tag, { day: 'numeric', month: 'short', year: 'numeric' })
}

export function daysLeft(iso: string | null): number {
  if (!iso) return 0
  return Math.ceil((new Date(iso).getTime() - Date.now()) / 86_400_000)
}

// Turns a Lebanese number such as 03 123 456 or 71 123 456 into a WhatsApp link.
export function whatsappUrl(phone: string): string {
  const raw = phone.trim()
  let digits = raw.replace(/\D/g, '')
  if (!raw.startsWith('+')) {
    if (digits.startsWith('00')) digits = digits.slice(2)
    else if (digits.startsWith('961')) digits = digits
    else if (digits.startsWith('0')) digits = '961' + digits.slice(1)
    else digits = '961' + digits
  }
  return `https://wa.me/${digits}`
}

export function telUrl(phone: string): string {
  return `tel:${phone.replace(/[^\d+]/g, '')}`
}

export function logoUrl(path: string | null): string | null {
  if (!path) return null
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/logos/${path}`
}

export function effectiveStatus(listing: {
  status: string
  expires_at: string | null
}): 'pending_payment' | 'active' | 'expired' | 'closed' {
  if (listing.status === 'active' && listing.expires_at && new Date(listing.expires_at) <= new Date()) {
    return 'expired'
  }
  return listing.status as 'pending_payment' | 'active' | 'expired' | 'closed'
}

export function first(v: string | string[] | undefined): string {
  return Array.isArray(v) ? (v[0] ?? '') : (v ?? '')
}
