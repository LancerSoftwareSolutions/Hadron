import type { BusinessPublic } from './types'

interface JobContact {
  display_name?: string | null
  contact_email?: string | null
  contact_phone?: string | null
  contact_website?: string | null
}

const norm = (s: string | null | undefined) => (s ?? '').trim().toLowerCase()

export const EMAIL_RE = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}$/
export const PHONE_RE = /^\+?[\d\s().-]{6,40}$/

// Returns a safe http(s) link, or null. Anything else (javascript:, data:, garbage) is rejected.
export function safeWebsiteUrl(raw: string | null | undefined): string | null {
  const v = (raw ?? '').trim()
  if (!v) return null
  const withScheme = /^https?:\/\//i.test(v) ? v : `https://${v}`
  try {
    const url = new URL(withScheme)
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.toString() : null
  } catch {
    return null
  }
}

export function contactIsValid(c: { email: string | null; phone: string | null; website: string | null }): boolean {
  if (c.email && (c.email.length > 120 || !EMAIL_RE.test(c.email))) return false
  if (c.phone && !PHONE_RE.test(c.phone)) return false
  if (c.website && (c.website.length > 200 || !safeWebsiteUrl(c.website))) return false
  return true
}

export function sameText(a: string | null | undefined, b: string | null | undefined): boolean {
  return norm(a) === norm(b)
}

// What a job shows: its own contact details if the business set any, otherwise the business's.
// The logo and "verified" mark belong to the business, so they only show when the name matches it.
export function contactFor(job: JobContact, business: BusinessPublic | null) {
  const sameBusiness = !job.display_name || sameText(job.display_name, business?.name)
  return {
    name: job.display_name ?? business?.name ?? '',
    email: job.contact_email ?? business?.email ?? null,
    phone: job.contact_phone ?? business?.phone ?? null,
    website: job.contact_website ?? business?.website ?? null,
    sameBusiness,
    verified: Boolean(business?.verified) && sameBusiness,
    logoPath: sameBusiness ? (business?.logo_path ?? null) : null,
  }
}
