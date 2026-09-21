import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

const LOCALES = ['en', 'ar']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const hasLocale = LOCALES.some((l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`))

  if (!hasLocale) {
    const saved = request.cookies.get('NEXT_LOCALE')?.value
    const accepts = (request.headers.get('accept-language') ?? '').toLowerCase()
    const locale = saved && LOCALES.includes(saved) ? saved : accepts.startsWith('ar') ? 'ar' : 'en'

    const url = request.nextUrl.clone()
    url.pathname = `/${locale}${pathname === '/' ? '' : pathname}`
    return NextResponse.redirect(url)
  }

  return updateSession(request)
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|auth/|api/|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)'],
}
