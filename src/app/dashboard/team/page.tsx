'use client'

import { Users } from 'lucide-react'
import PageHeader from '@/components/layout/PageHeader'
import MotionCard from '@/components/motion/MotionCard'
import CollaborationPanel from '@/components/dashboard/CollaborationPanel'
import { usePortfolioDashboard } from '@/hooks/usePortfolioDashboard'
import { deriveCultureMetrics } from '@/lib/portfolioDerived'

export default function TeamPage() {
  const { data, intel, initiatives, ready } = usePortfolioDashboard()
  const culture = deriveCultureMetrics(initiatives, intel.analytics)

  if (!ready) {
    return <div className="h-64 animate-pulse-soft rounded-3xl bg-[var(--bg-surface)]" />
  }

  return (
    <div className="space-y-6">
      <PageHeader icon={Users} title="Team & Culture" subtitle="Adoption, engagement and collaboration signals" />

      <section className="grid auto-rows-fr grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
        {culture.map((c, i) => (
          <MotionCard key={c.label} delay={i * 0.05} fill className="glass-panel-strong rounded-3xl p-5">
            <p className="kpi-label">{c.label}</p>
            <p className="kpi-value mt-3">{c.value}%</p>
            <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-[var(--bg-surface-strong)]">
              <div className="h-full rounded-full bg-[var(--primary)]" style={{ width: `${c.value}%` }} />
            </div>
          </MotionCard>
        ))}
      </section>

      <MotionCard delay={0.15} fillChild>
        <CollaborationPanel events={data.collaboration} />
      </MotionCard>
    </div>
  )
}
