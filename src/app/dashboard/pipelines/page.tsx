'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Workflow, Check, Loader2, Circle, AlertTriangle, ArrowRight, RefreshCw } from 'lucide-react'
import PageHeader from '@/components/layout/PageHeader'
import { useTranslation } from '@/i18n/I18nProvider'
import { PIPELINES, SAMPLE_MAPPING, CANONICAL_FIELDS, type StageStatus, type FieldMapping } from '@/services/pipelines'

const STAGE_ICON: Record<StageStatus, typeof Check> = {
  done: Check,
  active: Loader2,
  pending: Circle,
  error: AlertTriangle,
}
const STAGE_COLOR: Record<StageStatus, string> = {
  done: 'var(--success)',
  active: 'var(--info)',
  pending: 'var(--text-muted)',
  error: 'var(--danger)',
}

function StageStrip({ stages }: { stages: { name: string; status: StageStatus }[] }) {
  return (
    <div className="flex items-center gap-1.5">
      {stages.map((s, i) => {
        const Icon = STAGE_ICON[s.status]
        const color = STAGE_COLOR[s.status]
        return (
          <div key={s.name} className="flex flex-1 items-center gap-1.5">
            <div className="flex flex-1 flex-col items-center gap-1">
              <span className="flex h-7 w-7 items-center justify-center rounded-full border" style={{ borderColor: color, background: `color-mix(in srgb, ${color} 12%, transparent)` }}>
                <Icon className={`h-3.5 w-3.5 ${s.status === 'active' ? 'animate-spin' : ''}`} style={{ color }} />
              </span>
              <span className="text-[9px] text-[var(--text-muted)]">{s.name}</span>
            </div>
            {i < stages.length - 1 && <div className="mb-4 h-px flex-1" style={{ background: 'var(--border-subtle)' }} />}
          </div>
        )
      })}
    </div>
  )
}

export default function PipelinesPage() {
  const { t } = useTranslation()
  const [mapping, setMapping] = useState<FieldMapping[]>(SAMPLE_MAPPING)

  const updateTarget = (id: string, target: string) =>
    setMapping((m) => m.map((row) => (row.id === id ? { ...row, target } : row)))

  const totalRecords = PIPELINES.reduce((s, p) => s + p.records, 0)
  const running = PIPELINES.filter((p) => p.status === 'running').length

  const stats = [
    { label: 'Active Pipelines', value: PIPELINES.length },
    { label: 'Running Now', value: running },
    { label: 'Records / day', value: totalRecords.toLocaleString() },
  ]

  return (
    <div className="space-y-6">
      <PageHeader icon={Workflow} title={t('nav.pipelines')} subtitle={t('pipelines.subtitle')} />

      <section className="grid gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <div key={s.label} className="glass-panel-strong rounded-3xl p-5">
            <p className="kpi-label">{s.label}</p>
            <p className="kpi-value mt-2">{s.value}</p>
          </div>
        ))}
      </section>

      <section className="space-y-4">
        {PIPELINES.map((p, i) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass-panel-strong rounded-3xl p-5"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl text-xs font-bold text-white" style={{ background: `linear-gradient(135deg, ${p.accent}, color-mix(in srgb, ${p.accent} 55%, #000))` }}>
                  {p.source.slice(0, 2)}
                </span>
                <div>
                  <p className="text-sm font-semibold text-[var(--text-primary)]">{p.source}</p>
                  <p className="text-[11px] text-[var(--text-muted)]">{p.schedule} · last run {p.lastRun}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[11px] text-[var(--text-muted)]">{p.records.toLocaleString()} records</span>
                <span
                  className="flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold"
                  style={{
                    color: p.status === 'attention' ? 'var(--danger)' : p.status === 'running' ? 'var(--info)' : 'var(--success)',
                    background: `color-mix(in srgb, ${p.status === 'attention' ? 'var(--danger)' : p.status === 'running' ? 'var(--info)' : 'var(--success)'} 12%, transparent)`,
                  }}
                >
                  <RefreshCw className={`h-3 w-3 ${p.status === 'running' ? 'animate-spin' : ''}`} />
                  {p.status}
                </span>
              </div>
            </div>
            <div className="mt-5">
              <StageStrip stages={p.stages} />
            </div>
          </motion.div>
        ))}
      </section>

      <section className="glass-panel-strong rounded-3xl p-6">
        <div className="flex items-center gap-2">
          <p className="section-title">Field Mapping</p>
          <span className="pill ml-1">Jira → 4CHGM</span>
        </div>
        <p className="mt-1 text-xs text-[var(--text-muted)]">Map source fields to the canonical 4CHGM data model. Changes apply on next sync.</p>

        <div className="mt-4 space-y-2">
          <div className="grid grid-cols-[1fr_1fr_auto_1fr] items-center gap-3 px-1 text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
            <span>Source field</span>
            <span>Sample value</span>
            <span />
            <span>{t('pipelines.canonicalField')}</span>
          </div>
          {mapping.map((row) => (
            <div key={row.id} className="grid grid-cols-[1fr_1fr_auto_1fr] items-center gap-3 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-3 py-2.5">
              <code className="truncate text-xs text-[var(--text-secondary)]">{row.source}</code>
              <span className="truncate text-xs text-[var(--text-muted)]">{row.sample}</span>
              <ArrowRight className="h-3.5 w-3.5 text-[var(--text-muted)]" />
              <select
                value={row.target}
                onChange={(e) => updateTarget(row.id, e.target.value)}
                className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-strong)] px-2.5 py-1.5 text-xs text-[var(--text-primary)] outline-none transition focus:border-[var(--primary)]"
              >
                {CANONICAL_FIELDS.map((f) => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
