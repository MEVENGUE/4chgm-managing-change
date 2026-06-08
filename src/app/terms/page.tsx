'use client'

import LegalPage from '@/components/legal/LegalPage'
import { useTranslation } from '@/i18n/I18nProvider'

export default function TermsPage() {
  const { t } = useTranslation()
  return (
    <LegalPage title={t('legal.terms')}>
      <p>By using 4CHGM — Managing Change, you agree to these Terms of Service governing access to our AI-powered change management platform.</p>
      <h2 className="text-base font-semibold text-[var(--text-primary)]">Service</h2>
      <p>4CHGM provides enterprise dashboards, AI copilot, analytics, and transformation management tools on a subscription or trial basis.</p>
      <h2 className="text-base font-semibold text-[var(--text-primary)]">Acceptable use</h2>
      <p>You agree not to misuse the platform, attempt unauthorized access, or upload unlawful content. Enterprise administrators may enforce organization policies.</p>
      <h2 className="text-base font-semibold text-[var(--text-primary)]">AI outputs</h2>
      <p>AI-generated insights are advisory. Critical business decisions require human validation.</p>
      <h2 className="text-base font-semibold text-[var(--text-primary)]">Liability</h2>
      <p>The service is provided as-is within the limits permitted by law. See your enterprise agreement for SLA terms.</p>
    </LegalPage>
  )
}
