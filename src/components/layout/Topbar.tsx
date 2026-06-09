'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
import { Bell, Search, Sun, Moon, Star, Calendar, ChevronDown, ChevronsUpDown, Check, Layers, User, Settings, LogOut } from 'lucide-react'
import { useTheme } from '@/providers/ThemeProvider'
import { useShell } from '@/providers/ShellProvider'
import { useOrganization } from '@/providers/OrganizationProvider'
import { useAuth } from '@/providers/AuthProvider'
import { useTranslation } from '@/i18n/I18nProvider'
import LanguageSwitcher from '@/components/layout/LanguageSwitcher'
import { displayName } from '@/services/user/userService'
import { useIntelligence } from '@/providers/IntelligenceProvider'

function Dropdown({
  open,
  onClose,
  children,
  className = '',
  align = 'right',
}: {
  open: boolean
  onClose: () => void
  children: React.ReactNode
  className?: string
  align?: 'left' | 'right'
}) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) onClose() }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open, onClose])
  const alignClass = align === 'left' ? 'left-0 right-auto' : 'right-0 left-auto'
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: -8, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.96 }}
          transition={{ duration: 0.15 }}
          className={`dropdown-panel absolute top-full z-[200] mt-2 ${alignClass} ${className}`}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default function Topbar() {
  const { theme, toggleTheme } = useTheme()
  const { setCommandPaletteOpen } = useShell()
  const { organization, workspaces, activeWorkspace, setActiveWorkspace } = useOrganization()
  const { user, logout } = useAuth()
  const { t } = useTranslation()
  const intel = useIntelligence()
  const [notifOpen, setNotifOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [wsOpen, setWsOpen] = useState(false)
  const notifications = intel.notifications
  const unreadCount = notifications.filter((n) => n.severity === 'high' || n.severity === 'medium').length
  const orgName = organization.onboarded ? organization.name : t('common.personalWorkspace')
  const name = user ? displayName(user) : 'Guest'
  const role = user?.role ?? ''
  const email = user?.email ?? ''

  return (
    <header className="topbar-glass flex items-center justify-between px-4 py-3 md:px-6" style={{ minHeight: 'var(--topbar-height)' }}>
      <div className="flex items-center gap-4 pl-12 md:pl-0">
        <span className="text-sm font-bold tracking-[0.18em] text-[var(--text-primary)] md:hidden">4CHGM</span>
        <div className="relative hidden overflow-visible md:block">
          <button
            type="button"
            aria-expanded={wsOpen}
            aria-haspopup="listbox"
            onClick={() => { setWsOpen(!wsOpen); setNotifOpen(false); setProfileOpen(false) }}
            className={`workspace-switcher-trigger relative flex items-center gap-2.5 rounded-2xl border px-3 py-1.5 transition ${
              wsOpen
                ? 'border-[var(--primary)] bg-[color-mix(in_srgb,var(--primary)_10%,var(--bg-surface))] shadow-[0_0_0_3px_color-mix(in_srgb,var(--primary)_18%,transparent)]'
                : 'border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:border-[var(--border-medium)]'
            }`}
          >
            {wsOpen && (
              <span
                className="pointer-events-none absolute left-0 top-1/2 h-[55%] w-[3px] -translate-y-1/2 rounded-full"
                style={{ background: 'var(--sidebar-indicator)', boxShadow: '0 0 8px var(--glow-primary)' }}
                aria-hidden
              />
            )}
            <span className="flex h-7 w-7 items-center justify-center rounded-lg text-white" style={{ background: activeWorkspace.accent }}>
              <Layers className="h-3.5 w-3.5" />
            </span>
            <span className="text-left">
              <span className="block text-[10px] leading-none text-[var(--text-muted)]">{orgName}</span>
              <span className="block text-xs font-semibold leading-tight text-[var(--text-primary)]">{activeWorkspace.name}</span>
            </span>
            <ChevronsUpDown className={`h-3.5 w-3.5 transition ${wsOpen ? 'rotate-180 text-[var(--primary)]' : 'text-[var(--text-muted)]'}`} />
          </button>
          <Dropdown
            open={wsOpen}
            onClose={() => setWsOpen(false)}
            align="left"
            className="workspace-dropdown-panel w-[min(20rem,calc(100vw-1.5rem))] overflow-hidden p-0"
          >
            <div className="border-b border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-4 py-3">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">{t('common.workspaces')}</p>
              <p className="mt-1 truncate text-sm font-semibold text-[var(--text-primary)]">{orgName}</p>
            </div>
            <div className="max-h-[min(22rem,55vh)] overflow-y-auto p-2 scrollbar-hide" role="listbox" aria-label={t('common.workspaces')}>
              {workspaces.map((ws) => {
                const active = activeWorkspace.id === ws.id
                return (
                  <button
                    key={ws.id}
                    type="button"
                    role="option"
                    aria-selected={active}
                    onClick={() => { setActiveWorkspace(ws.id); setWsOpen(false) }}
                    className={`workspace-menu-item mb-1 flex w-full items-center gap-3 rounded-2xl border py-3 pr-3 text-left transition last:mb-0 ${
                      active ? 'active pl-4' : 'border-transparent pl-3 hover:border-[var(--border-subtle)] hover:bg-[var(--bg-surface-hover)]'
                    }`}
                  >
                    <span
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xs font-bold text-white shadow-sm"
                      style={{ background: `linear-gradient(135deg, ${ws.accent}, color-mix(in srgb, ${ws.accent} 55%, #000))` }}
                    >
                      {ws.name.slice(0, 2).toUpperCase()}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-[var(--text-primary)]">{ws.name}</span>
                      <span className="mt-0.5 block truncate text-[11px] text-[var(--text-muted)]">
                        {ws.department}
                        <span className="mx-1 opacity-40">·</span>
                        {ws.role}
                      </span>
                    </span>
                    {active ? (
                      <Check className="h-4 w-4 shrink-0 text-[var(--primary)]" />
                    ) : (
                      <span
                        className="shrink-0 rounded-full px-2 py-0.5 text-[9px] font-semibold"
                        style={{
                          color: ws.accent,
                          background: `color-mix(in srgb, ${ws.accent} 14%, transparent)`,
                          border: `1px solid color-mix(in srgb, ${ws.accent} 28%, transparent)`,
                        }}
                      >
                        {ws.role}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
            <div className="border-t border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-2">
              <Link
                href="/onboarding"
                onClick={() => setWsOpen(false)}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-[var(--text-secondary)] transition hover:bg-[var(--bg-surface-hover)] hover:text-[var(--text-primary)]"
              >
                <Settings className="h-4 w-4 shrink-0" />
                <span className="truncate">{organization.onboarded ? t('common.reconfigureOrg') : t('common.completeSetup')}</span>
              </Link>
            </div>
          </Dropdown>
        </div>
      </div>

      <button onClick={() => setCommandPaletteOpen(true)} className="hidden flex-1 max-w-2xl items-center gap-3 rounded-full border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-5 py-2.5 text-left transition hover:border-[var(--border-medium)] md:flex md:mx-8">
        <Search className="h-4 w-4 text-[var(--text-muted)]" />
        <span className="flex-1 text-sm text-[var(--text-muted)]">{t('common.search')}</span>
        <kbd className="rounded-md border border-[var(--border-subtle)] px-2 py-0.5 text-[10px] text-[var(--text-muted)]">⌘K</kbd>
      </button>

      <div className="flex items-center gap-2 md:gap-3">
        <LanguageSwitcher />
        <button onClick={toggleTheme} className="rounded-full p-2 transition hover:bg-[var(--bg-surface-hover)]" aria-label={t('topbar.toggleTheme')}>
          {theme === 'dark' ? <Sun className="h-5 w-5 text-[var(--text-muted)]" /> : <Moon className="h-5 w-5 text-[var(--text-muted)]" />}
        </button>
        <button className="hidden rounded-full p-2 transition hover:bg-[var(--bg-surface-hover)] sm:block"><Star className="h-5 w-5 text-[var(--text-muted)]" /></button>
        <button className="hidden rounded-full p-2 transition hover:bg-[var(--bg-surface-hover)] sm:block"><Calendar className="h-5 w-5 text-[var(--text-muted)]" /></button>

        <div className="relative">
          <button onClick={() => { setNotifOpen(!notifOpen); setProfileOpen(false) }} className="relative rounded-full p-2 transition hover:bg-[var(--bg-surface-hover)]" aria-label={t('common.notifications')}>
            <Bell className="h-5 w-5 text-[var(--text-muted)]" />
            {unreadCount > 0 && <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--danger)] text-[9px] font-bold text-white">{unreadCount}</span>}
          </button>
          <Dropdown open={notifOpen} onClose={() => setNotifOpen(false)} className="w-80 p-2">
            <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">{t('common.notifications')}</p>
            {notifications.length === 0 ? (
              <p className="px-3 py-4 text-center text-xs text-[var(--text-muted)]">Portfolio stable — no alerts.</p>
            ) : notifications.map((n) => (
              <div key={n.id} className={`rounded-xl px-3 py-2.5 transition hover:bg-[var(--bg-surface-hover)] ${n.severity === 'high' ? 'bg-[var(--danger-muted)]' : n.severity === 'medium' ? 'bg-[var(--bg-surface)]' : ''}`}>
                <p className="text-sm text-[var(--text-primary)]">{n.title}</p>
                <p className="mt-0.5 text-[10px] text-[var(--text-muted)]">{n.time} · {n.source}</p>
              </div>
            ))}
          </Dropdown>
        </div>

        <div className="relative">
          <button onClick={() => { setProfileOpen(!profileOpen); setNotifOpen(false) }} className="flex items-center gap-3 rounded-full py-1 pl-1 pr-2 transition hover:bg-[var(--bg-surface-hover)]">
            <div className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border-subtle)] bg-gradient-to-br from-[var(--primary)]/30 to-[var(--secondary)]/30 text-xs font-bold text-[var(--text-primary)]">
              {user ? user.firstName[0] : 'G'}
            </div>
            <div className="hidden text-right lg:block">
              <p className="text-sm font-semibold text-[var(--text-primary)]">{name}</p>
              <p className="text-[10px] font-medium text-[var(--text-muted)]">{role}</p>
            </div>
            <ChevronDown className="hidden h-4 w-4 text-[var(--text-muted)] lg:block" />
          </button>
          <Dropdown open={profileOpen} onClose={() => setProfileOpen(false)} className="w-56 p-2">
            <div className="border-b border-[var(--border-subtle)] px-3 py-3">
              <p className="text-sm font-semibold text-[var(--text-primary)]">{name}</p>
              <p className="text-xs text-[var(--text-muted)]">{email}</p>
            </div>
            <Link href="/dashboard/settings" onClick={() => setProfileOpen(false)} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-[var(--text-secondary)] transition hover:bg-[var(--bg-surface-hover)] hover:text-[var(--text-primary)]">
              <User className="h-4 w-4" />{t('topbar.profile')}
            </Link>
            <Link href="/dashboard/settings" onClick={() => setProfileOpen(false)} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-[var(--text-secondary)] transition hover:bg-[var(--bg-surface-hover)] hover:text-[var(--text-primary)]">
              <Settings className="h-4 w-4" />{t('topbar.settings')}
            </Link>
            <button onClick={() => { setProfileOpen(false); logout() }} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-[var(--text-secondary)] transition hover:bg-[var(--bg-surface-hover)] hover:text-[var(--text-primary)]">
              <LogOut className="h-4 w-4" />{t('topbar.logout')}
            </button>
          </Dropdown>
        </div>
      </div>
    </header>
  )
}
