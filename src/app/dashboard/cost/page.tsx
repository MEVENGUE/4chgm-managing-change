'use client'

import { useMemo } from 'react'
import { DollarSign } from 'lucide-react'
import PageHeader from '@/components/layout/PageHeader'
import MotionCard from '@/components/motion/MotionCard'
import AreaChartPremium from '@/components/charts/AreaChartPremium'
import { useChartColors } from '@/components/charts/useChartColors'
import { usePortfolioDashboard } from '@/hooks/usePortfolioDashboard'
import { buildCostForecastFromPortfolio } from '@/lib/portfolioDerived'

export default function CostPage() {
  const colors = useChartColors()
  const { initiatives, ready } = usePortfolioDashboard()
  const forecast = useMemo(() => buildCostForecastFromPortfolio(initiatives), [initiatives])
  const series = forecast.points.map((p) => ({ label: p.month, value: p.value }))

  const stats = [
    { label: 'Projected Total', value: forecast.projectedTotal },
    { label: 'Confidence', value: `${forecast.confidence}%` },
    { label: 'Savings Opportunity', value: forecast.savingsOpportunity },
  ]

  if (!ready) {
    return <div className="h-64 animate-pulse-soft rounded-3xl bg-[var(--bg-surface)]" />
  }

  return (
    <div className="space-y-6">
      <PageHeader icon={DollarSign} title="Cost Forecast" subtitle="Predictive financial modeling and savings analysis" />

      <section className="grid auto-rows-fr grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-5">
        {stats.map((s, i) => (
          <MotionCard key={s.label} delay={i * 0.05} fill className="glass-panel-strong rounded-3xl p-5">
            <p className="kpi-label">{s.label}</p>
            <p className="kpi-value mt-3">{s.value}</p>
          </MotionCard>
        ))}
      </section>

      <MotionCard delay={0.15}>
        <div className="glass-panel-strong rounded-3xl p-6">
          <p className="section-title">Quarterly Cost Projection</p>
          <div className="mt-4">
            <AreaChartPremium data={series} color={colors.primary} height={300} showAxis showGrid valuePrefix="$" valueSuffix="K" />
          </div>
        </div>
      </MotionCard>
    </div>
  )
}
