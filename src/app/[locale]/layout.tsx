import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { cookies } from 'next/headers'
import { dirOf, getDict, isLocale } from '@/lib/i18n'
import { Header } from '@/components/Header'
import '../globals.css'

// Runs before the page paints, so there is no flash of the wrong theme.
// It uses the saved choice if there is one, otherwise the device's light/dark setting.
const THEME_SCRIPT = `(function(){try{var m=document.cookie.match(/(?:^|; )theme=(light|dark)/);var t=m?m[1]:(window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');document.documentElement.setAttribute('data-theme',t)}catch(e){}})()`

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  const t = getDict(locale)
  return {
    title: { default: t.meta.title, template: `%s | ${t.brand}` },
    description: t.meta.description,
    icons: { icon: [{ url: '/favicon.png', sizes: '64x64', type: 'image/png' }], apple: '/apple-icon.png' },
  }
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const t = getDict(locale)
  const savedTheme = (await cookies()).get('theme')?.value
  const theme = savedTheme === 'dark' || savedTheme === 'light' ? savedTheme : undefined

  // Only the font for the current language is loaded, which keeps pages light on slow connections.
  const fontHref =
    locale === 'ar'
      ? 'https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&display=swap'
      : 'https://fonts.googleapis.com/css2?family=Figtree:wght@400;500;600;700;800&family=Newsreader:opsz,wght@6..72,500..700&display=swap'

  return (
    <html lang={locale} dir={dirOf(locale)} data-theme={theme} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="stylesheet" href={fontHref} />
      </head>
      <body>
        <a
          href="#content"
          className="sr-only focus:not-sr-only focus:absolute focus:start-2 focus:top-2 focus:z-10 focus:bg-paper focus:p-2 focus:font-bold focus:text-ink"
        >
          {t.nav.skip}
        </a>
        <Header locale={locale} t={t} />
        <main id="content" className="flex-1">
          {children}
        </main>
        <footer className="border-t border-line bg-paper">
          <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-6">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-dark.png" alt={t.brand} width={542} height={176} className="logo-light-only h-8 w-auto" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-light.png" alt={t.brand} width={542} height={176} className="logo-dark-only h-8 w-auto" />
            <div className="flex max-w-md flex-col items-start gap-2">
              <p className="text-sm text-ink-soft">{t.footer}</p>
              <Link href={`/${locale}/terms`} className="text-sm font-bold text-navy underline">
                {t.footerTerms}
              </Link>
            </div>
          </div>
        </footer>
      </body>
    </html>
  )
}
