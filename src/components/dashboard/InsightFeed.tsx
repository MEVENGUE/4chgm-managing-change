'use client'

import { AlertTriangle, TrendingDown, Link2, Activity, Sparkles, Brain } from 'lucide-react'
import { useIntelligence } from '@/providers/IntelligenceProvider'
import { kindLabel, type Insight, type InsightKind } from '@/lib/insights'

const KIND_ICON: Record<InsightKind, typeof AlertTriangle> = {
  risk: AlertTriangle,
  budget: TrendingDown,
  bottleneck: Link2,
  anomaly: Activity,
  positive: Sparkles,
}

const SEVERITY_COLOR = { high: 'var(--danger)', medium: 'var(--warning)', low: 'var(--success)' }

function InsightRow({ insight }: { insight: Insight }) {
  const Icon = KIND_ICON[insight.kind]
  const color = SEVERITY_COLOR[insight.severity]
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-3">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl" style={{ background: `color-mix(in srgb, ${color} 14%, transparent)` }}>
        <Icon className="h-4 w-4" style={{ color }} />
      </span>
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span className="rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider" style={{ color, background: `color-mix(in srgb, ${color} 12%, transparent)` }}>
            {kindLabel(insight.kind)}
          </span>
        </div>
        <p className="mt-1 text-xs font-semibold text-[var(--text-primary)]">{insight.title}</p>
        <p className="mt-0.5 text-[11px] leading-relaxed text-[var(--text-muted)]">{insight.detail}</p>
      </div>
    </div>
  )
}

export default function InsightFeed({ title = 'AI Insight Feed', limit = 6 }: { title?: string; limit?: number }) {
  const { insights: all } = useIntelligence()
  const insights = all.slice(0, limit)

  return (
    <div className="glass-panel-strong flex h-full flex-col rounded-3xl p-6">
      <div className="flex items-center gap-2">
        <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)]">
          <Brain className="h-3.5 w-3.5 text-white" />
        </span>
        <p className="section-title">{title}</p>
        <span className="ml-auto text-[10px] font-semibold text-[var(--text-muted)]">{insights.length} signals</span>
      </div>
      <div className="mt-4 flex-1 space-y-2.5 overflow-y-auto scrollbar-hide">
        {insights.length === 0 ? (
          <div className="flex h-full items-center justify-center text-center text-xs text-[var(--text-muted)]">
            No critical signals. Portfolio is stable.
          </div>
        ) : (
          insights.map((i) => <InsightRow key={i.id} insight={i} />)
        )}
      </div>
    </div>
  )
}
