export const AREAS = [
  'beirut',
  'mount_lebanon',
  'north',
  'akkar',
  'baalbek_hermel',
  'bekaa',
  'south',
  'nabatieh',
] as const

export const JOB_TYPES = ['full_time', 'part_time', 'contract', 'internship', 'temporary'] as const

export const CATEGORIES = [
  'restaurant',
  'retail',
  'construction',
  'education',
  'healthcare',
  'technology',
  'hospitality',
  'manufacturing',
  'services',
  'other',
] as const

export const APPLICATION_STATUSES = ['submitted', 'viewed', 'shortlisted', 'rejected', 'hired'] as const
export const PAYMENT_METHODS = ['whish', 'omt', 'other'] as const
export const SPOKEN_LANGUAGES = ['arabic', 'english', 'french'] as const
export const CURRENCIES = ['USD', 'LBP'] as const

export type Area = (typeof AREAS)[number]
export type JobType = (typeof JOB_TYPES)[number]
export type Category = (typeof CATEGORIES)[number]
export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number]
export type PaymentMethod = (typeof PAYMENT_METHODS)[number]
export type SpokenLanguage = (typeof SPOKEN_LANGUAGES)[number]
export type Currency = (typeof CURRENCIES)[number]

export const LISTING_FEE_USD = process.env.NEXT_PUBLIC_LISTING_FEE_USD ?? ''
export const WHISH_NUMBER = process.env.NEXT_PUBLIC_WHISH_NUMBER ?? ''
export const CV_MAX_MB = 5
export const LOGO_MAX_MB = 2
