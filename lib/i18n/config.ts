export const LOCALES = ['en', 'ur'] as const
export type Locale = (typeof LOCALES)[number]
export const DEFAULT_LOCALE: Locale = 'en'
export const LOCALE_COOKIE = 'irms-lang'

export const LOCALE_NAMES: Record<Locale, string> = {
  en: 'English',
  ur: 'اردو',
}

/** Translation dictionary. Add keys as screens are localized. */
export const DICT: Record<Locale, Record<string, string>> = {
  en: {
    'nav.dashboard': 'Dashboard',
    'nav.newRequest': 'New request',
    'nav.myRequests': 'My requests',
    'nav.myLetters': 'My letters',
    'nav.profile': 'Profile',
    'nav.requests': 'Requests',
    'nav.template': 'Letter template',
    'common.signIn': 'Sign in',
    'common.signOut': 'Sign out',
    'common.verifyLetter': 'Verify a letter',
    'common.office': 'Internship Reference Office',
    'landing.eyebrow': 'Internship Reference Office',
    'landing.title1': 'Official internship reference letters,',
    'landing.titleAccent': 'issued and verified',
    'landing.title2': 'in one place.',
    'landing.subtitle':
      'Request a department-signed reference letter for your summer internship. Each letter carries a unique reference number and a scannable seal, so any employer can confirm it is genuine in seconds.',
    'landing.ctaRequest': 'Request a letter',
    'landing.ctaVerify': 'Verify a reference number',
    'landing.signupHint': 'Sign up with your',
    'landing.email': 'email.',
    'landing.step1Title': 'Request',
    'landing.step1Desc': 'Fill in the company and internship details. Your registration number is read from your university email.',
    'landing.step2Title': 'Approve',
    'landing.step2Desc': 'The coordinator reviews and approves. A serial number and sealed PDF are generated automatically.',
    'landing.step3Title': 'Verify',
    'landing.step3Desc': 'Download, print, and get it stamped. Employers verify it by scanning the seal or entering the reference number.',
    'landing.footer': 'COMSATS University Islamabad, Sahiwal Campus — Department of Computer Science',
  },
  ur: {
    'nav.dashboard': 'ڈیش بورڈ',
    'nav.newRequest': 'نئی درخواست',
    'nav.myRequests': 'میری درخواستیں',
    'nav.myLetters': 'میرے خطوط',
    'nav.profile': 'پروفائل',
    'nav.requests': 'درخواستیں',
    'nav.template': 'خط کا ٹیمپلیٹ',
    'common.signIn': 'سائن ان',
    'common.signOut': 'سائن آؤٹ',
    'common.verifyLetter': 'خط کی تصدیق',
    'common.office': 'انٹرن شپ ریفرنس آفس',
    'landing.eyebrow': 'انٹرن شپ ریفرنس آفس',
    'landing.title1': 'آفیشل انٹرن شپ ریفرنس خطوط،',
    'landing.titleAccent': 'جاری اور تصدیق شدہ',
    'landing.title2': 'ایک ہی جگہ۔',
    'landing.subtitle':
      'اپنی سمر انٹرن شپ کے لیے ڈیپارٹمنٹ کی دستخط شدہ ریفرنس لیٹر حاصل کریں۔ ہر خط پر ایک منفرد ریفرنس نمبر اور اسکین ہونے والی مہر ہوتی ہے، تاکہ کوئی بھی ادارہ سیکنڈوں میں اس کی اصل ہونے کی تصدیق کر سکے۔',
    'landing.ctaRequest': 'خط کی درخواست کریں',
    'landing.ctaVerify': 'ریفرنس نمبر کی تصدیق کریں',
    'landing.signupHint': 'سائن اپ کریں اپنی',
    'landing.email': 'ای میل سے۔',
    'landing.step1Title': 'درخواست',
    'landing.step1Desc': 'کمپنی اور انٹرن شپ کی تفصیلات بھریں۔ آپ کا رجسٹریشن نمبر آپ کی یونیورسٹی ای میل سے لیا جاتا ہے۔',
    'landing.step2Title': 'منظوری',
    'landing.step2Desc': 'کوآرڈینیٹر جائزہ لے کر منظوری دیتا ہے۔ سیریل نمبر اور مہر شدہ PDF خود بخود بن جاتی ہے۔',
    'landing.step3Title': 'تصدیق',
    'landing.step3Desc': 'ڈاؤن لوڈ کریں، پرنٹ کریں اور مہر لگوائیں۔ ادارے مہر اسکین کر کے یا ریفرنس نمبر درج کر کے تصدیق کرتے ہیں۔',
    'landing.footer': 'کامسیٹس یونیورسٹی اسلام آباد، ساہیوال کیمپس — شعبہ کمپیوٹر سائنس',
  },
}

export function translate(locale: Locale, key: string): string {
  return DICT[locale]?.[key] ?? DICT[DEFAULT_LOCALE][key] ?? key
}
