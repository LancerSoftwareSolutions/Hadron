import Link from 'next/link'
import { getSessionUser, homeFor } from '@/lib/auth'
import { signOut } from '@/app/actions/auth'
import type { Dict, Locale } from '@/lib/i18n'
import { LanguageSwitch } from './LanguageSwitch'

export async function Header({ locale, t }: { locale: Locale; t: Dict }) {
  const user = await getSessionUser()
  const home = homeFor(user?.role)
  const dashboardLabel =
    user?.role === 'business' ? t.nav.myBusiness : user?.role === 'admin' ? t.nav.admin : t.nav.myProfile

  return (
    <header className="border-b border-line bg-paper">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3">
        <Link href={`/${locale}`} className="flex items-center gap-2">
          <span aria-hidden className="inline-block h-4 w-4 bg-marker" />
          <span className="display text-xl">{t.brand}</span>
        </Link>

        <nav className="flex flex-1 flex-wrap items-center gap-x-5 text-[0.95rem] font-bold">
          <Link href={`/${locale}`} className="hover:underline">
            {t.nav.jobs}
          </Link>
          {user && (
            <Link href={`/${locale}/${home}`} className="hover:underline">
              {dashboardLabel}
            </Link>
          )}
        </nav>

        <div className="flex flex-wrap items-center gap-2">
          <LanguageSwitch locale={locale} label={t.nav.language} />
          {user ? (
            <form action={signOut}>
              <input type="hidden" name="locale" value={locale} />
              <button type="submit" className="btn btn-outline">
                {t.nav.logout}
              </button>
            </form>
          ) : (
            <>
              <Link href={`/${locale}/login`} className="btn btn-quiet font-bold">
                {t.nav.login}
              </Link>
              <Link href={`/${locale}/signup`} className="btn btn-primary">
                {t.nav.signup}
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
