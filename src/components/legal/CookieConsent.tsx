'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { BRAND } from '@/lib/brand'
import { useTranslation } from '@/i18n/I18nProvider'

const KEY = `${BRAND.storagePrefix}-cookies`

export default function CookieConsent() {
  const { t } = useTranslation()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    try {
      if (!localStorage.getItem(KEY)) setVisible(true)
    } catch {
      setVisible(true)
    }
  }, [])

  function accept() {
    try { localStorage.setItem(KEY, 'accepted') } catch { /* ignore */ }
    setVisible(false)
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-xl"
        >
          <div className="glass-panel-strong flex flex-col gap-3 rounded-2xl border border-[var(--border-medium)] p-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs leading-relaxed text-[var(--text-secondary)]">
              {t('legal.cookieBanner')}{' '}
              <Link href="/cookies" className="text-[var(--primary)] hover:underline">{t('legal.cookies')}</Link>
            </p>
            <div className="flex shrink-0 gap-2">
              <Link href="/cookies" className="rounded-full border border-[var(--border-subtle)] px-3 py-1.5 text-[11px] font-medium text-[var(--text-secondary)] transition hover:border-[var(--border-medium)]">
                {t('legal.manageCookies')}
              </Link>
              <button onClick={accept} className="rounded-full bg-[var(--primary)] px-4 py-1.5 text-[11px] font-semibold text-white transition hover:opacity-90">
                {t('legal.acceptCookies')}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
