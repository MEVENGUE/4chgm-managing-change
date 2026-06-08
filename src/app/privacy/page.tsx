'use client'

import LegalPage from '@/components/legal/LegalPage'
import { useTranslation } from '@/i18n/I18nProvider'

export default function PrivacyPage() {
  const { t } = useTranslation()
  return (
    <LegalPage title={t('legal.privacy')}>
      <p>4CHGM — Managing Change (&quot;4CHGM&quot;, &quot;we&quot;, &quot;us&quot;) is committed to protecting your personal data in accordance with GDPR and applicable privacy regulations.</p>
      <h2 className="text-base font-semibold text-[var(--text-primary)]">Data we collect</h2>
      <p>Account information (name, email, company), usage analytics, workspace configuration, and AI interaction logs necessary to deliver enterprise intelligence services.</p>
      <h2 className="text-base font-semibold text-[var(--text-primary)]">How we use data</h2>
      <p>To provide the platform, personalize dashboards, power the AI copilot, generate insights, and improve product quality. We do not sell personal data.</p>
      <h2 className="text-base font-semibold text-[var(--text-primary)]">Your rights</h2>
      <p>You may request access, correction, export, or deletion of your data. Contact privacy@4chgm.io. Account deletion architecture is prepared in Settings.</p>
      <h2 className="text-base font-semibold text-[var(--text-primary)]">Security</h2>
      <p>Enterprise-grade encryption in transit, session management, and audit-ready access controls.</p>
    </LegalPage>
  )
}
