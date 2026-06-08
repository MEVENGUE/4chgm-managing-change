'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import AmbientBackground from '@/components/ambient/AmbientBackground'
import AuthHeroScene from '@/components/cinematic/AuthHeroScene'
import PremiumAuthCard from '@/components/auth/PremiumAuthCard'
import LogoFull from '@/components/brand/LogoFull'
import Footer from '@/components/layout/Footer'
import { StaggerReveal, StaggerItem } from '@/components/motion/PageTransition'
import { useTranslation } from '@/i18n/I18nProvider'

type Props = { children: React.ReactNode; title: string; subtitle: string }

export default function AuthLayout({ children, title, subtitle }: Props) {
  const { t } = useTranslation()

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-[var(--bg-base)] text-[var(--text-primary)]">
      <AmbientBackground cursorGlow variant="full" />

      <div className="relative z-10 flex flex-1 overflow-hidden">
        {/* Cinematic hero — neural globe + floating insights */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="relative hidden w-1/2 border-r border-[var(--border-subtle)] lg:block"
        >
          <AuthHeroScene />
        </motion.div>

        {/* Premium login panel */}
        <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 py-12">
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8 lg:hidden"
          >
            <LogoFull />
          </motion.div>

          <PremiumAuthCard title={title} subtitle={subtitle}>
            {children}
          </PremiumAuthCard>

          <StaggerReveal className="mt-6 flex flex-wrap justify-center gap-4 text-[11px] text-[var(--text-muted)]">
            {[
              { href: '/about', label: 'About' },
              { href: '/contact', label: 'Contact' },
              { href: '/privacy', label: t('legal.privacy') },
              { href: '/terms', label: t('legal.terms') },
              { href: '/cookies', label: t('legal.cookies') },
            ].map((link) => (
              <StaggerItem key={link.href}>
                <Link href={link.href} className="transition hover:text-[var(--text-secondary)]">
                  {link.label}
                </Link>
              </StaggerItem>
            ))}
          </StaggerReveal>
        </div>
      </div>

      <Footer compact />
    </div>
  )
}
