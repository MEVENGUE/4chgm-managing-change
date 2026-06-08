'use client'

import Link from 'next/link'
import AmbientBackground from '@/components/ambient/AmbientBackground'
import LogoFull from '@/components/brand/LogoFull'
import Footer from '@/components/layout/Footer'
import { useTranslation } from '@/i18n/I18nProvider'

type Props = { title: string; children: React.ReactNode }

export default function LegalPage({ title, children }: Props) {
  const { t } = useTranslation()
  return (
    <div className="relative flex min-h-screen flex-col bg-[var(--bg-base)] text-[var(--text-primary)]">
      <AmbientBackground cursorGlow variant="full" />
      <div className="relative z-10 mx-auto w-full max-w-3xl flex-1 px-6 py-12">
        <Link href="/login" className="inline-block"><LogoFull /></Link>
        <h1 className="mt-10 text-2xl font-bold">{title}</h1>
        <p className="mt-2 text-xs text-[var(--text-muted)]">{t('legal.lastUpdated')}: June 2026</p>
        <div className="prose-legal mt-8 space-y-4 text-sm leading-relaxed text-[var(--text-secondary)]">{children}</div>
        <div className="mt-12 flex flex-wrap gap-4 text-xs text-[var(--text-muted)]">
          <Link href="/about" className="transition hover:text-[var(--text-secondary)]">About</Link>
          <Link href="/contact" className="transition hover:text-[var(--text-secondary)]">Contact</Link>
          <Link href="/privacy">{t('legal.privacy')}</Link>
          <Link href="/terms">{t('legal.terms')}</Link>
          <Link href="/cookies">{t('legal.cookies')}</Link>
        </div>
      </div>
      <Footer compact />
    </div>
  )
}
