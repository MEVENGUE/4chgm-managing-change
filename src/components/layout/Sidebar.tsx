'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, Menu, X } from 'lucide-react'
import { NAV_ITEMS, isActiveRoute } from '@/lib/navigation'
import { useShell } from '@/providers/ShellProvider'
import { useOrganization } from '@/providers/OrganizationProvider'
import { canAccess } from '@/lib/rbac'
import { useTranslation } from '@/i18n/I18nProvider'
import LogoFull from '@/components/brand/LogoFull'
import { fetchHealthScore } from '@/services/dashboard'
import { useEffect, useState } from 'react'

function NavLink({
  href,
  label,
  icon: Icon,
  badge,
  collapsed,
  active,
  dimmed,
  onClick,
}: {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string
  collapsed: boolean
  active: boolean
  dimmed?: boolean
  onClick?: () => void
}) {
  const { t } = useTranslation()
  return (
    <Link
      href={href}
      onClick={onClick}
      title={collapsed ? label : undefined}
      className={`sidebar-item ${active ? 'active' : ''} ${collapsed ? 'collapsed' : ''} ${dimmed && !active ? 'opacity-40 hover:opacity-100' : ''}`}
    >
      <Icon className="h-[18px] w-[18px] shrink-0" />
      {!collapsed && (
        <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-1 items-center justify-between truncate">
          <span>{label}</span>
          {badge && (
            <span className="ml-2 rounded-full border border-[var(--border-medium)] px-1.5 py-0.5 text-[9px] font-semibold tracking-wider text-[var(--primary)]">
              {t('common.beta')}
            </span>
          )}
        </motion.span>
      )}
    </Link>
  )
}

function SystemStatusWidget({ collapsed, healthScore }: { collapsed: boolean; healthScore: number }) {
  if (collapsed) {
    return (
      <div className="flex justify-center" title={`Health: ${healthScore}%`}>
        <div className="relative h-10 w-10">
          <svg className="h-10 w-10 -rotate-90" viewBox="0 0 36 36">
            <circle cx="18" cy="18" r="15" fill="none" stroke="var(--border-subtle)" strokeWidth="2" />
            <circle cx="18" cy="18" r="15" fill="none" stroke="var(--success)" strokeWidth="2" strokeDasharray={`${healthScore} 100`} strokeLinecap="round" />
          </svg>
        </div>
      </div>
    )
  }
  return (
    <div className="glass-panel-strong rounded-2xl p-4">
      <div className="flex items-center gap-2">
        <span className="h-2 w-2 rounded-full bg-[var(--success)] animate-pulse-soft" />
        <p className="text-[10px] font-medium tracking-[0.2em] text-[var(--text-muted)]">ALL SYSTEMS OPERATIONAL</p>
      </div>
      <p className="mt-2 text-2xl font-bold tracking-tight text-[var(--success)]">{healthScore}%</p>
      <p className="mt-0.5 text-[10px] font-medium text-[var(--text-muted)]">HEALTH SCORE</p>
      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-[var(--bg-surface-strong)]">
        <motion.div className="h-full rounded-full bg-[var(--success)]" initial={{ width: 0 }} animate={{ width: `${healthScore}%` }} transition={{ duration: 1, ease: 'easeOut' }} />
      </div>
    </div>
  )
}

function SidebarContent({ collapsed, onNavClick }: { collapsed: boolean; onNavClick?: () => void }) {
  const pathname = usePathname()
  const { activeWorkspace } = useOrganization()
  const { t } = useTranslation()
  const [healthScore, setHealthScore] = useState(98.6)

  useEffect(() => {
    fetchHealthScore().then(setHealthScore)
  }, [])

  return (
    <>
      <div className={`mb-6 ${collapsed ? 'flex justify-center' : ''}`}>
        {collapsed ? (
          <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--border-medium)] bg-gradient-to-br from-[var(--primary)]/20 to-[var(--secondary)]/20">
            <span className="text-xs font-bold tracking-tighter text-[var(--primary)]">4C</span>
          </div>
        ) : (
          <LogoFull />
        )}
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto scrollbar-hide">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.href}
            href={item.href}
            label={t(item.key)}
            icon={item.icon}
            badge={item.badge}
            collapsed={collapsed}
            active={isActiveRoute(pathname, item.href)}
            dimmed={activeWorkspace ? !canAccess(activeWorkspace.view, item.href) : false}
            onClick={onNavClick}
          />
        ))}
      </nav>

      <div className="mt-6">
        <SystemStatusWidget collapsed={collapsed} healthScore={healthScore} />
      </div>
    </>
  )
}

export default function Sidebar() {
  const { sidebarCollapsed, toggleSidebar, mobileOpen, setMobileOpen } = useShell()

  return (
    <>
      <button
        className="fixed left-4 top-4 z-50 flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border-subtle)] bg-[var(--glass-bg)] backdrop-blur-xl md:hidden"
        onClick={() => setMobileOpen(true)}
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5 text-[var(--text-primary)]" />
      </button>

      <motion.aside
        animate={{ width: sidebarCollapsed ? 'var(--sidebar-collapsed)' : 'var(--sidebar-width)' }}
        transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
        className={`relative hidden shrink-0 flex-col border-r border-[var(--sidebar-border)] bg-[var(--sidebar-bg)] backdrop-blur-2xl md:flex ${sidebarCollapsed ? 'px-3 py-5' : 'p-5'}`}
        style={{ zIndex: 'var(--z-sidebar)' }}
      >
        <button
          onClick={toggleSidebar}
          className="absolute -right-3 top-8 z-10 flex h-6 w-6 items-center justify-center rounded-full border border-[var(--border-medium)] bg-[var(--bg-elevated)] transition hover:border-[var(--primary)]"
          aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {sidebarCollapsed ? <ChevronRight className="h-3.5 w-3.5 text-[var(--text-muted)]" /> : <ChevronLeft className="h-3.5 w-3.5 text-[var(--text-muted)]" />}
        </button>
        <SidebarContent collapsed={sidebarCollapsed} />
      </motion.aside>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-[var(--bg-overlay)] backdrop-blur-sm md:hidden" onClick={() => setMobileOpen(false)} />
            <motion.aside initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }} className="fixed inset-y-0 left-0 z-60 flex w-72 flex-col border-r border-[var(--sidebar-border)] bg-[var(--sidebar-bg)] p-5 backdrop-blur-2xl md:hidden">
              <button className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-lg hover:bg-[var(--sidebar-item-hover)]" onClick={() => setMobileOpen(false)} aria-label="Close menu">
                <X className="h-5 w-5 text-[var(--text-muted)]" />
              </button>
              <SidebarContent collapsed={false} onNavClick={() => setMobileOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
