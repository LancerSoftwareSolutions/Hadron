import type { Locale } from './i18n'

interface TermsContent {
  title: string
  updated: string
  intro: string
  sections: { heading: string; body: string[] }[]
  contactHeading: string
  contact: { before: string; or: string; after: string }
}

// A working draft. It should be reviewed by a lawyer before launch.
export const TERMS: Record<Locale, TermsContent> = {
  en: {
    title: `Terms & Conditions`,
    updated: `Last updated: 20 September 2026`,
    intro: `These terms explain how Hadron works and what we expect from everyone who uses it. Please read them before creating an account.`,
    sections: [
      {
        heading: `About Hadron`,
        body: [
          `Hadron is an online platform where businesses in Lebanon publish job listings and job seekers browse and apply for them.`,
          `Hadron is not an employer or a recruitment agency. We are not a party to any job offer, contract, or working relationship between a business and a job seeker, and we do not guarantee that anyone will be hired or that any listing is accurate.`,
        ],
      },
      {
        heading: `Using these terms`,
        body: [
          `By creating an account or using the site, you agree to these terms. If you do not agree, please do not use Hadron.`,
          `You must be at least 18 years old to create an account.`,
        ],
      },
      {
        heading: `Your account`,
        body: [
          `Give accurate information when you sign up and keep it up to date, including your phone number, because businesses and job seekers use it to contact each other.`,
          `Keep your password private. You are responsible for everything done through your account. Tell us straight away if you think someone else has used it.`,
          `We may suspend or close an account that breaks these terms or puts other people at risk.`,
        ],
      },
      {
        heading: `Job seekers`,
        body: [
          `Hadron is free for job seekers.`,
          `When you apply for a job, the business can see your name, phone number, profile details, cover note, and CV. Only apply for jobs you are comfortable sharing this with.`,
          `Take care before accepting any job. Never pay a business or anyone else in order to get a job, and never share bank or card details. If a listing looks suspicious, contact us so we can review it.`,
        ],
      },
      {
        heading: `Businesses`,
        body: [
          `Businesses must be genuine and must give accurate details about themselves and each job, including pay and location.`,
          `Job listings must be lawful and must not discriminate unfairly, mislead, or ask applicants for money. You must follow Lebanese labour law in everything you offer and do.`,
          `Use applicants' personal information only to consider them for the job they applied for. Keep it secure and do not share or sell it.`,
          `A "Verified" mark means we have checked some basic details about a business. It is not a guarantee of the business, its jobs, or its conduct.`,
        ],
      },
      {
        heading: `Listing fees and payments`,
        body: [
          `Businesses pay a fee to publish a job. The fee and payment details are shown on the Post a job page and in your business dashboard, and may change for future listings.`,
          `You pay using one of the methods we list, then record the payment with its reference number. We confirm payments by hand. A job goes live only after we confirm the payment, and it stays live for the period we set, usually 30 days, after which it expires.`,
          `We may reject a payment we cannot match or confirm, and the job stays unpublished until a payment is confirmed. Fees are not refunded once a job has been published, unless we decide otherwise or the law requires it.`,
        ],
      },
      {
        heading: `Content and conduct`,
        body: [
          `You are responsible for what you post or upload, including job listings, logos, profiles, and CVs. You keep ownership of it, and you give us permission to store and display it as needed to run Hadron.`,
          `You must not post anything that is illegal, false, abusive, or misleading, pretend to be another person or business, upload harmful files, or collect other people's data from the site by automated means. We may remove content or accounts that break these rules.`,
        ],
      },
      {
        heading: `Privacy and your data`,
        body: [
          `We collect the information you give us: your name, email, phone number, password, profile details, CV, business details, logos, job listings, applications, and payment references. We also receive basic technical information when you use the site.`,
          `We use it to run Hadron: to create your account, connect job seekers with businesses, confirm payments, keep the site secure, and contact you about your account.`,
          `Businesses see the details of people who apply to their jobs. Our administrators can see account data when needed to run and protect the service. We do not sell your personal information.`,
          `Your data is stored with our service providers: Supabase (database and file storage, hosted in Frankfurt, Germany) and Vercel (website hosting). Email may be sent through an email provider.`,
          `We use only essential cookies: to keep you logged in and to remember your language and light or dark mode choice. We do not use advertising or tracking cookies.`,
          `You can ask us to access, correct, or delete your data, including deleting your account, by contacting us. We keep information only as long as we need it for the purposes above or as the law requires.`,
        ],
      },
      {
        heading: `No guarantees and limits on our responsibility`,
        body: [
          `Hadron is provided "as is". We work to keep it available and accurate, but we do not promise that it will always be available or error-free, or that listings, applicants, or businesses are genuine.`,
          `We are not responsible for what businesses and job seekers say or do, or for any loss from a job offer, hiring decision, or interaction that begins on Hadron. To the extent the law allows, our responsibility to you is limited to the fees you paid us in the 12 months before the claim.`,
        ],
      },
      {
        heading: `Changes`,
        body: [
          `We may update the site or these terms. When we change the terms we will update the date at the top. If you keep using Hadron after a change, you accept the new terms.`,
        ],
      },
      {
        heading: `Governing law`,
        body: [`These terms are governed by the laws of Lebanon, and disputes will be handled by the competent courts of Lebanon.`],
      },
    ],
    contactHeading: `Contact us`,
    contact: {
      before: `For questions, data requests, or to report a listing, contact us on `,
      or: ` or at `,
      after: `.`,
    },
  },
  ar: {
    title: `الشروط والأحكام`,
    updated: `آخر تحديث: 20 أيلول 2026`,
    intro: `توضّح هذه الشروط طريقة عمل Hadron وما نتوقعه من كل من يستخدمه. يرجى قراءتها قبل إنشاء حساب.`,
    sections: [
      {
        heading: `حول Hadron`,
        body: [
          `Hadron منصة إلكترونية تتيح للأعمال في لبنان نشر الوظائف، وللباحثين عن عمل تصفّحها والتقديم عليها.`,
          `Hadron ليست صاحب عمل ولا مكتب توظيف. ولسنا طرفاً في أي عرض عمل أو عقد أو علاقة عمل بين نشاط تجاري وباحث عن عمل، ولا نضمن توظيف أحد ولا صحة أي وظيفة منشورة.`,
        ],
      },
      {
        heading: `استخدام هذه الشروط`,
        body: [
          `بإنشاء حساب أو استخدام الموقع فإنك توافق على هذه الشروط. وإذا كنت لا توافق عليها فيرجى عدم استخدام Hadron.`,
          `يجب أن يكون عمرك 18 سنة على الأقل لإنشاء حساب.`,
        ],
      },
      {
        heading: `حسابك`,
        body: [
          `قدّم معلومات صحيحة عند التسجيل وحافظ على تحديثها، بما في ذلك رقم هاتفك، لأن الأعمال والباحثين عن عمل يستخدمونه للتواصل.`,
          `حافظ على سرّية كلمة المرور. أنت مسؤول عن كل ما يجري عبر حسابك. أبلغنا فوراً إذا اعتقدت أن شخصاً آخر استخدمه.`,
          `يجوز لنا تعليق أو إغلاق أي حساب يخالف هذه الشروط أو يعرّض الآخرين للخطر.`,
        ],
      },
      {
        heading: `الباحثون عن عمل`,
        body: [
          `استخدام Hadron مجاني للباحثين عن عمل.`,
          `عند التقديم على وظيفة، يستطيع النشاط التجاري الاطلاع على اسمك ورقم هاتفك وبيانات ملفك ورسالتك التعريفية وسيرتك الذاتية. قدّم فقط على الوظائف التي ترتاح لمشاركة هذه المعلومات معها.`,
          `كن حذراً قبل قبول أي وظيفة. لا تدفع مالاً لأي نشاط تجاري أو لأي شخص للحصول على وظيفة، ولا تشارك بيانات حسابك المصرفي أو بطاقتك. وإذا بدت وظيفة مشبوهة فتواصل معنا لنراجعها.`,
        ],
      },
      {
        heading: `الأعمال`,
        body: [
          `يجب أن تكون الأعمال حقيقية وأن تقدّم معلومات صحيحة عن نفسها وعن كل وظيفة، بما في ذلك الأجر والموقع.`,
          `يجب أن تكون الوظائف المنشورة قانونية، وألّا تنطوي على تمييز غير عادل أو تضليل أو طلب مال من المتقدّمين. ويجب الالتزام بقانون العمل اللبناني في كل ما تعرضه وتفعله.`,
          `استخدم المعلومات الشخصية للمتقدّمين فقط للنظر في طلباتهم على الوظيفة التي قدّموا عليها. حافظ على أمانها ولا تشاركها ولا تبعها.`,
          `تعني علامة "موثّق" أننا تحققنا من بعض البيانات الأساسية للنشاط التجاري. وهي ليست ضماناً للنشاط التجاري أو لوظائفه أو لتصرفاته.`,
        ],
      },
      {
        heading: `رسوم النشر والدفع`,
        body: [
          `تدفع الأعمال رسماً لنشر الوظيفة. يظهر الرسم وتفاصيل الدفع في صفحة "انشر وظيفة" وفي لوحة نشاطك التجاري، وقد يتغيّر للوظائف اللاحقة.`,
          `تدفع بإحدى الطرق التي نعرضها، ثم تسجّل الدفعة مع رقم العملية. نؤكد الدفعات يدوياً. لا تُنشر الوظيفة إلا بعد تأكيد الدفعة، وتبقى منشورة للمدة التي نحدّدها، وهي عادةً 30 يوماً، ثم تنتهي.`,
          `يجوز لنا رفض دفعة لا نستطيع مطابقتها أو تأكيدها، وتبقى الوظيفة غير منشورة إلى أن تُؤكَّد دفعة. لا تُردّ الرسوم بعد نشر الوظيفة إلا إذا قررنا ذلك أو أوجبه القانون.`,
        ],
      },
      {
        heading: `المحتوى والسلوك`,
        body: [
          `أنت مسؤول عمّا تنشره أو ترفعه، بما في ذلك الوظائف والشعارات والملفات الشخصية والسير الذاتية. تبقى ملكيته لك، وتمنحنا الإذن بتخزينه وعرضه بالقدر اللازم لتشغيل Hadron.`,
          `لا يجوز نشر أي محتوى غير قانوني أو كاذب أو مسيء أو مضلّل، ولا انتحال شخصية شخص أو نشاط تجاري آخر، ولا رفع ملفات ضارة، ولا جمع بيانات الآخرين من الموقع بوسائل آلية. ويجوز لنا حذف المحتوى أو الحسابات المخالفة لهذه القواعد.`,
        ],
      },
      {
        heading: `الخصوصية وبياناتك`,
        body: [
          `نجمع المعلومات التي تقدّمها لنا: اسمك وبريدك الإلكتروني ورقم هاتفك وكلمة المرور وبيانات ملفك وسيرتك الذاتية وبيانات نشاطك التجاري وشعاراتك ووظائفك وطلبات التقديم وأرقام عمليات الدفع. كما نتلقى معلومات تقنية أساسية عند استخدامك الموقع.`,
          `نستخدمها لتشغيل Hadron: لإنشاء حسابك، وربط الباحثين عن عمل بالأعمال، وتأكيد الدفعات، وحماية الموقع، والتواصل معك بشأن حسابك.`,
          `ترى الأعمال بيانات من يقدّمون على وظائفها. ويستطيع مديرو الموقع الاطلاع على بيانات الحسابات عند الحاجة لتشغيل الخدمة وحمايتها. لا نبيع معلوماتك الشخصية.`,
          `تُخزَّن بياناتك لدى مزوّدي الخدمة: Supabase (قاعدة البيانات وتخزين الملفات، على خوادم في فرانكفورت بألمانيا) وVercel (استضافة الموقع). وقد تُرسل رسائل البريد الإلكتروني عبر مزوّد بريد.`,
          `نستخدم ملفات تعريف الارتباط الضرورية فقط: لإبقائك مسجّلاً الدخول ولتذكّر اختيارك للغة والوضع الفاتح أو الداكن. لا نستخدم ملفات تعريف ارتباط للإعلانات أو للتتبّع.`,
          `يمكنك أن تطلب الاطلاع على بياناتك أو تصحيحها أو حذفها، بما في ذلك حذف حسابك، بالتواصل معنا. نحتفظ بالمعلومات فقط للمدة اللازمة للأغراض المذكورة أو التي يفرضها القانون.`,
        ],
      },
      {
        heading: `عدم الضمان وحدود المسؤولية`,
        body: [
          `يُقدَّم Hadron "كما هو". نعمل على إبقائه متاحاً ودقيقاً، لكننا لا نعد بأنه سيعمل دائماً ودون أخطاء، ولا بأن الوظائف أو المتقدّمين أو الأعمال حقيقيون.`,
          `لسنا مسؤولين عمّا يقوله أو يفعله أصحاب الأعمال والباحثون عن عمل، ولا عن أي خسارة ناتجة عن عرض عمل أو قرار توظيف أو تعامل بدأ عبر Hadron. وبالقدر الذي يسمح به القانون، تقتصر مسؤوليتنا تجاهك على الرسوم التي دفعتها لنا خلال الاثني عشر شهراً السابقة للمطالبة.`,
        ],
      },
      {
        heading: `التغييرات`,
        body: [`قد نحدّث الموقع أو هذه الشروط. وعند تغيير الشروط سنحدّث التاريخ في أعلى الصفحة. باستمرارك في استخدام Hadron بعد التغيير فإنك تقبل الشروط الجديدة.`],
      },
      {
        heading: `القانون الواجب التطبيق`,
        body: [`تخضع هذه الشروط لقوانين لبنان، وتنظر في أي نزاع المحاكم اللبنانية المختصة.`],
      },
    ],
    contactHeading: `تواصل معنا`,
    contact: {
      before: `للاستفسارات أو طلبات البيانات أو للإبلاغ عن وظيفة، تواصل معنا على `,
      or: ` أو عبر `,
      after: `.`,
    },
  },
}
