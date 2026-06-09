'use client'

import { ShieldAlert } from 'lucide-react'
import PageHeader from '@/components/layout/PageHeader'
import MotionCard from '@/components/motion/MotionCard'
import InsightsPanel from '@/components/dashboard/InsightsPanel'
import ImpactDistribution from '@/components/dashboard/ImpactDistribution'
import { usePortfolioDashboard } from '@/hooks/usePortfolioDashboard'

export default function RisksPage() {
  const { data, intel, ready } = usePortfolioDashboard()

  const stats = [
    { label: 'High Risk', value: intel.risks.high, color: 'var(--danger)' },
    { label: 'Medium Risk', value: intel.risks.medium, color: 'var(--warning)' },
    { label: 'Low Risk', value: intel.risks.low, color: 'var(--info)' },
  ]

  if (!ready) {
    return <div className="h-64 animate-pulse-soft rounded-3xl bg-[var(--bg-surface)]" />
  }

  return (
    <div className="space-y-6">
      <PageHeader icon={ShieldAlert} title="Risks & Impact" subtitle="Portfolio risk register and impact distribution" />

      <section className="grid auto-rows-fr grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-5">
        {stats.map((s, i) => (
          <MotionCard key={s.label} delay={i * 0.05} fill className="glass-panel-strong rounded-3xl p-5">
            <p className="kpi-label">{s.label}</p>
            <p className="kpi-value mt-3" style={{ color: s.color }}>{s.value}</p>
          </MotionCard>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-3 lg:items-start">
        <MotionCard delay={0.1} className="lg:col-span-2">
          <InsightsPanel insights={data.insights} />
        </MotionCard>
        <MotionCard delay={0.15}>
          <ImpactDistribution
            segments={data.overview.impactDistribution}
            total={data.overview.peopleImpacted.toLocaleString()}
          />
        </MotionCard>
      </section>
    </div>
  )
}
