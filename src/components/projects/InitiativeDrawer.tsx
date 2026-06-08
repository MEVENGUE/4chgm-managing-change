'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { X, Trash2, Link2, Calendar, User } from 'lucide-react'
import { useProjects } from '@/providers/ProjectsProvider'
import { STATUS_META, healthScore, budgetUtilization, formatCurrency, type Initiative } from '@/types/projects'

function ScoreRing({ value, label, color }: { value: number; label: string; color: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="relative flex h-16 w-16 items-center justify-center">
        <svg className="h-16 w-16 -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="42" fill="none" stroke="var(--border-subtle)" strokeWidth="9" />
          <circle cx="50" cy="50" r="42" fill="none" stroke={color} strokeWidth="9" strokeLinecap="round" strokeDasharray={`${(value / 100) * 264} 264`} />
        </svg>
        <span className="absolute text-sm font-bold text-[var(--text-primary)]">{value}</span>
      </div>
      <span className="mt-1 text-[10px] text-[var(--text-muted)]">{label}</span>
    </div>
  )
}

export default function InitiativeDrawer({ initiative, onClose }: { initiative: Initiative | null; onClose: () => void }) {
  const { getById, removeInitiative } = useProjects()
  const status = initiative ? STATUS_META[initiative.status] : null

  return (
    <AnimatePresence>
      {initiative && status && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex justify-end bg-[var(--bg-overlay)] backdrop-blur-md"
          onClick={onClose}
        >
          <motion.div
            initial={{ x: 60, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 60, opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={(e) => e.stopPropagation()}
            className="h-full w-full max-w-md overflow-y-auto scrollbar-hide border-l border-[var(--border-medium)] bg-[var(--bg-elevated)] p-6"
          >
            <div className="flex items-start justify-between">
              <span className="rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider" style={{ color: status.color, background: `color-mix(in srgb, ${status.color} 14%, transparent)` }}>
                {status.label}
              </span>
              <button onClick={onClose} aria-label="Fermer" className="rounded-full p-1.5 transition hover:bg-[var(--bg-surface-hover)]">
                <X className="h-4 w-4 text-[var(--text-muted)]" />
              </button>
            </div>

            <h2 className="mt-3 text-xl font-bold text-[var(--text-primary)]">{initiative.name}</h2>
            <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">{initiative.description}</p>

            <div className="mt-4 flex flex-wrap gap-3 text-xs text-[var(--text-secondary)]">
              <span className="flex items-center gap-1.5"><User className="h-3.5 w-3.5 text-[var(--text-muted)]" /> {initiative.owner}</span>
              <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5 text-[var(--text-muted)]" /> {initiative.startDate} → {initiative.dueDate}</span>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-2 rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4">
              <ScoreRing value={healthScore(initiative)} label="Health" color="var(--primary)" />
              <ScoreRing value={initiative.riskScore} label="Risk" color="var(--danger)" />
              <ScoreRing value={initiative.impactScore} label="Impact" color="var(--success)" />
            </div>

            <div className="mt-4 space-y-3 rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[var(--text-muted)]">Progress</span>
                <span className="font-semibold text-[var(--text-primary)]">{initiative.progress}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--bg-surface-strong)]">
                <div className="h-full rounded-full bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)]" style={{ width: `${initiative.progress}%` }} />
              </div>
              <div className="flex items-center justify-between pt-1 text-xs">
                <span className="text-[var(--text-muted)]">Budget</span>
                <span className="font-semibold text-[var(--text-primary)]">{formatCurrency(initiative.budgetSpent)} / {formatCurrency(initiative.budgetPlanned)} ({budgetUtilization(initiative)}%)</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--bg-surface-strong)]">
                <div className="h-full rounded-full" style={{ width: `${Math.min(100, budgetUtilization(initiative))}%`, background: budgetUtilization(initiative) > 100 ? 'var(--danger)' : 'var(--success)' }} />
              </div>
            </div>

            <div className="mt-4 rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4">
              <p className="section-title mb-3">Dependencies</p>
              {initiative.dependencies.length === 0 ? (
                <p className="text-xs text-[var(--text-muted)]">No dependencies — this initiative can proceed independently.</p>
              ) : (
                <div className="space-y-2">
                  {initiative.dependencies.map((depId) => {
                    const dep = getById(depId)
                    return (
                      <div key={depId} className="flex items-center gap-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-strong)] px-3 py-2">
                        <Link2 className="h-3.5 w-3.5 text-[var(--primary)]" />
                        <span className="text-xs text-[var(--text-secondary)]">{dep?.name ?? 'Unknown initiative'}</span>
                        {dep && <span className="ml-auto text-[10px]" style={{ color: STATUS_META[dep.status].color }}>{STATUS_META[dep.status].label}</span>}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {initiative.tags.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-1.5">
                {initiative.tags.map((t) => (
                  <span key={t} className="pill">{t}</span>
                ))}
              </div>
            )}

            <button
              onClick={() => { removeInitiative(initiative.id); onClose() }}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl border border-[var(--danger)]/40 bg-[var(--danger)]/10 px-4 py-2.5 text-sm font-medium text-[var(--danger)] transition hover:bg-[var(--danger)]/20"
            >
              <Trash2 className="h-4 w-4" /> Delete initiative
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
