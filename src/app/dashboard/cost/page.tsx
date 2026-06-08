'use client'

import { useEffect, useState } from 'react'
import { DollarSign } from 'lucide-react'
import PageHeader from '@/components/layout/PageHeader'
import MotionCard from '@/components/motion/MotionCard'
import AreaChartPremium, { type AreaPoint } from '@/components/charts/AreaChartPremium'
import { useChartColors } from '@/components/charts/useChartColors'
import { fetchCostForecast, type ForecastData } from '@/services/forecast'

export default function CostPage() {
  const colors = useChartColors()
  const [forecast, setForecast] = useState<ForecastData | null>(null)

  useEffect(() => {
    fetchCostForecast().then(setForecast)
  }, [])

  const series: AreaPoint[] = forecast ? forecast.points.map((p) => ({ label: p.month, value: p.value })) : []

  const stats = forecast
    ? [
        { label: 'Projected Total', value: forecast.projectedTotal },
        { label: 'Confidence', value: `${forecast.confidence}%` },
        { label: 'Savings Opportunity', value: forecast.savingsOpportunity },
      ]
    : []

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
            {series.length > 0 ? (
              <AreaChartPremium data={series} color={colors.primary} height={300} showAxis showGrid valuePrefix="$" valueSuffix="K" />
            ) : (
              <div className="h-[300px] animate-pulse-soft rounded-xl bg-[var(--bg-surface)]" />
            )}
          </div>
        </div>
      </MotionCard>
    </div>
  )
}
