import type { Dict } from '@/lib/i18n'
import { CURRENCIES, JOB_TYPES, SALARY_PERIODS } from '@/lib/constants'
import { Field, SelectField, TextArea } from './Field'
import { AreaPicker } from './AreaPicker'
import { SalaryFields } from './SalaryFields'

export interface ListingDefaults {
  title: string
  description: string
  job_type: string
  areas: string[]
  salary_min: number | null
  salary_max: number | null
  salary_currency: string
  salary_period: string | null
  display_name: string | null
  contact_email: string | null
  contact_phone: string | null
  contact_website: string | null
}

// The fields of a job, used by both the "new job" and "edit job" forms.
export function ListingFields({ t, idPrefix, defaults: d }: { t: Dict; idPrefix: string; defaults: ListingDefaults }) {
  return (
    <>
      <Field label={t.business.jobTitle} name="title" id={`${idPrefix}-title`} required maxLength={150} defaultValue={d.title} />
      <TextArea
        label={t.business.jobDescription}
        name="description"
        id={`${idPrefix}-description`}
        required
        rows={6}
        maxLength={5000}
        hint={t.business.jobDescriptionHint}
        defaultValue={d.description}
      />
      <SelectField
        label={t.business.jobType}
        name="job_type"
        id={`${idPrefix}-type`}
        options={JOB_TYPES.map((j) => ({ value: j, label: t.jobTypes[j] }))}
        defaultValue={d.job_type}
      />
      <AreaPicker idPrefix={idPrefix} label={t.business.areasJob} hint={t.business.areasHint} selected={d.areas} labels={t.areas} />
      <SalaryFields
        idPrefix={idPrefix}
        labels={{
          type: t.business.salaryType,
          choose: t.business.chooseSalaryType,
          min: t.business.salaryMin,
          max: t.business.salaryMax,
          currency: t.business.currency,
          hint: t.business.salaryHint,
        }}
        periodOptions={SALARY_PERIODS.map((p) => ({ value: p, label: t.salaryTypes[p] }))}
        perLabels={t.salaryPer}
        currencyOptions={CURRENCIES.map((c) => ({ value: c, label: c }))}
        defaults={{ period: d.salary_period, min: d.salary_min, max: d.salary_max, currency: d.salary_currency }}
      />

      <fieldset className="grid gap-4 rounded-xl border border-line p-4">
        <legend className="px-2 font-extrabold">{t.business.contactTitle}</legend>
        <p className="hint !mt-0">{t.business.contactHint}</p>
        <Field label={t.business.displayName} name="display_name" id={`${idPrefix}-display-name`} maxLength={100} defaultValue={d.display_name} />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={t.business.email} name="contact_email" id={`${idPrefix}-contact-email`} type="email" inputMode="email" maxLength={120} defaultValue={d.contact_email} />
          <Field label={t.business.phone} name="contact_phone" id={`${idPrefix}-contact-phone`} type="tel" inputMode="tel" maxLength={40} defaultValue={d.contact_phone} />
        </div>
        <TextArea
          label={t.business.website}
          name="contact_website"
          id={`${idPrefix}-contact-website`}
          rows={2}
          noResize
          inputMode="url"
          maxLength={200}
          defaultValue={d.contact_website}
          placeholder={t.business.websitePlaceholder}
        />
      </fieldset>
    </>
  )
}
