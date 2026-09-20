import Link from 'next/link'
import { cookies } from 'next/headers'
import { getSessionUser, homeFor } from '@/lib/auth'
import { signOut } from '@/app/actions/auth'
import type { Dict, Locale } from '@/lib/i18n'
import { LanguageSwitch } from './LanguageSwitch'
import { NavLinks } from './NavLinks'
import { ThemeSwitch } from './ThemeSwitch'

export async function Header({ locale, t }: { locale: Locale; t: Dict }) {
  const user = await getSessionUser()
  const theme = (await cookies()).get('theme')?.value === 'dark' ? 'dark' : 'light'
  const dashboardLabel =
    user?.role === 'business' ? t.nav.myBusiness : user?.role === 'admin' ? t.nav.admin : t.nav.myProfile

  const items = [
    { href: `/${locale}/jobs`, label: t.nav.findWork },
    { href: `/${locale}/post-a-job`, label: t.nav.postJob },
    ...(user ? [{ href: `/${locale}/${homeFor(user.role)}`, label: dashboardLabel }] : []),
  ]

  const logoutForm = (className: string) => (
    <form action={signOut}>
      <input type="hidden" name="locale" value={locale} />
      <button type="submit" className={className}>
        {t.nav.logout}
      </button>
    </form>
  )

  return (
    <header className="on-navy bg-header text-white">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-x-3 px-4 pt-3 sm:flex-nowrap sm:gap-x-6 sm:py-3">
        <Link href={`/${locale}`} className="order-1 shrink-0" aria-label={t.brand}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-light.png" alt={t.brand} width={542} height={176} className="h-8 w-auto sm:h-9" />
        </Link>

        <nav aria-label={t.brand} className="order-3 flex w-full flex-wrap items-center gap-x-1 pb-2 pt-2 sm:order-2 sm:w-auto sm:flex-1 sm:flex-nowrap sm:py-0">
          <NavLinks items={items} />
          {/* On phones, account links sit here so the top row only holds the logo and switches */}
          <div className="ms-auto flex items-center gap-1 sm:hidden">
            {user ? (
              logoutForm('navlink')
            ) : (
              <>
                <Link href={`/${locale}/login`} className="navlink">
                  {t.nav.login}
                </Link>
                <Link href={`/${locale}/signup`} className="btn btn-light !min-h-9 !px-3">
                  {t.nav.signup}
                </Link>
              </>
            )}
          </div>
        </nav>

        <div className="order-2 flex shrink-0 items-center gap-2 sm:order-3">
          <LanguageSwitch locale={locale} label={t.nav.arabicSwitch} />
          <ThemeSwitch initialTheme={theme} label={t.nav.darkMode} />
        </div>

        <div className="order-4 hidden shrink-0 items-center gap-2 sm:flex">
          {user ? (
            logoutForm('btn btn-ghost-light !min-h-10 !px-3')
          ) : (
            <>
              <Link href={`/${locale}/login`} className="navlink">
                {t.nav.login}
              </Link>
              <Link href={`/${locale}/signup`} className="btn btn-light !min-h-10 !px-3">
                {t.nav.signup}
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
