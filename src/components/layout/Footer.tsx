'use client'

import Link from 'next/link'
import { FOUNDER, PRODUCT_VERSION } from '@/data/founder'
import { BRAND } from '@/lib/brand'

export default function Footer({ compact = false }: { compact?: boolean }) {
  const year = new Date().getFullYear()
  return (
    <footer className={`relative z-10 border-t border-[var(--border-subtle)] bg-[var(--bg-surface)]/60 backdrop-blur-xl ${compact ? 'px-4 py-6' : 'px-6 py-10 md:px-12'}`}>
      <div className={`mx-auto flex max-w-6xl flex-col gap-8 ${compact ? '' : 'md:flex-row md:items-start md:justify-between'}`}>
        <div className="max-w-sm">
          <p className="text-sm font-bold tracking-[0.16em] text-[var(--text-primary)]">{BRAND.name}</p>
          <p className="mt-1 text-xs font-medium text-[var(--primary)]">{BRAND.tagline}</p>
          <p className="mt-2 text-[11px] leading-relaxed text-[var(--text-muted)]">{BRAND.subtitle}</p>
          <p className="mt-4 text-[10px] text-[var(--text-muted)]">
            Built by {FOUNDER.name.split(' ').map((w) => w.charAt(0) + w.slice(1).toLowerCase()).join(' ')}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">Product</p>
            <nav className="mt-3 flex flex-col gap-2 text-xs text-[var(--text-secondary)]">
              <Link href="/about" className="transition hover:text-[var(--text-primary)]">About</Link>
              <Link href="/contact" className="transition hover:text-[var(--text-primary)]">Contact</Link>
              <Link href="/login" className="transition hover:text-[var(--text-primary)]">Sign in</Link>
            </nav>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">Legal</p>
            <nav className="mt-3 flex flex-col gap-2 text-xs text-[var(--text-secondary)]">
              <Link href="/privacy" className="transition hover:text-[var(--text-primary)]">Privacy</Link>
              <Link href="/terms" className="transition hover:text-[var(--text-primary)]">Terms</Link>
              <Link href="/cookies" className="transition hover:text-[var(--text-primary)]">Cookies</Link>
            </nav>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">Connect</p>
            <nav className="mt-3 flex flex-col gap-2 text-xs text-[var(--text-secondary)]">
              <a href={FOUNDER.links.github} target="_blank" rel="noopener noreferrer" className="transition hover:text-[var(--text-primary)]">GitHub</a>
              <a href={FOUNDER.links.linkedin} target="_blank" rel="noopener noreferrer" className="transition hover:text-[var(--text-primary)]">LinkedIn</a>
              <a href={`mailto:${FOUNDER.links.email}`} className="transition hover:text-[var(--text-primary)]">Email</a>
            </nav>
          </div>
        </div>
      </div>
      <div className="mx-auto mt-8 flex max-w-6xl flex-wrap items-center justify-between gap-2 border-t border-[var(--border-subtle)] pt-6 text-[10px] text-[var(--text-muted)]">
        <span>© {year} {BRAND.name}. All rights reserved.</span>
        <span>v{PRODUCT_VERSION}</span>
      </div>
    </footer>
  )
}
