'use client'

import { useState, useRef, useEffect } from 'react'
import { Globe, Check } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { LOCALES, LOCALE_LABELS, type Locale } from '@/i18n/config'
import { useTranslation } from '@/i18n/I18nProvider'

export default function LanguageSwitcher() {
  const { locale, setLocale, t } = useTranslation()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [open])

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 rounded-full border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--text-secondary)] transition hover:border-[var(--border-medium)]"
        aria-label={t('common.language')}
      >
        <Globe className="h-3.5 w-3.5" />
        {locale}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="dropdown-panel absolute right-0 top-full z-50 mt-2 w-40 p-1.5"
          >
            {LOCALES.map((l) => (
              <button
                key={l}
                onClick={() => { setLocale(l as Locale); setOpen(false) }}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs text-[var(--text-secondary)] transition hover:bg-[var(--bg-surface-hover)] hover:text-[var(--text-primary)]"
              >
                <span className="flex-1">{LOCALE_LABELS[l as Locale]}</span>
                {locale === l && <Check className="h-3.5 w-3.5 text-[var(--primary)]" />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
