'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { BRAND } from '@/lib/brand'
import { DEFAULT_LOCALE, isLocale, type Locale } from './config'
import { getDictionary, translate, type Dictionary } from './dictionaries'

type I18nContextValue = {
  locale: Locale
  dict: Dictionary
  setLocale: (locale: Locale) => void
  t: (key: string, params?: Record<string, string>) => string
  ready: boolean
}

const I18nContext = createContext<I18nContextValue | null>(null)
const STORAGE_KEY = `${BRAND.storagePrefix}-locale`
const LEGACY_KEY = 'nexora-locale'

function detectLocale(): Locale {
  if (typeof window === 'undefined') return DEFAULT_LOCALE
  try {
    const stored = localStorage.getItem(STORAGE_KEY) ?? localStorage.getItem(LEGACY_KEY)
    if (stored && isLocale(stored)) return stored
    const browser = navigator.language.slice(0, 2)
    if (isLocale(browser)) return browser
  } catch {
    /* ignore */
  }
  return DEFAULT_LOCALE
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setLocaleState(detectLocale())
    setReady(true)
  }, [])

  useEffect(() => {
    if (!ready) return
    document.documentElement.lang = locale
    try {
      localStorage.setItem(STORAGE_KEY, locale)
    } catch {
      /* ignore */
    }
  }, [locale, ready])

  const setLocale = useCallback((l: Locale) => setLocaleState(l), [])
  const dict = useMemo(() => getDictionary(locale), [locale])
  const t = useCallback((key: string, params?: Record<string, string>) => translate(dict, key, params), [dict])

  const value = useMemo(() => ({ locale, dict, setLocale, t, ready }), [locale, dict, setLocale, t, ready])

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n() {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n must be used within I18nProvider')
  return ctx
}

/** Shorthand for `t(key)` */
export function useTranslation() {
  const { t, locale, setLocale, dict } = useI18n()
  return { t, locale, setLocale, dict }
}
