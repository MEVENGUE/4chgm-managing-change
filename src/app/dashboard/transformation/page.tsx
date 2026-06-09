'use client'

import dynamic from 'next/dynamic'
import { RefreshCw } from 'lucide-react'
import PageHeader from '@/components/layout/PageHeader'
import MotionCard from '@/components/motion/MotionCard'
import InitiativesPanel from '@/components/dashboard/InitiativesPanel'
import ImpactDistribution from '@/components/dashboard/ImpactDistribution'
import { usePortfolioDashboard } from '@/hooks/usePortfolioDashboard'

const AIGlobe = dynamic(() => import('@/components/three/AIGlobe'), { ssr: false })

export default function TransformationPage() {
  const { data, ready } = usePortfolioDashboard()
  const o = data.overview

  const stats = [
    { label: 'People Impacted', value: o.peopleImpacted.toLocaleString() },
    { label: 'On Track', value: `${o.projectsOnTrack}/${o.projectsTotal}` },
    { label: 'At Risk', value: o.atRisk, color: 'var(--danger)' },
    { label: 'Completed', value: o.completed, color: 'var(--success)' },
  ]

  if (!ready) {
    return <div className="h-64 animate-pulse-soft rounded-3xl bg-[var(--bg-surface)]" />
  }

  return (
    <div className="space-y-6">
      <PageHeader icon={RefreshCw} title="Transformation Hub" subtitle="Enterprise-wide change and impact overview" />

      <section className="grid auto-rows-fr grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
        {stats.map((s, i) => (
          <MotionCard key={s.label} delay={i * 0.05} fill className="glass-panel-strong rounded-3xl p-5">
            <p className="kpi-label">{s.label}</p>
            <p className="kpi-value mt-3" style={s.color ? { color: s.color } : undefined}>{s.value}</p>
          </MotionCard>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-3 lg:items-start">
        <MotionCard delay={0.1} className="lg:col-span-2">
          <div className="glass-panel-strong relative flex items-center justify-center rounded-3xl p-6" style={{ height: 360 }}>
            <AIGlobe />
          </div>
        </MotionCard>
        <MotionCard delay={0.15}>
          <ImpactDistribution segments={o.impactDistribution} total={o.peopleImpacted.toLocaleString()} />
        </MotionCard>
      </section>

      <MotionCard delay={0.2} fillChild>
        <InitiativesPanel initiatives={data.initiatives} />
      </MotionCard>
    </div>
  )
}
