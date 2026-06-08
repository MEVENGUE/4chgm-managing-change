'use client'

import AmbientBackground from '@/components/ambient/AmbientBackground'
import Footer from '@/components/layout/Footer'
import LogoFull from '@/components/brand/LogoFull'
import Link from 'next/link'

export default function MarketingShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col bg-[var(--bg-base)] text-[var(--text-primary)]">
      <AmbientBackground cursorGlow variant="full" />
      <header className="relative z-10 border-b border-[var(--border-subtle)] bg-[var(--bg-surface)]/50 px-6 py-4 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <Link href="/about"><LogoFull /></Link>
          <nav className="flex items-center gap-4 text-xs font-medium text-[var(--text-secondary)]">
            <Link href="/about" className="transition hover:text-[var(--text-primary)]">About</Link>
            <Link href="/contact" className="transition hover:text-[var(--text-primary)]">Contact</Link>
            <Link href="/login" className="rounded-full border border-[var(--border-medium)] bg-[var(--bg-surface)] px-4 py-2 transition hover:border-[var(--primary)]">Sign in</Link>
          </nav>
        </div>
      </header>
      <main className="relative z-10 flex-1">{children}</main>
      <Footer />
    </div>
  )
}
