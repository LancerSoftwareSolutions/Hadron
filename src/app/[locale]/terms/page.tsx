import type { Metadata } from 'next'
import { getLocaleParam } from '@/lib/auth'
import { CONTACT_EMAIL, CONTACT_PHONE } from '@/lib/constants'
import { TERMS } from '@/lib/terms'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const locale = await getLocaleParam(params)
  return { title: TERMS[locale].title }
}

export default async function TermsPage({ params }: { params: Promise<{ locale: string }> }) {
  const locale = await getLocaleParam(params)
  const c = TERMS[locale]

  return (
    <>
      <section className="hero on-navy">
        <div className="mx-auto w-full max-w-6xl px-4 pb-12 pt-8 md:pb-16 md:pt-12">
          <h1 className="display text-4xl md:text-5xl">{c.title}</h1>
          <p className="mt-3 text-white/80">{c.updated}</p>
        </div>
      </section>

      <article className="mx-auto w-full max-w-3xl px-4 py-10">
        <p className="text-lg text-ink-soft">{c.intro}</p>

        {c.sections.map((section, i) => (
          <section key={section.heading} className="mt-9">
            <h2 className="display text-2xl">
              {i + 1}. {section.heading}
            </h2>
            {section.body.map((paragraph) => (
              <p key={paragraph} className="mt-3">
                {paragraph}
              </p>
            ))}
          </section>
        ))}

        <section className="mt-9">
          <h2 className="display text-2xl">
            {c.sections.length + 1}. {c.contactHeading}
          </h2>
          <p className="mt-3">
            {c.contact.before}
            <bdi>{CONTACT_PHONE}</bdi>
            {CONTACT_EMAIL && (
              <>
                {c.contact.or}
                <bdi>{CONTACT_EMAIL}</bdi>
              </>
            )}
            {c.contact.after}
          </p>
        </section>
      </article>
    </>
  )
}
