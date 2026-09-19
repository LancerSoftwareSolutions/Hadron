# Hadron

A bilingual (Arabic and English) job board for Lebanon. Businesses pay a listing fee to publish jobs. Job seekers create a profile, upload a CV, and apply. Built with Next.js on Vercel and Supabase.

## What it does

- **Job seekers:** browse and search jobs, create an account, build a profile, upload a CV, apply, and track application status.
- **Businesses:** set up a business profile with a logo, post jobs, pay the listing fee (recorded manually), and manage applicants.
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
src/app/[locale]/        pages (en and ar): home, jobs, login, signup, business, seeker, admin
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
