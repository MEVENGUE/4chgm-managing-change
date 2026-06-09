'use client'

import { GitBranch } from 'lucide-react'
import PageHeader from '@/components/layout/PageHeader'
import MotionCard from '@/components/motion/MotionCard'
import DevOpsPipeline from '@/components/dashboard/DevOpsPipeline'
import AreaChartPremium from '@/components/charts/AreaChartPremium'
import { useChartColors } from '@/components/charts/useChartColors'
import { usePortfolioDashboard } from '@/hooks/usePortfolioDashboard'
import { deriveDeploySeries, deriveDevOpsMetrics } from '@/lib/portfolioDerived'

export default function DevOpsPage() {
  const colors = useChartColors()
  const { data, initiatives, ready } = usePortfolioDashboard()
  const metrics = deriveDevOpsMetrics(initiatives)
  const deploySeries = deriveDeploySeries(initiatives)

  if (!ready) {
    return <div className="h-64 animate-pulse-soft rounded-3xl bg-[var(--bg-surface)]" />
  }

  return (
    <div className="space-y-6">
      <PageHeader icon={GitBranch} title="DevOps Flow" subtitle="CI/CD pipeline health and delivery metrics" />

      <section className="grid auto-rows-fr grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
        {metrics.map((m, i) => (
          <MotionCard key={m.label} delay={i * 0.05} fill className="glass-panel-strong rounded-3xl p-5">
            <p className="kpi-label">{m.label}</p>
            <p className="kpi-value mt-3">{m.value}</p>
          </MotionCard>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-2 lg:items-start">
        <MotionCard delay={0.1} fillChild><DevOpsPipeline stages={data.pipeline} /></MotionCard>
        <MotionCard delay={0.15}>
          <div className="glass-panel-strong rounded-3xl p-6">
            <p className="section-title">Deployments (7 days)</p>
            <div className="mt-4">
              <AreaChartPremium data={deploySeries} color={colors.success} height={240} showAxis showGrid />
            </div>
          </div>
        </MotionCard>
      </section>
    </div>
  )
}
