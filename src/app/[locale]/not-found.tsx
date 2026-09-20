import Link from 'next/link'
import { getDict } from '@/lib/i18n'

// Shown in both languages, because a missing page can't tell which one the visitor wants.
export default function NotFound() {
  const en = getDict('en')
  const ar = getDict('ar')

  return (
    <div className="mx-auto grid max-w-3xl gap-10 px-4 py-20 sm:grid-cols-2">
      <section lang="en" dir="ltr">
        <h1 className="display text-3xl">{en.notFound.title}</h1>
        <p className="mt-3 text-ink-soft">{en.notFound.text}</p>
        <Link href="/en" className="btn btn-primary mt-6">
          {en.notFound.back}
        </Link>
      </section>
      <section lang="ar" dir="rtl">
        <h2 className="display text-3xl">{ar.notFound.title}</h2>
        <p className="mt-3 text-ink-soft">{ar.notFound.text}</p>
        <Link href="/ar" className="btn btn-primary mt-6">
          {ar.notFound.back}
        </Link>
      </section>
    </div>
  )
}
