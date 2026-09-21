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
] as const

// The category dropdown ends with a "custom" choice where the owner types their own.
export const CUSTOM_CATEGORY = 'custom'
export const CUSTOM_CATEGORY_MAX = 60
export const ALL_AREAS = 'all'

export const APPLICATION_STATUSES = ['submitted', 'viewed', 'shortlisted', 'rejected', 'hired'] as const
export const PAYMENT_METHODS = ['whish', 'omt', 'other'] as const
export const SPOKEN_LANGUAGES = ['arabic', 'english', 'french'] as const
export const CURRENCIES = ['USD', 'LBP'] as const
export const SALARY_PERIODS = ['hourly', 'daily', 'weekly', 'monthly', 'yearly', 'project'] as const

export type Area = (typeof AREAS)[number]
export type JobType = (typeof JOB_TYPES)[number]
export type Category = (typeof CATEGORIES)[number]
export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number]
export type PaymentMethod = (typeof PAYMENT_METHODS)[number]
export type SpokenLanguage = (typeof SPOKEN_LANGUAGES)[number]
export type Currency = (typeof CURRENCIES)[number]
export type SalaryPeriod = (typeof SALARY_PERIODS)[number]

export const LISTING_FEE_USD = process.env.NEXT_PUBLIC_LISTING_FEE_USD ?? ''
export const WHISH_NUMBER = process.env.NEXT_PUBLIC_WHISH_NUMBER ?? ''
export const CV_MAX_MB = 5
export const LOGO_MAX_MB = 2

// Shown on the Terms page. Set NEXT_PUBLIC_CONTACT_PHONE / NEXT_PUBLIC_CONTACT_EMAIL to change them.
export const CONTACT_PHONE = process.env.NEXT_PUBLIC_CONTACT_PHONE ?? '+961 81 880 328'
export const CONTACT_EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? ''
