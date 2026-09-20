import type { ApplicationStatus, Currency, JobType } from './constants'

export type Role = 'seeker' | 'business' | 'admin'
export type ListingStatus = 'pending_payment' | 'active' | 'expired' | 'closed'
export type PaymentStatus = 'pending' | 'confirmed' | 'rejected'

export interface SessionUser {
  id: string
  email: string
  role: Role
  full_name: string
  phone: string | null
}

export interface BusinessPublic {
  name: string
  category: string | null
  area: string | null
  address: string | null
  description: string | null
  phone: string | null
  email: string | null
  website: string | null
  logo_path: string | null
  verified: boolean
}

export interface Business extends BusinessPublic {
  id: string
  owner_id: string
  created_at: string
}

export interface Listing {
  id: string
  business_id: string
  title: string
  description: string
  job_type: JobType
  area: string | null
  salary_min: number | null
  salary_max: number | null
  salary_currency: Currency
  status: ListingStatus
  paid_at: string | null
  expires_at: string | null
  created_at: string
}

export interface ListingWithBusiness extends Listing {
  businesses: BusinessPublic | null
}

export interface Payment {
  id: string
  listing_id: string
  amount: number
  currency: string
  method: string
  reference: string | null
  status: PaymentStatus
  created_at: string
}

export interface SeekerProfile {
  user_id: string
  headline: string | null
  summary: string | null
  skills: string[]
  languages: string[]
  experience_years: number | null
  area: string | null
  cv_path: string | null
}

export interface Application {
  id: string
  listing_id: string
  seeker_id: string
  cover_note: string | null
  status: ApplicationStatus
  created_at: string
}
