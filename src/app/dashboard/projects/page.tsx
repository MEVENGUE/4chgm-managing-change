'use client'

import { useMemo, useState } from 'react'
import { FolderKanban, Plus } from 'lucide-react'
import PageHeader from '@/components/layout/PageHeader'
import InitiativeCard from '@/components/projects/InitiativeCard'
import InitiativeForm from '@/components/projects/InitiativeForm'
import InitiativeDrawer from '@/components/projects/InitiativeDrawer'
import { useProjects } from '@/providers/ProjectsProvider'
import { STATUS_META, healthScore, formatCurrency, type Initiative, type InitiativeStatus } from '@/types/projects'

const FILTERS: ('all' | InitiativeStatus)[] = ['all', 'on-track', 'at-risk', 'planning', 'completed', 'on-hold']

export default function ProjectsPage() {
  const { initiatives } = useProjects()
  const [formOpen, setFormOpen] = useState(false)
  const [selected, setSelected] = useState<Initiative | null>(null)
  const [filter, setFilter] = useState<'all' | InitiativeStatus>('all')

  const stats = useMemo(() => {
    const totalPlanned = initiatives.reduce((s, i) => s + i.budgetPlanned, 0)
    const totalSpent = initiatives.reduce((s, i) => s + i.budgetSpent, 0)
    const avgHealth = initiatives.length ? Math.round(initiatives.reduce((s, i) => s + healthScore(i), 0) / initiatives.length) : 0
    const atRisk = initiatives.filter((i) => i.status === 'at-risk').length
    return { totalPlanned, totalSpent, avgHealth, atRisk }
  }, [initiatives])

  const filtered = filter === 'all' ? initiatives : initiatives.filter((i) => i.status === filter)

  const summary = [
    { label: 'Initiatives', value: initiatives.length },
    { label: 'At Risk', value: stats.atRisk, color: 'var(--danger)' },
    { label: 'Budget Committed', value: `${formatCurrency(stats.totalSpent)} / ${formatCurrency(stats.totalPlanned)}` },
    { label: 'Avg Health', value: stats.avgHealth, color: stats.avgHealth > 60 ? 'var(--success)' : 'var(--warning)' },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        icon={FolderKanban}
        title="Projects & Transformation"
        subtitle="Initiative portfolio with dependency, risk and budget intelligence"
        actions={
          <button onClick={() => setFormOpen(true)} className="flex items-center gap-2 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] px-4 py-2 text-xs font-semibold text-white shadow-lg transition hover:opacity-90">
            <Plus className="h-4 w-4" /> New initiative
          </button>
        }
      />

      <section className="grid auto-rows-fr grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
        {summary.map((s) => (
          <div key={s.label} className="glass-panel-strong rounded-3xl p-5">
            <p className="kpi-label">{s.label}</p>
            <p className="kpi-value mt-2" style={s.color ? { color: s.color } : undefined}>{s.value}</p>
          </div>
        ))}
      </section>

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className="rounded-full border px-3.5 py-1.5 text-xs font-medium capitalize transition"
            style={{
              borderColor: filter === f ? 'var(--primary)' : 'var(--border-subtle)',
              background: filter === f ? 'color-mix(in srgb, var(--primary) 12%, transparent)' : 'var(--bg-surface)',
              color: filter === f ? 'var(--text-primary)' : 'var(--text-secondary)',
            }}
          >
            {f === 'all' ? 'All' : STATUS_META[f].label}
          </button>
        ))}
      </div>

      <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((i, idx) => (
          <InitiativeCard key={i.id} initiative={i} index={idx} onClick={() => setSelected(i)} />
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full rounded-3xl border border-dashed border-[var(--border-medium)] p-10 text-center text-sm text-[var(--text-muted)]">
            No initiatives in this view.
          </div>
        )}
      </section>

      <InitiativeForm open={formOpen} onClose={() => setFormOpen(false)} />
      <InitiativeDrawer initiative={selected} onClose={() => setSelected(null)} />
    </div>
  )
}
