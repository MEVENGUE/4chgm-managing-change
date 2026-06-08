'use client'

import { useEffect, useMemo, useState } from 'react'
import { BarChart3, Sparkles, TrendingUp, TrendingDown } from 'lucide-react'
import PageHeader from '@/components/layout/PageHeader'
import MotionCard from '@/components/motion/MotionCard'
import KpiCard from '@/components/dashboard/KpiCard'
import ImpactDistribution from '@/components/dashboard/ImpactDistribution'
import AreaChartPremium, { type AreaPoint } from '@/components/charts/AreaChartPremium'
import { useChartColors } from '@/components/charts/useChartColors'
import { useProjects } from '@/providers/ProjectsProvider'
import { buildDashboardFromPortfolio } from '@/lib/portfolioDashboard'
import { deriveAnalyticsMetrics, type AnalyticsMetricKey } from '@/lib/analyticsFromPortfolio'
import { getAllSources, KNOWLEDGE_UPDATED_EVENT } from '@/services/knowledge'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export default function AnalyticsPage() {
  const colors = useChartColors()
  const { initiatives } = useProjects()
  const [knowledgeCount, setKnowledgeCount] = useState(() => getAllSources().length)
  const [metric, setMetric] = useState<AnalyticsMetricKey>('cost')

  useEffect(() => {
    const refresh = () => setKnowledgeCount(getAllSources().length)
    window.addEventListener(KNOWLEDGE_UPDATED_EVENT, refresh)
    return () => window.removeEventListener(KNOWLEDGE_UPDATED_EVENT, refresh)
  }, [])

  const data = useMemo(
    () => buildDashboardFromPortfolio(initiatives, getAllSources()),
    [initiatives, knowledgeCount]
  )
  const metrics = useMemo(
    () => deriveAnalyticsMetrics(initiatives, knowledgeCount),
    [initiatives, knowledgeCount]
  )

  const m = metrics[metric]
  const series: AreaPoint[] = useMemo(() => m.values.map((v, i) => ({ label: MONTHS[i], value: v })), [m])
  const first = m.values[0]
  const last = m.values[m.values.length - 1]
  const change = Math.round(((last - first) / Math.max(1, first)) * 100)
  const toneColor = m.tone === 'primary' ? colors.primary : m.tone === 'secondary' ? colors.secondary : colors.success

  return (
    <div className="space-y-6">
      <PageHeader icon={BarChart3} title="Analytics & BI" subtitle="Métriques dérivées de vos projets et documents — mises à jour en temps réel" />

      <section className="grid auto-rows-fr grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
        {data.kpis.map((kpi, i) => (
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
                <span className="pill text-[9px]">Live · {initiatives.length} projets</span>
              </div>
              <div className="flex gap-1.5">
                {(Object.keys(metrics) as AnalyticsMetricKey[]).map((k) => (
                  <button
                    key={k}
                    onClick={() => setMetric(k)}
                    className="rounded-full border px-3 py-1 text-[11px] font-medium transition"
                    style={{
                      borderColor: metric === k ? 'var(--primary)' : 'var(--border-subtle)',
                      color: metric === k ? 'var(--text-primary)' : 'var(--text-muted)',
                      background: metric === k ? 'var(--bg-surface-strong)' : 'transparent',
                    }}
                  >
                    {metrics[k].label.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-6" style={{ height: 280 }}>
              <AreaChartPremium data={series} color={toneColor} />
            </div>
          </div>
        </MotionCard>

        <MotionCard delay={0.15}>
          <div className="glass-panel-strong rounded-3xl p-6">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[var(--primary)]" />
              <p className="section-title">AI Insight</p>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-[var(--text-secondary)]">{m.insight}</p>
            <ImpactDistribution segments={data.overview.impactDistribution} total={`${data.overview.peopleImpacted}`} compact />
          </div>
        </MotionCard>
      </section>
    </div>
  )
}
