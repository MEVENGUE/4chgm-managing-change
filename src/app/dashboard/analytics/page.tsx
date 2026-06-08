'use client'

import { useEffect, useMemo, useState } from 'react'
import { BarChart3, Sparkles, TrendingUp, TrendingDown } from 'lucide-react'
import PageHeader from '@/components/layout/PageHeader'
import MotionCard from '@/components/motion/MotionCard'
import KpiCard from '@/components/dashboard/KpiCard'
import ImpactDistribution from '@/components/dashboard/ImpactDistribution'
import AreaChartPremium, { type AreaPoint } from '@/components/charts/AreaChartPremium'
import { useChartColors } from '@/components/charts/useChartColors'
import { fetchDashboardData } from '@/services/dashboard'
import type { DashboardData } from '@/types/dashboard'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

type MetricKey = 'cost' | 'velocity' | 'adoption'

const METRICS: Record<MetricKey, { label: string; unit: string; prefix?: string; suffix?: string; values: number[]; tone: 'primary' | 'secondary' | 'success'; insight: string }> = {
  cost: {
    label: 'Cloud Cost', unit: '$K', prefix: '$', suffix: 'K', tone: 'primary',
    values: [320, 340, 355, 370, 385, 400, 410, 420, 425, 430, 432, 432],
    insight: 'Cost growth is decelerating — the last 3 months flattened to +0.5%, suggesting reserved-instance optimization is taking effect. Projected annualized spend stabilizes around $4.3M.',
  },
  velocity: {
    label: 'Velocity', unit: 'pts', suffix: ' pts', tone: 'secondary',
    values: [54, 58, 56, 61, 60, 64, 63, 66, 65, 68, 67, 70],
    insight: 'Velocity is up 7.3% over the trailing quarter with low variance, indicating a stable, predictable delivery cadence. Review cycle time is the main constraint on further gains.',
  },
  adoption: {
    label: 'Adoption', unit: '%', suffix: '%', tone: 'success',
    values: [40, 44, 49, 53, 58, 62, 66, 70, 73, 77, 80, 82],
    insight: 'Adoption is climbing steadily toward 82%, a strong leading indicator of transformation ROI. Engagement in Engineering and Product leads; HR is the next enablement target.',
  },
}

export default function AnalyticsPage() {
  const colors = useChartColors()
  const [data, setData] = useState<DashboardData | null>(null)
  const [metric, setMetric] = useState<MetricKey>('cost')

  useEffect(() => {
    fetchDashboardData().then(setData)
  }, [])

  const m = METRICS[metric]
  const series: AreaPoint[] = useMemo(() => m.values.map((v, i) => ({ label: MONTHS[i], value: v })), [m])
  const first = m.values[0]
  const last = m.values[m.values.length - 1]
  const change = Math.round(((last - first) / first) * 100)
  const toneColor = m.tone === 'primary' ? colors.primary : m.tone === 'secondary' ? colors.secondary : colors.success

  return (
    <div className="space-y-6">
      <PageHeader icon={BarChart3} title="Analytics & BI" subtitle="Cross-platform metrics, trends and AI-generated explanations" />

      <section className="grid auto-rows-fr grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
        {(data?.kpis ?? []).map((kpi, i) => (
          <KpiCard key={kpi.id} {...kpi} delay={i * 0.05} />
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-3 lg:items-start">
        <MotionCard delay={0.1} className="lg:col-span-2">
          <div className="glass-panel-strong rounded-3xl p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <p className="section-title">{m.label} Trend</p>
                <span className="flex items-center gap-1 text-xs font-semibold" style={{ color: change >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                  {change >= 0 ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                  {change >= 0 ? '+' : ''}{change}%
                </span>
              </div>
              <div className="flex gap-1.5">
                {(Object.keys(METRICS) as MetricKey[]).map((k) => (
                  <button
                    key={k}
                    onClick={() => setMetric(k)}
                    className="rounded-full border px-3 py-1 text-[11px] font-medium transition"
                    style={{
                      borderColor: metric === k ? 'var(--primary)' : 'var(--border-subtle)',
                      background: metric === k ? 'color-mix(in srgb, var(--primary) 12%, transparent)' : 'var(--bg-surface)',
                      color: metric === k ? 'var(--text-primary)' : 'var(--text-secondary)',
                    }}
                  >
                    {METRICS[k].label}
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-4">
              <AreaChartPremium data={series} color={toneColor} height={280} showAxis showGrid valuePrefix={m.prefix} valueSuffix={m.suffix} />
            </div>
            <div className="mt-4 flex items-start gap-3 rounded-2xl border border-[var(--border-subtle)] bg-gradient-to-r from-[var(--primary)]/8 to-transparent p-4">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)]">
                <Sparkles className="h-4 w-4 text-white" />
              </span>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--primary)]">AI Explanation</p>
                <p className="mt-1 text-xs leading-relaxed text-[var(--text-secondary)]">{m.insight}</p>
              </div>
            </div>
          </div>
        </MotionCard>
        <MotionCard delay={0.15}>
          {data && (
            <ImpactDistribution segments={data.overview.impactDistribution} total={data.overview.peopleImpacted.toLocaleString()} />
          )}
        </MotionCard>
      </section>
    </div>
  )
}
