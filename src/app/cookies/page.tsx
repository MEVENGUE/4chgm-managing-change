'use client'

import LegalPage from '@/components/legal/LegalPage'
import { useTranslation } from '@/i18n/I18nProvider'

export default function CookiesPage() {
  const { t } = useTranslation()
  return (
    <LegalPage title={t('legal.cookies')}>
      <p>4CHGM uses cookies and local storage to maintain sessions, preferences, language selection, and anonymized usage analytics.</p>
      <h2 className="text-base font-semibold text-[var(--text-primary)]">Essential cookies</h2>
      <p>Authentication session, theme, locale, and workspace context. Required for platform operation.</p>
      <h2 className="text-base font-semibold text-[var(--text-primary)]">Analytics cookies</h2>
      <p>Optional usage metrics to improve product experience. You may decline via the cookie banner.</p>
      <h2 className="text-base font-semibold text-[var(--text-primary)]">Managing cookies</h2>
      <p>Use browser settings or our cookie consent banner. Clearing cookies will sign you out and reset preferences.</p>
    </LegalPage>
  )
}
