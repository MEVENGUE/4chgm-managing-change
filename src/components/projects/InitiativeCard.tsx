'use client'

import { motion } from 'framer-motion'
import { Link2, GitBranch } from 'lucide-react'
import { STATUS_META, healthScore, budgetUtilization, formatCurrency, type Initiative } from '@/types/projects'

export default function InitiativeCard({
  initiative,
  index,
  onClick,
}: {
  initiative: Initiative
  index: number
  onClick: () => void
}) {
  const status = STATUS_META[initiative.status]
  const health = healthScore(initiative)
  const util = budgetUtilization(initiative)
  const overBudget = util > 100

  return (
    <motion.button
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.04 }}
      onClick={onClick}
      className="glass-panel-strong hover-lift group flex flex-col rounded-3xl p-5 text-left"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-[var(--text-primary)]">{initiative.name}</p>
          <p className="mt-0.5 text-[11px] text-[var(--text-muted)]">{initiative.phase} · {initiative.owner}</p>
        </div>
        <span
          className="shrink-0 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider"
          style={{ color: status.color, background: `color-mix(in srgb, ${status.color} 14%, transparent)` }}
        >
          {status.label}
        </span>
      </div>

      <p className="mt-3 line-clamp-2 text-[11px] leading-relaxed text-[var(--text-muted)]">{initiative.description}</p>

      <div className="mt-4 space-y-3">
        <div>
          <div className="mb-1 flex items-center justify-between text-[10px] text-[var(--text-muted)]">
            <span>Progress</span>
            <span className="font-semibold text-[var(--text-secondary)]">{initiative.progress}%</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--bg-surface-strong)]">
            <div className="h-full rounded-full bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)]" style={{ width: `${initiative.progress}%` }} />
          </div>
        </div>

        <div>
          <div className="mb-1 flex items-center justify-between text-[10px] text-[var(--text-muted)]">
            <span>Budget</span>
            <span className="font-semibold" style={{ color: overBudget ? 'var(--danger)' : 'var(--text-secondary)' }}>
              {formatCurrency(initiative.budgetSpent)} / {formatCurrency(initiative.budgetPlanned)}
            </span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--bg-surface-strong)]">
            <div className="h-full rounded-full" style={{ width: `${Math.min(100, util)}%`, background: overBudget ? 'var(--danger)' : 'var(--success)' }} />
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-[var(--border-subtle)] pt-3">
        <div className="flex items-center gap-3 text-[10px]">
          <span className="flex items-center gap-1 text-[var(--text-muted)]">
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: initiative.riskScore > 60 ? 'var(--danger)' : initiative.riskScore > 35 ? 'var(--warning)' : 'var(--success)' }} />
            Risk {initiative.riskScore}
          </span>
          <span className="flex items-center gap-1 text-[var(--text-muted)]">
            <GitBranch className="h-3 w-3" /> Impact {initiative.impactScore}
          </span>
          {initiative.dependencies.length > 0 && (
            <span className="flex items-center gap-1 text-[var(--text-muted)]">
              <Link2 className="h-3 w-3" /> {initiative.dependencies.length}
            </span>
          )}
        </div>
        <span className="text-[10px] font-bold" style={{ color: health > 65 ? 'var(--success)' : health > 40 ? 'var(--warning)' : 'var(--danger)' }}>
          {health} health
        </span>
      </div>
    </motion.button>
  )
}
