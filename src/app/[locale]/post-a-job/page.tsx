import type { Metadata } from 'next'
import Link from 'next/link'
import { getLocaleParam, getSessionUser } from '@/lib/auth'
import { getDict } from '@/lib/i18n'
import { formatFee, getPublicFee } from '@/lib/settings'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const locale = await getLocaleParam(params)
  return { title: getDict(locale).post.title }
}

export default async function PostAJob({ params }: { params: Promise<{ locale: string }> }) {
  const locale = await getLocaleParam(params)
  const t = getDict(locale)
  const p = t.post
  const user = await getSessionUser()
  const fee = await getPublicFee()

  const cta = !user ? (
    <div className="flex flex-wrap items-center gap-3">
      <Link href={`/${locale}/signup?role=business`} className="btn btn-sky">
        {p.start}
      </Link>
      <Link href={`/${locale}/login?next=${encodeURIComponent(`/${locale}/business`)}`} className="btn btn-ghost-light">
        {p.haveAccount} {t.nav.login}
      </Link>
    </div>
  ) : user.role === 'business' ? (
    <Link href={`/${locale}/business`} className="btn btn-sky">
      {p.goBusiness}
    </Link>
  ) : user.role === 'admin' ? (
    <Link href={`/${locale}/admin`} className="btn btn-sky">
      {t.nav.admin}
    </Link>
  ) : (
    <p className="max-w-xl rounded-lg bg-white/10 px-4 py-3 font-semibold">{p.seekerNote}</p>
  )

  return (
    <>
      <section className="hero on-navy">
        <div className="mx-auto w-full max-w-6xl px-4 pb-14 pt-8 md:pb-20 md:pt-14">
          <h1 className="display max-w-3xl text-4xl md:text-6xl">{p.title}</h1>
          <p className="mt-4 max-w-xl text-lg text-white/80">{p.sub}</p>
          {fee !== null && <p className="mt-4 inline-block rounded-full bg-white/12 px-4 py-1.5 font-bold">{p.fee(formatFee(fee))}</p>}
          <div className="mt-8">{cta}</div>
        </div>
      </section>

      <div className="mx-auto w-full max-w-6xl px-4 py-12">
        <h2 className="display mb-6 text-3xl">{p.stepsTitle}</h2>
        <ol className="grid gap-4 sm:grid-cols-2">
          {p.steps.map((step, i) => (
            <li key={step.title} className="panel flex gap-4">
              <span className="step-num" aria-hidden>
                {i + 1}
              </span>
              <div>
                <h3 className="text-lg font-extrabold">{step.title}</h3>
                <p className="mt-1 text-ink-soft">{step.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </>
  )
}
