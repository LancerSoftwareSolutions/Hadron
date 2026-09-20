import { NextResponse } from 'next/server'
import nodemailer from 'nodemailer'
import { timingSafeEqual } from 'node:crypto'
import { EMAIL_RE } from '@/lib/contact'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Called only by the database, when a business records a payment that needs confirming.
// It emails every admin. A shared secret proves the call really came from the database.

const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] as string)

const oneLine = (value: string, max: number) => value.replace(/[\r\n]+/g, ' ').trim().slice(0, max)

function secretMatches(given: string | null, expected: string | undefined): boolean {
  if (!given || !expected) return false
  const a = Buffer.from(given)
  const b = Buffer.from(expected)
  return a.length === b.length && timingSafeEqual(a, b)
}

export async function POST(request: Request) {
  if (!secretMatches(request.headers.get('x-notify-secret'), process.env.PAYMENT_NOTIFY_SECRET)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const host = process.env.SMTP_HOST
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS
  if (!host || !user || !pass) {
    return NextResponse.json({ error: 'email is not configured' }, { status: 503 })
  }

  const raw = await request.text()
  if (raw.length > 10_000) return NextResponse.json({ error: 'too large' }, { status: 413 })

  let data: Record<string, unknown>
  try {
    data = JSON.parse(raw)
  } catch {
    return NextResponse.json({ error: 'bad request' }, { status: 400 })
  }

  const recipients = Array.isArray(data.recipients) ? data.recipients : []
  const valid = recipients.filter((r): r is string => typeof r === 'string' && EMAIL_RE.test(r) && r.length <= 120)
  if (valid.length === 0 || valid.length !== recipients.length || valid.length > 25) {
    return NextResponse.json({ error: 'bad recipients' }, { status: 400 })
  }

  const business = oneLine(String(data.business_name ?? ''), 100)
  const job = oneLine(String(data.job_title ?? ''), 150)
  const code = oneLine(String(data.payment_code ?? ''), 20)
  const methodNames: Record<string, string> = { whish: 'Whish Money', omt: 'OMT', other: 'Other' }
  const method = methodNames[String(data.method ?? '')] ?? oneLine(String(data.method ?? ''), 20)
  const reference = oneLine(String(data.reference ?? ''), 100)
  const amount = `${Number(data.amount ?? 0)} ${oneLine(String(data.currency ?? 'USD'), 5)}`
  const site = (process.env.NEXT_PUBLIC_SITE_URL ?? '').replace(/\/$/, '')
  const adminUrl = `${site}/en/admin`
  const fromName = oneLine(process.env.NOTIFY_FROM_NAME ?? 'Hadron', 60)
  const fromEmail = process.env.NOTIFY_FROM_EMAIL ?? user

  const subject = `Payment waiting: ${business}, ${amount}`
  const text = [
    'A payment is waiting for your confirmation.',
    '',
    `Business: ${business}`,
    `Job: ${job}`,
    `Amount: ${amount}`,
    `Method: ${method}`,
    `Transaction number: ${reference}`,
    `Payment code: ${code}`,
    '',
    `Open the admin page to confirm or reject it: ${adminUrl}`,
    '',
    'دفعة بانتظار تأكيدك. افتح صفحة الإدارة لتأكيدها أو رفضها.',
  ].join('\n')

  const row = (label: string, value: string) =>
    `<tr><td style="padding:6px 16px 6px 0;color:#475d78;font-size:14px;">${label}</td><td style="padding:6px 0;font-weight:700;font-size:14px;color:#0f2240;">${escapeHtml(value)}</td></tr>`

  const html = `<!DOCTYPE html><html><body style="margin:0;padding:24px;background:#eef3f8;font-family:Helvetica,Arial,sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;">
<tr><td style="background:#1e3661;padding:18px 24px;color:#ffffff;font-size:18px;font-weight:700;">${escapeHtml(fromName)}</td></tr>
<tr><td style="padding:24px;">
<h1 style="margin:0 0 6px;font-size:20px;color:#1e3661;">A payment is waiting for you</h1>
<p style="margin:0 0 16px;color:#0f2240;font-size:15px;">Check it against your Whish or OMT account, then confirm or reject it.</p>
<table role="presentation" cellpadding="0" cellspacing="0">
${row('Business', business)}${row('Job', job)}${row('Amount', amount)}${row('Method', method)}${row('Transaction number', reference)}${row('Payment code', code)}
</table>
<p style="margin:22px 0 0;"><a href="${escapeHtml(adminUrl)}" style="display:inline-block;background:#1e3661;color:#ffffff;text-decoration:none;font-weight:700;padding:12px 24px;border-radius:8px;font-size:15px;">Open the admin page</a></p>
<p dir="rtl" style="margin:22px 0 0;color:#475d78;font-size:14px;line-height:1.8;text-align:right;">دفعة بانتظار تأكيدك. افتح صفحة الإدارة لتأكيدها أو رفضها.</p>
</td></tr></table></body></html>`

  const port = Number(process.env.SMTP_PORT ?? 465)
  const transporter = nodemailer.createTransport({ host, port, secure: port === 465, auth: { user, pass } })

  // One email per admin, so nobody sees anyone else's address.
  const results = await Promise.allSettled(
    valid.map((to) => transporter.sendMail({ from: `"${fromName}" <${fromEmail}>`, to, subject, text, html })),
  )
  const sent = results.filter((r) => r.status === 'fulfilled').length
  if (sent === 0) return NextResponse.json({ error: 'sending failed' }, { status: 502 })
  return NextResponse.json({ sent, failed: results.length - sent })
}
