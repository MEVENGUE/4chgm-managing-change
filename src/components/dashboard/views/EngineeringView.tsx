'use client'

import SprintProgress from '@/components/dashboard/SprintProgress'
import DevOpsPipeline from '@/components/dashboard/DevOpsPipeline'
import InsightFeed from '@/components/dashboard/InsightFeed'
import MotionCard from '@/components/motion/MotionCard'
import AreaChartPremium from '@/components/charts/AreaChartPremium'
import { useChartColors } from '@/components/charts/useChartColors'
import { usePortfolioDashboard } from '@/hooks/usePortfolioDashboard'
import { deriveDeploySeries, deriveDevOpsMetrics, deriveVelocitySeries } from '@/lib/portfolioDerived'
import type { DashboardData } from '@/types/dashboard'

const SEV = { high: 'var(--danger)', medium: 'var(--warning)', low: 'var(--info)' }

export default function EngineeringView({ data }: { data: DashboardData }) {
  const colors = useChartColors()
  const { initiatives, intel } = usePortfolioDashboard()
  const metrics = deriveDevOpsMetrics(initiatives).map((m, i) => ({
    ...m,
    tone: ['var(--success)', 'var(--secondary)', 'var(--warning)', 'var(--primary)'][i],
  }))
  const deploys = deriveDeploySeries(initiatives)
  const velocity = deriveVelocitySeries(initiatives)
  const incidents = intel.risks.topRisks.slice(0, 3).map((r, i) => ({
    id: String(i),
    title: `${r.name} · risk ${r.score}`,
    sev: r.score >= 70 ? 'high' : r.score >= 50 ? 'medium' : 'low',
    time: `${(i + 1) * 20}m ago`,
  }))

  return (
    <div className="space-y-5 md:space-y-6">
      <section className="grid auto-rows-fr grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
        {metrics.map((m, i) => (
          <MotionCard key={m.label} delay={i * 0.05} fill className="glass-panel-strong rounded-3xl p-5">
            <p className="kpi-label">{m.label}</p>
            <p className="kpi-value mt-2" style={{ color: m.tone }}>{m.value}</p>
          </MotionCard>
        ))}
      </section>

      <section className="grid gap-5 md:gap-6 lg:grid-cols-12 lg:items-start">
        <MotionCard delay={0.2} fillChild className="lg:col-span-7"><DevOpsPipeline stages={data.pipeline} /></MotionCard>
        <MotionCard delay={0.25} fillChild className="lg:col-span-5"><SprintProgress sprint={data.sprint} /></MotionCard>
      </section>

      <section className="grid gap-5 md:gap-6 lg:grid-cols-2">
        <MotionCard delay={0.3}>
          <div className="glass-panel-strong rounded-3xl p-6">
            <p className="section-title">Deployments (7d)</p>
            <div className="mt-4"><AreaChartPremium data={deploys} color={colors.success} height={220} showAxis showGrid /></div>
          </div>
        </MotionCard>
        <MotionCard delay={0.35}>
          <div className="glass-panel-strong rounded-3xl p-6">
            <p className="section-title">Velocity Trend</p>
            <div className="mt-4"><AreaChartPremium data={velocity} color={colors.secondary} height={220} showAxis showGrid /></div>
          </div>
        </MotionCard>
      </section>

      <section className="grid gap-5 md:gap-6 lg:grid-cols-2">
        <MotionCard delay={0.4} fillChild><InsightFeed title="Engineering Signals" /></MotionCard>
        <MotionCard delay={0.45}>
          <div className="glass-panel-strong rounded-3xl p-6">
            <p className="section-title">Active Incidents</p>
            <div className="mt-4 space-y-2.5">
              {(incidents.length ? incidents : [{ id: '0', title: 'No critical incidents', sev: 'low', time: 'now' }]).map((inc) => (
                <div key={inc.id} className="flex items-center gap-3 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-3">
                  <span className="h-2 w-2 rounded-full" style={{ background: SEV[inc.sev as keyof typeof SEV] }} />
                  <span className="flex-1 text-xs text-[var(--text-secondary)]">{inc.title}</span>
                  <span className="text-[10px] text-[var(--text-muted)]">{inc.time}</span>
                </div>
              ))}
            </div>
          </div>
        </MotionCard>
      </section>
    </div>
  )
}
