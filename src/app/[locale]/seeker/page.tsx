import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getLocaleParam, requireRole } from '@/lib/auth'
import { getDict } from '@/lib/i18n'
import { CV_MAX_MB, SPOKEN_LANGUAGES } from '@/lib/constants'
import { formatDate } from '@/lib/format'
import type { ApplicationStatus } from '@/lib/constants'
import type { SeekerProfile } from '@/lib/types'
import { saveSeekerProfile } from '@/app/actions/seeker'
import { Field, TextArea } from '@/components/Field'
import { AreaPicker } from '@/components/AreaPicker'
import { Flash, type SearchParams } from '@/components/Flash'
import { SubmitButton } from '@/components/SubmitButton'
import { UploadField } from '@/components/UploadField'

type Props = { params: Promise<{ locale: string }>; searchParams: Promise<SearchParams> }

interface MyApplication {
  id: string
  listing_id: string
  status: ApplicationStatus
  created_at: string
  listings: { title: string; businesses: { name: string } | null } | null
}

export default async function SeekerPage({ params, searchParams }: Props) {
  const locale = await getLocaleParam(params)
  const sp = await searchParams
  const t = getDict(locale)
  const user = await requireRole(locale, 'seeker', '/seeker')

  const supabase = await createClient()
  const [{ data: profileRow }, { data: appRows }] = await Promise.all([
    supabase.from('seeker_profiles').select('*').eq('user_id', user.id).maybeSingle(),
    supabase
      .from('applications')
      .select('id, listing_id, status, created_at, listings(title, businesses(name))')
      .eq('seeker_id', user.id)
      .order('created_at', { ascending: false }),
  ])
  const profile = profileRow as SeekerProfile | null
  const applications = (appRows ?? []) as unknown as MyApplication[]

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10">
      <h1 className="display text-3xl">{t.seeker.title}</h1>
      <p className="mb-6 mt-2 text-ink-soft">{t.seeker.intro}</p>
      <Flash t={t} sp={sp} />

      <section className="mb-12">
        <h2 className="display mb-4 text-2xl">{t.seeker.applicationsTitle}</h2>
        {applications.length === 0 ? (
          <div className="panel flex flex-wrap items-center justify-between gap-3">
            <p className="text-ink-soft">{t.seeker.noApplications}</p>
            <Link href={`/${locale}`} className="btn btn-primary">
              {t.seeker.browse}
            </Link>
          </div>
        ) : (
          <ul className="grid gap-3">
            {applications.map((a) => (
              <li key={a.id} className="panel flex flex-wrap items-center justify-between gap-3">
                <div>
                  {a.listings ? (
                    <Link href={`/${locale}/jobs/${a.listing_id}`} dir="auto" className="font-extrabold underline">
                      {a.listings.title}
                    </Link>
                  ) : (
                    <p className="font-extrabold text-ink-soft">{t.seeker.unavailable}</p>
                  )}
                  <p className="text-sm text-ink-soft">
                    {a.listings?.businesses?.name}
                    {a.listings?.businesses?.name ? ', ' : ''}
                    {formatDate(a.created_at, locale)}
                  </p>
                </div>
                <span className="badge badge-live">{t.appStatus[a.status]}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <form action={saveSeekerProfile} className="panel grid gap-4">
          <input type="hidden" name="locale" value={locale} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t.auth.fullName} name="full_name" required defaultValue={user.full_name} autoComplete="name" />
            <Field label={t.auth.phone} name="phone" type="tel" inputMode="tel" defaultValue={user.phone} autoComplete="tel" />
          </div>
          <Field label={t.seeker.headline} name="headline" defaultValue={profile?.headline} placeholder={t.seeker.headlinePlaceholder} />
          <TextArea label={t.seeker.summary} name="summary" rows={4} defaultValue={profile?.summary} />
          <Field label={t.seeker.skills} name="skills" defaultValue={profile?.skills.join(', ')} hint={t.seeker.skillsHint} />

          <fieldset>
            <legend className="label">{t.seeker.languages}</legend>
            <div className="flex flex-wrap gap-4">
              {SPOKEN_LANGUAGES.map((l) => (
                <label key={l} className="flex items-center gap-2 font-semibold">
                  <input type="checkbox" name="languages" value={l} defaultChecked={profile?.languages.includes(l)} className="size-4 accent-sky" />
                  {t.seeker.langs[l]}
                </label>
              ))}
            </div>
          </fieldset>

          <Field label={t.seeker.experience} name="experience_years" type="number" min={0} inputMode="numeric" defaultValue={profile?.experience_years} />
          <AreaPicker idPrefix="seeker" label={t.seeker.areas} hint={t.seeker.areasHint} selected={profile?.areas ?? []} labels={t.areas} />

          <UploadField
            bucket="cvs"
            name="cv_path"
            userId={user.id}
            accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            maxMb={CV_MAX_MB}
            label={t.seeker.cv}
            hint={t.seeker.cvHint}
            note={profile?.cv_path ? t.seeker.cvOnFile : undefined}
            t={t.upload}
          />

          <div>
            <SubmitButton pending={t.seeker.saving}>{t.seeker.save}</SubmitButton>
          </div>
        </form>
      </section>
    </div>
  )
}
