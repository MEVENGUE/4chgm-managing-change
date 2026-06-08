'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Sparkles, ArrowRight } from 'lucide-react'
import { useOrganization } from '@/providers/OrganizationProvider'
import { useTranslation } from '@/i18n/I18nProvider'

export default function OnboardingBanner() {
  const { ready, organization } = useOrganization()
  const { t } = useTranslation()
  if (!ready || organization.onboarded) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[var(--border-medium)] bg-gradient-to-r from-[var(--primary)]/12 to-[var(--secondary)]/10 px-5 py-3.5"
    >
      <div className="flex items-center gap-3">
        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)]">
          <Sparkles className="h-4 w-4 text-white" />
        </span>
        <div>
          <p className="text-sm font-semibold text-[var(--text-primary)]">{t('onboarding.banner')}</p>
          <p className="text-xs text-[var(--text-muted)]">{t('onboarding.bannerDesc')}</p>
        </div>
      </div>
      <Link href="/onboarding" className="flex items-center gap-2 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] px-4 py-2 text-xs font-semibold text-white shadow-lg transition hover:opacity-90">
        {t('common.continue')} <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </motion.div>
  )
}
