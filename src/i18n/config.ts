export const LOCALES = ['en', 'fr', 'de', 'zh', 'ja', 'ru'] as const
export type Locale = (typeof LOCALES)[number]

export const LOCALE_LABELS: Record<Locale, string> = {
  en: 'English',
  fr: 'Français',
  de: 'Deutsch',
  zh: '中文',
  ja: '日本語',
  ru: 'Русский',
}

export const DEFAULT_LOCALE: Locale = 'en'

export function isLocale(v: string): v is Locale {
  return (LOCALES as readonly string[]).includes(v)
}
