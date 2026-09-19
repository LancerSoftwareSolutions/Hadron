import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { dirOf, getDict, isLocale } from '@/lib/i18n'
import { Header } from '@/components/Header'
import '../globals.css'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  const t = getDict(locale)
  return {
    title: { default: t.meta.title, template: `%s | ${t.brand}` },
    description: t.meta.description,
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

  // Only the font for the current language is loaded, which keeps pages light on slow connections.
  const fontHref =
    locale === 'ar'
      ? 'https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap'
      : 'https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,400..900&display=swap'

  return (
    <html lang={locale} dir={dirOf(locale)}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="stylesheet" href={fontHref} />
      </head>
      <body>
        <a
          href="#content"
          className="sr-only focus:not-sr-only focus:absolute focus:start-2 focus:top-2 focus:z-10 focus:bg-white focus:p-2 focus:font-bold"
        >
          {t.nav.skip}
        </a>
        <Header locale={locale} t={t} />
        <main id="content" className="flex-1">
          {children}
        </main>
        <footer className="border-t border-line bg-paper">
          <p className="mx-auto max-w-6xl px-4 py-6 text-sm text-ink-soft">{t.footer}</p>
        </footer>
      </body>
    </html>
  )
}
