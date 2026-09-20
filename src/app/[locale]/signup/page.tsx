import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getLocaleParam, getSessionUser, homeFor } from '@/lib/auth'
import { getDict } from '@/lib/i18n'
import { first } from '@/lib/format'
import { signUp } from '@/app/actions/auth'
import { Field } from '@/components/Field'
import { Flash, type SearchParams } from '@/components/Flash'
import { SubmitButton } from '@/components/SubmitButton'

export default async function SignupPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<SearchParams>
}) {
  const locale = await getLocaleParam(params)
  const sp = await searchParams
  const t = getDict(locale)

  const user = await getSessionUser()
  if (user) redirect(`/${locale}/${homeFor(user.role)}`)

  const role = first(sp.role) === 'business' ? 'business' : 'seeker'

  return (
    <div className="mx-auto w-full max-w-md px-4 py-12">
      <h1 className="display mb-6 text-3xl">{t.auth.signupTitle}</h1>
      <Flash t={t} sp={sp} />
      <form action={signUp} className="panel grid gap-4">
        <input type="hidden" name="locale" value={locale} />

        <fieldset className="grid gap-3">
          <legend className="label">{t.auth.iWant}</legend>
          {(['seeker', 'business'] as const).map((r) => (
            <label
              key={r}
              className="flex cursor-pointer items-start gap-3 rounded-md border-2 border-line p-3 has-[:checked]:border-ink has-[:checked]:bg-mist"
            >
              <input type="radio" name="role" value={r} defaultChecked={role === r} className="mt-1.5 size-4 accent-sky" />
              <span>
                <span className="block font-bold">{r === 'seeker' ? t.auth.roleSeeker : t.auth.roleBusiness}</span>
                <span className="hint !mt-0 block">{r === 'seeker' ? t.auth.roleSeekerHint : t.auth.roleBusinessHint}</span>
              </span>
            </label>
          ))}
        </fieldset>

        <Field label={t.auth.fullName} name="full_name" required autoComplete="name" />
        <Field label={t.auth.phone} name="phone" type="tel" required autoComplete="tel" inputMode="tel" hint={t.auth.phoneHint} />
        <Field label={t.auth.email} name="email" type="email" required autoComplete="email" inputMode="email" />
        <Field
          label={t.auth.password}
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          hint={t.auth.passwordHint}
        />
        <SubmitButton pending={t.auth.working}>{t.auth.signupButton}</SubmitButton>
      </form>
      <p className="mt-6 text-ink-soft">
        {t.auth.haveAccount}{' '}
        <Link href={`/${locale}/login`} className="font-bold text-ink underline">
          {t.nav.login}
        </Link>
      </p>
    </div>
  )
}
