import type { Locale } from './config'
import en from './locales/en.json'
import fr from './locales/fr.json'
import de from './locales/de.json'
import zh from './locales/zh.json'
import ja from './locales/ja.json'
import ru from './locales/ru.json'

export type Dictionary = typeof en

const dictionaries: Record<Locale, Dictionary> = { en, fr, de, zh, ja, ru }

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale] ?? en
}

/** Dot-path lookup with `{param}` interpolation */
export function translate(dict: Dictionary, key: string, params?: Record<string, string>): string {
  const parts = key.split('.')
  let cur: unknown = dict
  for (const p of parts) {
    if (cur && typeof cur === 'object' && p in (cur as object)) cur = (cur as Record<string, unknown>)[p]
    else return key
  }
  if (typeof cur !== 'string') return key
  if (!params) return cur
  return Object.entries(params).reduce((s, [k, v]) => s.replace(`{${k}}`, v), cur)
}
