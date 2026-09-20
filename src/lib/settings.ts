import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'
import { WHISH_NUMBER } from '@/lib/constants'

export interface PaymentSettings {
  fee: number | null
  days: number
  whishNumber: string | null
}

// "10" rather than "10.00", "7.5" rather than "7.50"
export function formatFee(fee: number): string {
  return String(Number(fee.toFixed(2)))
}

// Anyone (even signed out) may read the fee and the number of days, but not the Whish number.
export const getPublicFee = cache(async (): Promise<number | null> => {
  const supabase = await createClient()
  const { data } = await supabase.from('settings').select('listing_fee_usd').eq('id', 1).maybeSingle()
  return data?.listing_fee_usd != null ? Number(data.listing_fee_usd) : null
})

// For signed-in users, including the Whish number.
export const getPaymentSettings = cache(async (): Promise<PaymentSettings> => {
  const supabase = await createClient()
  const { data } = await supabase
    .from('settings')
    .select('listing_fee_usd, listing_days, whish_number')
    .eq('id', 1)
    .maybeSingle()
  return {
    fee: data?.listing_fee_usd != null ? Number(data.listing_fee_usd) : null,
    days: data?.listing_days ?? 30,
    whishNumber: data?.whish_number ?? (WHISH_NUMBER || null),
  }
})
