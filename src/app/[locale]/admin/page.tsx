import { createClient } from '@/lib/supabase/server'
import { getLocaleParam, requireRole } from '@/lib/auth'
import { getDict } from '@/lib/i18n'
import { formatDate } from '@/lib/format'
import { confirmPayment, rejectPayment, setBusinessVerified } from '@/app/actions/admin'
import { Flash, type SearchParams } from '@/components/Flash'
import { SubmitButton } from '@/components/SubmitButton'

type Props = { params: Promise<{ locale: string }>; searchParams: Promise<SearchParams> }

interface PaymentRow {
  id: string
  amount: number
  currency: string
  method: string
  reference: string | null
  status: 'pending' | 'confirmed' | 'rejected'
  created_at: string
  listings: { title: string; businesses: { name: string } | null } | null
}

interface BusinessRow {
  id: string
  name: string
  verified: boolean
  created_at: string
  owner: { full_name: string; phone: string | null } | null
}

const PAYMENT_SELECT = 'id, amount, currency, method, reference, status, created_at, listings(title, businesses(name))'

export default async function AdminPage({ params, searchParams }: Props) {
  const locale = await getLocaleParam(params)
  const sp = await searchParams
  const t = getDict(locale)
  await requireRole(locale, 'admin', '/admin')

  const supabase = await createClient()
  const [{ data: pendingRows }, { data: recentRows }, { data: businessRows }] = await Promise.all([
    supabase.from('payments').select(PAYMENT_SELECT).eq('status', 'pending').order('created_at', { ascending: true }),
    supabase.from('payments').select(PAYMENT_SELECT).neq('status', 'pending').order('created_at', { ascending: false }).limit(15),
    supabase
      .from('businesses')
      .select('id, name, verified, created_at, owner:profiles!businesses_owner_id_fkey(full_name, phone)')
      .order('created_at', { ascending: false })
      .limit(100),
  ])
  const pending = (pendingRows ?? []) as unknown as PaymentRow[]
  const recent = (recentRows ?? []) as unknown as PaymentRow[]
  const businesses = (businessRows ?? []) as unknown as BusinessRow[]

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10">
      <h1 className="display mb-6 text-3xl">{t.admin.title}</h1>
      <Flash t={t} sp={sp} />

      <section className="mb-12">
        <h2 className="display mb-4 text-2xl">{t.admin.pendingPayments}</h2>
        {pending.length === 0 && <p className="panel text-ink-soft">{t.admin.noPending}</p>}
        <ul className="grid gap-3">
          {pending.map((p) => (
            <li key={p.id} className="panel">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-lg font-extrabold">{p.listings?.businesses?.name}</p>
                  <p className="text-ink-soft">{p.listings?.title}</p>
                </div>
                <dl className="grid grid-cols-3 gap-x-6 text-sm">
                  <div>
                    <dt className="font-bold">{t.admin.amount}</dt>
                    <dd>
                      <bdi>
                        {p.amount} {p.currency}
                      </bdi>
                    </dd>
                  </div>
                  <div>
                    <dt className="font-bold">{t.admin.method}</dt>
                    <dd>{(t.business.methods as Record<string, string>)[p.method] ?? p.method}</dd>
                  </div>
                  <div>
                    <dt className="font-bold">{t.admin.reference}</dt>
                    <dd>
                      <bdi>{p.reference}</bdi>
                    </dd>
                  </div>
                </dl>
              </div>
              <div className="mt-4 flex flex-wrap items-end gap-3 border-t-2 border-dashed border-line-strong pt-4">
                <form action={confirmPayment} className="flex flex-wrap items-end gap-3">
                  <input type="hidden" name="locale" value={locale} />
                  <input type="hidden" name="payment_id" value={p.id} />
                  <div>
                    <label htmlFor={`days-${p.id}`} className="label">
                      {t.admin.days}
                    </label>
                    <input id={`days-${p.id}`} name="days" type="number" min={1} max={365} defaultValue={30} className="input !w-28" />
                  </div>
                  <SubmitButton>{t.admin.confirm}</SubmitButton>
                </form>
                <form action={rejectPayment}>
                  <input type="hidden" name="locale" value={locale} />
                  <input type="hidden" name="payment_id" value={p.id} />
                  <SubmitButton className="btn btn-danger">{t.admin.reject}</SubmitButton>
                </form>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="mb-12">
        <h2 className="display mb-4 text-2xl">{t.admin.businessesTitle}</h2>
        <ul className="grid gap-3">
          {businesses.map((b) => (
            <li key={b.id} className="panel flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-extrabold">{b.name}</p>
                <p className="text-sm text-ink-soft">
                  {t.admin.owner}: {b.owner?.full_name}
                  {b.owner?.phone && (
                    <>
                      {', '}
                      <bdi>{b.owner.phone}</bdi>
                    </>
                  )}
                </p>
              </div>
              <form action={setBusinessVerified} className="flex items-center gap-3">
                <input type="hidden" name="locale" value={locale} />
                <input type="hidden" name="business_id" value={b.id} />
                <input type="hidden" name="verified" value={b.verified ? 'false' : 'true'} />
                {b.verified && <span className="badge badge-live">{t.business.verified}</span>}
                <SubmitButton className="btn btn-outline">{b.verified ? t.admin.unverify : t.admin.verify}</SubmitButton>
              </form>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="display mb-4 text-2xl">{t.admin.recentPayments}</h2>
        <ul className="grid gap-2">
          {recent.map((p) => (
            <li key={p.id} className="panel flex flex-wrap items-center justify-between gap-3 !py-3">
              <span>
                <span className="font-bold">{p.listings?.businesses?.name}</span>
                <span className="text-ink-soft">
                  {', '}
                  {p.listings?.title}
                </span>
              </span>
              <span className="flex items-center gap-3 text-sm">
                <bdi>
                  {p.amount} {p.currency}
                </bdi>
                <span>{formatDate(p.created_at, locale)}</span>
                <span className={`badge ${p.status === 'confirmed' ? 'badge-live' : 'badge-bad'}`}>{t.admin.paymentStatus[p.status]}</span>
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
