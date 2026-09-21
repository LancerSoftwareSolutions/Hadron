import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { safePath } from '@/lib/safe-path'

// Email confirmation links land here, then we send the person to their dashboard.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = safePath(searchParams.get('next')) ?? '/'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) return NextResponse.redirect(`${origin}${next}`)
  }
  return NextResponse.redirect(`${origin}/en/login?err=auth_failed`)
}
