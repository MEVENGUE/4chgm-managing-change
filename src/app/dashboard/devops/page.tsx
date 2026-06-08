'use client'

import { useEffect, useState } from 'react'
import { GitBranch } from 'lucide-react'
import PageHeader from '@/components/layout/PageHeader'
import MotionCard from '@/components/motion/MotionCard'
import DevOpsPipeline from '@/components/dashboard/DevOpsPipeline'
import AreaChartPremium, { type AreaPoint } from '@/components/charts/AreaChartPremium'
import { useChartColors } from '@/components/charts/useChartColors'
import { fetchDashboardData } from '@/services/dashboard'
import type { PipelineStage } from '@/types/dashboard'

const DEPLOY_SERIES: AreaPoint[] = [
  { label: 'Mon', value: 12 }, { label: 'Tue', value: 18 }, { label: 'Wed', value: 15 },
  { label: 'Thu', value: 22 }, { label: 'Fri', value: 28 }, { label: 'Sat', value: 9 }, { label: 'Sun', value: 6 },
]

const METRICS = [
  { label: 'Deploy Frequency', value: '14/day' },
  { label: 'Lead Time', value: '2.4h' },
  { label: 'Change Failure', value: '3.2%' },
  { label: 'MTTR', value: '18m' },
]

export default function DevOpsPage() {
  const colors = useChartColors()
  const [stages, setStages] = useState<PipelineStage[]>([])

  useEffect(() => {
    fetchDashboardData().then((d) => setStages(d.pipeline))
  }, [])

  return (
    <div className="space-y-6">
      <PageHeader icon={GitBranch} title="DevOps Flow" subtitle="CI/CD pipeline health and delivery metrics" />

      <section className="grid auto-rows-fr grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
        {METRICS.map((m, i) => (
          <MotionCard key={m.label} delay={i * 0.05} fill className="glass-panel-strong rounded-3xl p-5">
            <p className="kpi-label">{m.label}</p>
            <p className="kpi-value mt-3">{m.value}</p>
          </MotionCard>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-2 lg:items-start">
        <MotionCard delay={0.1} fillChild><DevOpsPipeline stages={stages.length ? stages : undefined} /></MotionCard>
        <MotionCard delay={0.15}>
          <div className="glass-panel-strong rounded-3xl p-6">
            <p className="section-title">Deployments (7 days)</p>
            <div className="mt-4">
              <AreaChartPremium data={DEPLOY_SERIES} color={colors.success} height={240} showAxis showGrid />
            </div>
          </div>
        </MotionCard>
      </section>
    </div>
  )
}
