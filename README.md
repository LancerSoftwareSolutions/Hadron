# Hadron

A bilingual (Arabic and English) job board for Lebanon. Businesses pay a listing fee to publish jobs. Job seekers create a profile, upload a CV, and apply. Built with Next.js on Vercel and Supabase.

## What it does

- **Header switches:** a language slider (English and Arabic) and a light/dark slider. Dark mode follows the visitor's device setting on their first visit, then remembers their choice.
- **Jobs can be edited** at any time (except closed ones) and **deleted** while they have never had a payment. Jobs with a payment record can only be closed, so payment records are never lost.
- **Contact details per job:** each job can show its own business name, email, phone and website. They start as the business's details, and only differ when changed.
- **Terms & Conditions** page at `/terms` (English and Arabic), linked from the footer and required when signing up. It is a draft: have a lawyer review it before launch.
- **Two main pages:** **Find work** (`/jobs`, search and browse) and **Post a job** (`/post-a-job`, how it works and sign-up for businesses). The home page links to both.
- **Job seekers:** browse and search jobs, create an account, build a profile, upload a CV, apply, and track application status. They can list several areas they can work in, or all of Lebanon.
- **Businesses:** set up a business profile with a logo, pick a category (or type their own), choose one, several, or all locations, post jobs, pay the listing fee (recorded manually), and manage applicants.
- **Admin (you):** confirm or reject payments (which publishes the job for 30 days by default), and mark businesses as verified.

The database, security rules, and storage buckets already exist in the Hadron Supabase project.

## Run it locally

```bash
npm install
cp .env.example .env.local   # then fill in the values
npm run dev
```

Open http://localhost:3000.

## Environment variables

| Variable | What it is |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase publishable key (safe to expose) |
| `NEXT_PUBLIC_SITE_URL` | Your live site address, used in email confirmation links |
| `NEXT_PUBLIC_LISTING_FEE_USD` | Fee shown to businesses, for example `10`. Leave empty to hide it. |
| `NEXT_PUBLIC_WHISH_NUMBER` | Number businesses pay to. Leave empty to hide it. |

Never put the Supabase `service_role` key in this app. It is not needed.

## Before going live: Supabase settings

In the Supabase dashboard, open **Authentication > URL Configuration** and:

1. Set **Site URL** to your live address, for example `https://hadron.vercel.app`.
2. Add `https://YOUR-DOMAIN/auth/callback` to **Redirect URLs**. Add `http://localhost:3000/auth/callback` too if you test locally.

Without this, email confirmation links point to the wrong address.

Also check **Authentication > Providers > Email**. If "Confirm email" is on, new people must click a link before logging in. That is the safer setting for a real launch. Supabase's built-in email sender is heavily rate limited, so before launch, set up your own SMTP provider under **Authentication > SMTP Settings**.

## Payments

The flow is unchanged: a business pays by Whish or OMT, records the payment, an admin confirms it, and the job goes live.

- **Settings:** admins set the listing fee, how many days a job stays live, and the Whish number on the **Admin** page (Payment settings). With a fee set, the amount is fixed. The database enforces it, so the browser cannot change it. With no fee set, businesses type the amount.
- **Payment code:** every job has a code such as `HAD-4F7K`. Businesses put it in the note of their transfer so payments can be matched.
- **One use per transaction number:** the same transaction number cannot be used twice (rejected and cancelled payments free it up).
- **Fix or cancel:** a business can change the method or transaction number, or cancel, until an admin confirms. Cancelled payments are kept as records.
- **One waiting payment per job** at a time.
- **Renewals:** a business can renew a job in the last 7 days. The new days are added on top of the time left.
- **History:** each job shows all its payments. Admins see how many are waiting in the top bar, oldest first, with a WhatsApp button for the business.

## Admin payment email alerts

When a business records a payment, the database calls `/api/notify-payment` on your site, and the site emails **every admin account**. (Supabase cannot send custom emails by itself, so this goes through your own mail account.) Limits: at most 4 alerts per business per hour, and each admin gets their own email.

Set these in **Vercel > Settings > Environment Variables**, then redeploy:

| Variable | Value |
| --- | --- |
| `PAYMENT_NOTIFY_SECRET` | already set for you (a secret shared with the database) |
| `SMTP_HOST` | `smtp.gmail.com` (already set) |
| `SMTP_PORT` | `465` (already set) |
| `SMTP_USER` | the Gmail address to send from |
| `SMTP_PASS` | a Gmail **app password** (Google Account > Security > 2-Step Verification > App passwords). Mark it Sensitive. |
| `NOTIFY_FROM_NAME` | `Hadron` (already set) |

To add a team member: they sign up, then run the admin SQL below for their email. From then on they get the alerts.

If the site address ever changes, update the address stored for the alert (table `private.notify_config`, column `url`).

## Confirmation email (do this before real users sign up)

The branded, Arabic and English confirmation email is in `emails/confirm-signup.html`.

1. In Supabase, open **Authentication > Emails > Templates > Confirm sign up**.
2. Copy the subject line from the top of the file into the subject box, and paste the rest of the file into the message body.
3. Your **Site URL** (Authentication > URL Configuration) must be your live address, because the logo in the email loads from `YOUR-SITE/email-logo.png`.

**Single use:** Supabase confirmation links only work once. A second click shows an error, and the app tells the person the link was already used and lets them request a new one from the log in page.

**15-minute expiry:** in **Authentication > Sign In / Providers > Email**, set **Email OTP Expiration** to `900` seconds. A Supabase issue reports that sign-up links may not follow that setting, so test it once: request a confirmation email, wait 16 minutes, and click the link. If it still works, the expiry can't be shortened from the dashboard. The email says 15 minutes, so only publish that wording once you have seen it behave that way.

**Sender:** Supabase's built-in email sender only delivers to members of your Supabase organization, and only a couple of emails per hour, so real users will not receive confirmation emails until you set up your own sender under **Authentication > SMTP Settings** (for example with Resend or Brevo, using an address on a domain you own). Until then, the only way to let real people sign up is to turn off "Confirm email" (Authentication > Sign In / Providers > Email), at the cost of not verifying email addresses.

## Make yourself an admin

Sign up normally, then run this once in the Supabase **SQL Editor** with your email:

```sql
update public.profiles
set role = 'admin'
where id = (select id from auth.users where email = 'you@example.com');
```

Admins can't be created from the app, on purpose. Then open `/en/admin` or `/ar/admin`.

## How payment works

1. A business creates a job. It starts as **Awaiting payment** and is not public.
2. The business pays you (for example by Whish), then records the amount and transaction reference in its dashboard.
3. You check the payment in your own account, then click **Confirm payment** in the admin page. The job goes live for the number of days you set (30 by default).
4. When a job expires, the business can pay again to renew it.

The app does not check the amount against your fee. Compare it yourself before confirming.

## Deploy to Vercel

Add the same environment variables in the Vercel project settings, then deploy from your Git repository or run `npx vercel --prod`.

## Project layout

```
src/app/[locale]/        pages (en and ar): home, jobs (Find work), post-a-job, login, signup, business, seeker, admin
src/app/actions/         server actions (all writes go through these, using the signed-in user's permissions)
src/lib/i18n.ts          every piece of text in English and Arabic
src/lib/supabase/        Supabase clients for server, browser, and middleware
src/components/          shared UI
src/middleware.ts        language redirect and login session refresh
```

## Not built yet

- Password reset
- Email notifications (new applicant, status change)
- Automated payments
- Pagination on the jobs list (it shows the newest 60)
- Job seeker email alerts
- Email reminders before a job expires (the renewal banner shows on the dashboard)
- Category filter on the jobs page

## Security notes

- Every table has row-level security, and the rules are tested (see the test list in the project chat history). Businesses only see their own applicants, seekers only their own data, and only admins can publish jobs, confirm payments, or verify businesses.
- The site sends security headers (content security policy, clickjacking protection, no MIME sniffing, strict transport security). They are set in `next.config.ts`.
- Text fields have size limits and format checks in the database as well as in the app.
- Files must sit in the uploader's own folder. Logos are limited to PNG/JPG/WebP, and CVs are private and only visible to a business the person applied to.
- `npm audit` reports a `postcss` issue inside Next.js 15's build tooling. The fix requires Next.js 16, and it only affects building untrusted CSS, which this site never does. Plan to upgrade to Next.js 16 later.
- In Supabase, consider turning on **leaked password protection** (Authentication > Sign In / Providers, if your plan includes it) and adding two-factor authentication for your admin account.
