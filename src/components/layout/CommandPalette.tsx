'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { Search, ArrowRight, Sun, Moon, Sparkles, FolderPlus, Layers } from 'lucide-react'
import { NAV_ITEMS } from '@/lib/navigation'
import { useShell } from '@/providers/ShellProvider'
import { useTheme } from '@/providers/ThemeProvider'
import { useOrganization } from '@/providers/OrganizationProvider'
import { useTranslation } from '@/i18n/I18nProvider'

export default function CommandPalette() {
  const { commandPaletteOpen, setCommandPaletteOpen } = useShell()
  const { theme, toggleTheme } = useTheme()
  const { workspaces, activeWorkspace, setActiveWorkspace } = useOrganization()
  const { t } = useTranslation()
  const [query, setQuery] = useState('')
  const router = useRouter()

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setCommandPaletteOpen(!commandPaletteOpen)
      }
      if (e.key === 'Escape') setCommandPaletteOpen(false)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [commandPaletteOpen, setCommandPaletteOpen])

  const close = () => {
    setCommandPaletteOpen(false)
    setQuery('')
  }

  const navigate = (href: string) => {
    router.push(href)
    close()
  }

  const actions = useMemo(
    () => [
      { id: 'theme', label: theme === 'dark' ? t('commandPalette.switchLight') : t('commandPalette.switchDark'), icon: theme === 'dark' ? Sun : Moon, run: toggleTheme },
      { id: 'copilot', label: t('commandPalette.openCopilot'), icon: Sparkles, run: () => navigate('/dashboard/ai') },
      { id: 'diagram', label: t('commandPalette.generateDiagram'), icon: Sparkles, run: () => navigate('/dashboard/mermaid') },
      { id: 'initiative', label: t('commandPalette.newInitiative'), icon: FolderPlus, run: () => navigate('/dashboard/projects') },
      { id: 'about', label: 'About 4CHGM', icon: Sparkles, run: () => navigate('/about') },
      { id: 'contact', label: 'Contact', icon: Sparkles, run: () => navigate('/contact') },
      ...workspaces
        .filter((w) => w.id !== activeWorkspace?.id)
        .map((w) => ({
          id: `ws-${w.id}`,
          label: t('commandPalette.switchWorkspace', { name: w.name }),
          icon: Layers,
          run: () => { setActiveWorkspace(w.id); close() },
        })),
    ],
    [theme, workspaces, activeWorkspace, t, toggleTheme, navigate, setActiveWorkspace]
  )

  const navWithLabels = useMemo(() => NAV_ITEMS.map((item) => ({ ...item, label: t(item.key) })), [t])

  const q = query.toLowerCase()
  const filtered = navWithLabels.filter((item) => item.label.toLowerCase().includes(q))
  const filteredActions = actions.filter((a) => a.label.toLowerCase().includes(q))
  const empty = filtered.length === 0 && filteredActions.length === 0

  return (
    <AnimatePresence>
      {commandPaletteOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-60 bg-[var(--bg-overlay)] backdrop-blur-sm" onClick={() => setCommandPaletteOpen(false)} />
          <motion.div initial={{ opacity: 0, scale: 0.96, y: -20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: -20 }} transition={{ duration: 0.2 }} className="command-palette fixed left-1/2 top-[20%] z-60 w-full max-w-lg -translate-x-1/2 overflow-hidden">
            <div className="flex items-center gap-3 border-b border-[var(--border-subtle)] px-4 py-3">
              <Search className="h-5 w-5 text-[var(--text-muted)]" />
              <input autoFocus value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t('commandPalette.placeholder')} className="flex-1 bg-transparent text-sm text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)]" />
              <kbd className="hidden rounded-md border border-[var(--border-subtle)] px-2 py-0.5 text-[10px] text-[var(--text-muted)] sm:inline">ESC</kbd>
            </div>
            <div className="max-h-80 overflow-y-auto p-2">
              {empty ? (
                <p className="px-4 py-6 text-center text-sm text-[var(--text-muted)]">{t('common.noResults')}</p>
              ) : (
                <>
                  {filteredActions.length > 0 && (
                    <>
                      <p className="px-3 pt-1 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">{t('common.actions')}</p>
                      {filteredActions.map((a) => (
                        <button key={a.id} onClick={a.run} className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-left text-sm text-[var(--text-secondary)] transition hover:bg-[var(--bg-surface-hover)] hover:text-[var(--text-primary)]">
                          <a.icon className="h-4 w-4 text-[var(--text-muted)]" />
                          <span className="flex-1">{a.label}</span>
                          <ArrowRight className="h-3.5 w-3.5 opacity-0 transition group-hover:opacity-100" />
                        </button>
                      ))}
                    </>
                  )}
                  {filtered.length > 0 && (
                    <>
                      <p className="px-3 pt-2 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">{t('common.navigate')}</p>
                      {filtered.map((item) => (
                        <button key={item.href} onClick={() => navigate(item.href)} className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-left text-sm text-[var(--text-secondary)] transition hover:bg-[var(--bg-surface-hover)] hover:text-[var(--text-primary)]">
                          <item.icon className="h-4 w-4 text-[var(--text-muted)]" />
                          <span className="flex-1">{item.label}</span>
                          <ArrowRight className="h-3.5 w-3.5 opacity-0 transition group-hover:opacity-100" />
                        </button>
                      ))}
                    </>
                  )}
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
