'use client'

import LegalPage from '@/components/legal/LegalPage'
import { useTranslation } from '@/i18n/I18nProvider'
import { DATA_POLICY_SUMMARY } from '@/lib/dataPolicy'

export default function PrivacyPage() {
  const { t } = useTranslation()
  return (
    <LegalPage title={t('legal.privacy')}>
      <p>4CHGM — Managing Change (&quot;4CHGM&quot;, &quot;we&quot;, &quot;us&quot;) is committed to protecting your personal data in accordance with GDPR and applicable privacy regulations.</p>
      <h2 className="text-base font-semibold text-[var(--text-primary)]">Data we collect</h2>
      <p>Account information (name, email, company), usage analytics, workspace configuration, and AI interaction logs necessary to deliver enterprise intelligence services.</p>
      <h2 className="text-base font-semibold text-[var(--text-primary)]">How we use data</h2>
      <p>To provide the platform, personalize dashboards, power the AI copilot, generate insights, and improve product quality. We do not sell personal data.</p>

      <h2 className="text-base font-semibold text-[var(--text-primary)]">{DATA_POLICY_SUMMARY.title}</h2>
      <p>Les réponses IA sont adaptées aux données que vous fournissez (organisation, initiatives, documents). Le consentement est requis avant tout upload ou analyse IA.</p>
      <h3 className="text-sm font-semibold text-[var(--text-primary)]">Finalités</h3>
      <ul className="list-disc space-y-1 pl-5">
        {DATA_POLICY_SUMMARY.purposes.map((p) => (
          <li key={p}>{p}</li>
        ))}
      </ul>
      <h3 className="mt-3 text-sm font-semibold text-[var(--text-primary)]">Données traitées</h3>
      <ul className="list-disc space-y-1 pl-5">
        {DATA_POLICY_SUMMARY.dataProcessed.map((d) => (
          <li key={d}>{d}</li>
        ))}
      </ul>
      <p className="mt-2 text-sm text-[var(--text-secondary)]">{DATA_POLICY_SUMMARY.retention}</p>
      <p className="text-sm text-[var(--text-secondary)]">Tiers : {DATA_POLICY_SUMMARY.thirdParties.join(' · ')}</p>

      <h2 className="text-base font-semibold text-[var(--text-primary)]">Your rights</h2>
      <p>You may request access, correction, export, or deletion of your data. Contact privacy@4chgm.io. Account deletion architecture is prepared in Settings.</p>
      <ul className="list-disc space-y-1 pl-5">
        {DATA_POLICY_SUMMARY.rights.map((r) => (
          <li key={r}>{r}</li>
        ))}
      </ul>
      <h2 className="text-base font-semibold text-[var(--text-primary)]">Security</h2>
      <p>Enterprise-grade encryption in transit, session management, and audit-ready access controls.</p>
    </LegalPage>
  )
}
