'use client'

import { useMemo } from 'react'
import { TrendingDown, TrendingUp } from 'lucide-react'
import InsightFeed from '@/components/dashboard/InsightFeed'
import MotionCard from '@/components/motion/MotionCard'
import AreaChartPremium, { type AreaPoint } from '@/components/charts/AreaChartPremium'
import { useChartColors } from '@/components/charts/useChartColors'
import { useProjects } from '@/providers/ProjectsProvider'
import { forecastPortfolio } from '@/lib/insights'
import { budgetUtilization, formatCurrency } from '@/types/projects'

const COST: AreaPoint[] = [
  { label: 'Q1', value: 980 }, { label: 'Q2', value: 1120 }, { label: 'Q3', value: 1260 }, { label: 'Q4', value: 1340 },
]

export default function FinanceView() {
  const colors = useChartColors()
  const { initiatives } = useProjects()
  const f = useMemo(() => forecastPortfolio(initiatives), [initiatives])

  const stats = [
    { label: 'Budget Committed', value: formatCurrency(f.totalSpent) },
    { label: 'Projected Total', value: formatCurrency(f.projectedTotal), tone: f.overrunPct > 0 ? 'var(--danger)' : 'var(--success)' },
    { label: 'Forecast Variance', value: `${f.overrunPct >= 0 ? '+' : ''}${f.overrunPct}%`, tone: f.overrunPct > 5 ? 'var(--danger)' : 'var(--warning)' },
    { label: 'Avg Health', value: f.avgHealth, tone: f.avgHealth > 60 ? 'var(--success)' : 'var(--warning)' },
  ]

  const sorted = [...initiatives].sort((a, b) => budgetUtilization(b) - budgetUtilization(a)).slice(0, 6)

  return (
    <div className="space-y-5 md:space-y-6">
      <section className="grid auto-rows-fr grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
        {stats.map((s, i) => (
          <MotionCard key={s.label} delay={i * 0.05} fill className="glass-panel-strong rounded-3xl p-5">
            <p className="kpi-label">{s.label}</p>
            <p className="kpi-value mt-2" style={s.tone ? { color: s.tone } : undefined}>{s.value}</p>
          </MotionCard>
        ))}
      </section>

      <section className="grid gap-5 md:gap-6 lg:grid-cols-3 lg:items-start">
        <MotionCard delay={0.2} className="lg:col-span-2">
          <div className="glass-panel-strong rounded-3xl p-6">
            <div className="flex items-center justify-between">
              <p className="section-title">Transformation Spend</p>
              <span className="flex items-center gap-1 text-xs font-semibold" style={{ color: f.overrunPct > 0 ? 'var(--danger)' : 'var(--success)' }}>
                {f.overrunPct > 0 ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                {f.overrunPct >= 0 ? '+' : ''}{f.overrunPct}% vs plan
              </span>
            </div>
            <div className="mt-4"><AreaChartPremium data={COST} color={colors.primary} height={250} showAxis showGrid valuePrefix="$" valueSuffix="K" /></div>
          </div>
        </MotionCard>
        <MotionCard delay={0.25} fillChild><InsightFeed title="Financial Signals" /></MotionCard>
      </section>

      <MotionCard delay={0.3}>
        <div className="glass-panel-strong rounded-3xl p-6">
          <p className="section-title">Budget Drift by Initiative</p>
          <div className="mt-4 space-y-3">
            {sorted.map((i) => {
              const util = budgetUtilization(i)
              const over = util > 100
              return (
                <div key={i.id}>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="truncate text-[var(--text-secondary)]">{i.name}</span>
                    <span className="font-semibold" style={{ color: over ? 'var(--danger)' : 'var(--text-secondary)' }}>
                      {formatCurrency(i.budgetSpent)} / {formatCurrency(i.budgetPlanned)} · {util}%
                    </span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--bg-surface-strong)]">
                    <div className="h-full rounded-full" style={{ width: `${Math.min(100, util)}%`, background: over ? 'var(--danger)' : 'var(--success)' }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </MotionCard>
    </div>
  )
}
