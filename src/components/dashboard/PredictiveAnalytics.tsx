'use client'

import { useEffect, useState } from 'react'
import { TrendingUp } from 'lucide-react'
import AreaChartPremium, { type AreaPoint } from '@/components/charts/AreaChartPremium'
import { useChartColors } from '@/components/charts/useChartColors'
import { fetchAnalyticsSummary, type AnalyticsSummary } from '@/services/analytics'

export default function PredictiveAnalytics() {
  const colors = useChartColors()
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null)

  useEffect(() => {
    fetchAnalyticsSummary().then(setSummary)
  }, [])

  const data: AreaPoint[] = summary
    ? summary.data.map((p) => ({ label: p.month, value: p.value }))
    : []

  return (
    <div className="glass-panel-strong flex h-full flex-col rounded-3xl p-6">
      <div className="flex items-center justify-between">
        <p className="section-title">Predictive Analytics</p>
        <span className="rounded-full border border-[var(--border-subtle)] px-2 py-0.5 text-[9px] font-medium tracking-wider text-[var(--text-muted)]">
          {summary?.period ?? '12 months'}
        </span>
      </div>

      <div className="mt-4">
        <p className="text-xs text-[var(--text-muted)]">Cost Forecast</p>
        <p className="mt-1 text-2xl font-bold tracking-tight text-[var(--text-primary)]">
          {summary?.projectedCost ?? '—'}
        </p>
      </div>

      <div className="mt-3 flex-1">
        {data.length > 0 ? (
          <AreaChartPremium data={data} color={colors.secondary} height={110} valuePrefix="$" valueSuffix="K" />
        ) : (
          <div className="h-[110px] w-full animate-pulse-soft rounded-xl bg-[var(--bg-surface)]" />
        )}
      </div>

      <div className="mt-3 flex items-center justify-between">
        <span className="text-[10px] text-[var(--text-muted)]">vs current plan</span>
        <span className="flex items-center gap-1 text-[10px] font-bold text-[var(--success)]">
          <TrendingUp className="h-3 w-3" />
          +{summary?.trend ?? 0}%
        </span>
      </div>
    </div>
  )
}
