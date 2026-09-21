import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getLocaleParam, getSessionUser, homeFor } from '@/lib/auth'
import { getDict } from '@/lib/i18n'
import { first } from '@/lib/format'
import { resendConfirmation, signIn } from '@/app/actions/auth'
import { Field } from '@/components/Field'
import { Flash, type SearchParams } from '@/components/Flash'
import { SubmitButton } from '@/components/SubmitButton'

export default async function LoginPage({
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

  return (
    <div className="mx-auto w-full max-w-md px-4 py-12">
      <h1 className="display mb-6 text-3xl">{t.auth.loginTitle}</h1>
      <Flash t={t} sp={sp} />
      <form action={signIn} className="panel grid gap-4">
        <input type="hidden" name="locale" value={locale} />
        <input type="hidden" name="next" value={first(sp.next)} />
        <Field label={t.auth.email} name="email" type="email" required autoComplete="email" inputMode="email" />
        <Field label={t.auth.password} name="password" type="password" required autoComplete="current-password" />
        <SubmitButton pending={t.auth.working}>{t.auth.loginButton}</SubmitButton>
      </form>
      <details className="mt-4 rounded-xl border border-line bg-paper p-4" open={['email_not_confirmed', 'auth_failed', 'check_email'].includes(first(sp.err) || first(sp.ok))}>
        <summary className="cursor-pointer font-bold">{t.auth.resendTitle}</summary>
        <form action={resendConfirmation} className="mt-3 grid gap-3">
          <input type="hidden" name="locale" value={locale} />
          <Field label={t.auth.email} name="email" id="resend-email" type="email" required autoComplete="email" inputMode="email" />
          <SubmitButton className="btn btn-outline" pending={t.auth.working}>
            {t.auth.resendButton}
          </SubmitButton>
        </form>
      </details>
      <p className="mt-6 text-ink-soft">
        {t.auth.noAccount}{' '}
        <Link href={`/${locale}/signup`} className="font-bold text-ink underline">
          {t.nav.signup}
        </Link>
      </p>
    </div>
  )
}
